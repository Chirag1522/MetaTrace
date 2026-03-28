#!/usr/bin/env python3
"""
tamper_audit.py
Comprehensive non-original-based forensic checks for images + optional local PyTorch SuSy model integration.

Outputs:  
 - report: <image>.tamper_report.json
 - images: <image>.ela.png, <image>.entropy.png

Dependencies:
  pip install pillow piexif exifread numpy scikit-image matplotlib torch torchvision
  # Optional:
  pip install opencv-python
"""

import sys
import os
import json
import datetime
from io import BytesIO
import math
import traceback

from PIL import Image, ImageChops
import numpy as np

# EXIF libs
import piexif
import exifread

# skimage
from skimage.filters import rank
from skimage.morphology import disk
from skimage.util import img_as_ubyte

# Optional OpenCV for copy-move
try:
    import cv2
    _HAS_CV2 = True
except Exception:
    _HAS_CV2 = False

# Optional torch for local SuSy model
try:
    import torch
    _HAS_TORCH = True
except Exception:
    _HAS_TORCH = False

# --------------------------
# Configuration / thresholds
# --------------------------
LOCAL_SUSY_PATH = "SuSy.pt"   # path to local SuSy model
USE_LOCAL_SUSY = False  # Disabled for production (model file not included in deployment)
COPYMOVE_MIN_MATCHES = 20
ELA_MEAN_SUSPICIOUS = 15.0
ELA_STD_SUSPICIOUS = 8.0
ENTROPY_MEAN_LOW = 15.0
ENTROPY_VAR_HIGH = 150.0
APPN_LARGE_THRESHOLD = 100000

# --------------------------
# Utility helpers
# --------------------------
def now_utc_iso():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

def read_bytes(path, length=64):
    with open(path, "rb") as f:
        head = f.read(length)
    return head

# --------------------------
# File / EXIF helpers
# --------------------------
def file_magic_check(path):
    header = read_bytes(path, 64)
    fsize = os.path.getsize(path)
    magic = {
        b'\xFF\xD8\xFF': 'jpeg',
        b'\x89PNG\r\n\x1a\n': 'png',
        b'GIF87a': 'gif',
        b'GIF89a': 'gif',
    }
    detected = None
    for sig, name in magic.items():
        if header.startswith(sig):
            detected = name
            break
    return {'magic_header': header[:32].hex(), 'detected_type': detected, 'filesize': fsize}

def safe_extract_exif_piexif(path):
    try:
        data = piexif.load(path)
    except Exception as e:
        return {'error': f'piexif.load_error: {e}'}
    if isinstance(data, (bytes, bytearray)):
        return {'error': 'piexif returned raw bytes (malformed EXIF structure)'}
    out = {}
    for ifd, tags in data.items():
        if not isinstance(tags, dict):
            continue
        out[ifd] = {}
        for tag, val in tags.items():
            try:
                tagname = piexif.TAGS.get(ifd, {}).get(tag, {}).get("name", str(tag))
            except Exception:
                tagname = str(tag)
            if isinstance(val, (bytes, bytearray)):
                try:
                    sval = val.decode('utf-8', errors='replace')
                except Exception:
                    sval = str(val)
            else:
                sval = val
            out[ifd][tagname] = sval
    return out

def safe_extract_exif_exifread(path):
    try:
        with open(path, 'rb') as f:
            tags = exifread.process_file(f, details=False)
        return {str(k): str(v) for k, v in tags.items()}
    except Exception as e:
        return {'error': f'exifread_error: {e}'}

def check_metadata_consistency(piexif_dict, exifread_dict):
    flags = []
    try:
        sw = None
        if isinstance(exifread_dict, dict):
            sw = exifread_dict.get('Image Software')
        if isinstance(piexif_dict, dict):
            sw = sw or (piexif_dict.get('0th', {}) or {}).get('Software')
        if sw:
            flags.append({'issue': 'software_tag_present', 'detail': str(sw)})

        make = None
        model = None
        if isinstance(piexif_dict, dict):
            zero = piexif_dict.get('0th', {}) or {}
            make = zero.get('Make')
            model = zero.get('Model')
            if isinstance(make, (bytes, bytearray)):
                make = make.decode(errors='ignore')
            if isinstance(model, (bytes, bytearray)):
                model = model.decode(errors='ignore')
        if make and sw and any(s in str(sw) for s in ['GIMP', 'Photoshop', 'Picasa', 'Pixlr', 'Paint.NET']):
            flags.append({'issue': 'software_and_camera_present', 'detail': f'make={make}, software={sw}'})

        dt = None
        if isinstance(piexif_dict, dict):
            exif_ifd = piexif_dict.get('Exif') or {}
            dt = exif_ifd.get('DateTimeOriginal') or exif_ifd.get('DateTimeDigitized')
            if isinstance(dt, (bytes, bytearray)):
                dt = dt.decode(errors='ignore')
        if not dt and isinstance(exifread_dict, dict):
            dt = exifread_dict.get('EXIF DateTimeOriginal') or exifread_dict.get('Image DateTime')
        if dt:
            flags.append({'issue': 'datetime_found', 'detail': str(dt)})

        if isinstance(piexif_dict, dict) and piexif_dict.get('GPS'):
            flags.append({'issue': 'gps_present', 'detail': 'GPS tags exist'})
    except Exception as e:
        flags.append({'issue': 'metadata_parse_error', 'detail': str(e)})
    return flags

# --------------------------
# Image forensic functions
# --------------------------
def load_image_rgb(path):
    img = Image.open(path)
    img.load()
    return img.convert('RGB')

def ela_image_and_stats(img, quality=90):
    buf = BytesIO()
    img.save(buf, format='JPEG', quality=quality)
    buf.seek(0)
    recompr = Image.open(buf).convert('RGB')
    diff = ImageChops.difference(img, recompr)
    arr = np.asarray(diff).astype(np.float32)
    maxv = arr.max()
    if maxv == 0:
        scaled = arr.astype(np.uint8)
    else:
        scaled = (arr * (255.0 / maxv)).clip(0,255).astype(np.uint8)
    ela_img = Image.fromarray(scaled)
    ela_gray = ela_img.convert('L')
    ela_arr = np.asarray(ela_gray).astype(np.float32)
    stats = {'mean': float(np.mean(ela_arr)), 'std': float(np.std(ela_arr)), 'max': float(np.max(ela_arr)), 'min': float(np.min(ela_arr))}
    return ela_img, stats

def entropy_map_and_stats(img, window_size=9):
    gray = img.convert('L')
    arr = np.asarray(gray)
    u8 = img_as_ubyte(arr)
    u8 = np.array(u8, copy=True)
    ent = rank.entropy(u8, disk(window_size//2))
    if ent.max() == 0:
        ent_norm = ent.astype(np.uint8)
    else:
        ent_norm = (ent.astype(np.float32) / ent.max() * 255.0).astype(np.uint8)
    ent_img = Image.fromarray(ent_norm)
    stats = {'mean': float(np.mean(ent_norm)), 'std': float(np.std(ent_norm)), 'max': float(np.max(ent_norm)), 'min': float(np.min(ent_norm))}
    return ent_img, stats

def parse_jpeg_structure(path):
    issues = []
    try:
        with open(path, 'rb') as f:
            data = f.read()
        if not data.startswith(b'\xFF\xD8'):
            issues.append('missing_SOI')
        if not data.endswith(b'\xFF\xD9'):
            issues.append('missing_EOI_or_truncated')
        eoi_idx = data.rfind(b'\xFF\xD9')
        if eoi_idx != -1 and eoi_idx < len(data) - 2:
            issues.append({'trailing_bytes_after_EOI': len(data) - (eoi_idx + 2)})
        i = 2
        L = len(data)
        while i + 4 < L:
            if data[i] != 0xFF:
                i += 1
                continue
            marker = data[i+1]
            if 0xE0 <= marker <= 0xEF:
                if i + 4 > L:
                    break
                length = int.from_bytes(data[i+2:i+4], 'big')
                if length > APPN_LARGE_THRESHOLD:
                    issues.append({'long_APPn_segment_at': i, 'length': length})
                i += 2 + length
            else:
                i += 2
    except Exception as e:
        issues.append({'error': str(e)})
    return issues

def check_thumbnail(piexif_dict, img):
    if not isinstance(piexif_dict, dict):
        return None
    try:
        thumb_bytes = piexif_dict.get('thumbnail')
    except Exception:
        thumb_bytes = None
    if not thumb_bytes:
        return None
    try:
        timg = Image.open(BytesIO(thumb_bytes)).convert('RGB')
        return {'thumb_size': timg.size, 'main_size': img.size, 'sizes_equal': timg.size == img.size}
    except Exception as e:
        return {'thumbnail_error': str(e)}

def simple_copy_move_detector(img):
    if not _HAS_CV2:
        return {'skipped': 'opencv not installed'}
    try:
        gray = np.asarray(img.convert('L'))
        orb = cv2.ORB_create(2000)
        kp, des = orb.detectAndCompute(gray, None)
        if des is None or len(kp) < 10:
            return {'status': 'insufficient_keypoints', 'kp_count': len(kp) if kp is not None else 0}
        bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
        matches = bf.match(des, des)
        useful = [m for m in matches if m.queryIdx != m.trainIdx]
        if len(useful) < COPYMOVE_MIN_MATCHES:
            return {'status': 'not_enough_matches', 'match_count': len(useful)}
        disps = []
        for m in useful:
            p1 = kp[m.queryIdx].pt
            p2 = kp[m.trainIdx].pt
            dx = int(round(p2[0] - p1[0]))
            dy = int(round(p2[1] - p1[1]))
            disps.append((dx, dy))
        from collections import Counter
        c = Counter(disps)
        (dxdy, count) = c.most_common(1)[0]
        if count >= COPYMOVE_MIN_MATCHES:
            return {'status': 'possible_copy_move', 'common_disp': dxdy, 'count': int(count)}
        return {'status': 'no_large_copy_move_cluster', 'most_common_count': int(count)}
    except Exception as e:
        return {'error': str(e)}

# --------------------------
# Local SuSy PyTorch model integration
# --------------------------
def run_susy_model(image_path, model_path=LOCAL_SUSY_PATH):
    if not _HAS_TORCH:
        return {'error': 'torch not installed'}
    if not os.path.exists(model_path):
        return {'error': f'SuSy model not found at {model_path}'}
    try:
        # Safe load for TorchScript or state_dict
        try:
            model = torch.load(model_path, map_location=torch.device('cpu'),weights_only=False)
            if hasattr(model, 'eval'):
                model.eval()
            else:
                return {'error': 'Loaded object is not a model'}
        except RuntimeError as re:
            return {'error': f'Failed to load model: {re}'}

        img = Image.open(image_path).convert("RGB")
        from torchvision import transforms
        preprocess = transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.ToTensor(),
            transforms.Normalize([0.5,0.5,0.5], [0.5,0.5,0.5])
        ])
        input_tensor = preprocess(img).unsqueeze(0)
        with torch.no_grad():
            output = model(input_tensor)
            probs = torch.softmax(output, dim=1)
            score, pred = torch.max(probs, dim=1)
        return {'prediction_index': int(pred.item()), 'confidence': float(score.item())}
    except Exception as e:
        return {'error': str(e), 'trace': traceback.format_exc()}

# --------------------------
# Integration & scoring
# --------------------------
def integrate_and_score(report):
    score = 100
    reasons = []
    checks = report.get('checks', {})

    exif_p = checks.get('exif_piexif')
    if isinstance(exif_p, dict) and 'error' in exif_p:
        score -= 10
        reasons.append(f"piexif_error: {exif_p.get('error')}")
    exif_r = checks.get('exif_exifread')
    if isinstance(exif_r, dict) and 'error' in exif_r:
        score -= 5
        reasons.append(f"exifread_error: {exif_r.get('error')}")

    for f in checks.get('metadata_flags', []):
        issue = f.get('issue')
        if issue == 'software_tag_present':
            score -= 30
            reasons.append(f"software tag present ({f.get('detail')})")
        if issue == 'software_and_camera_present':
            score -= 25
            reasons.append(f"camera + software present ({f.get('detail')})")
        if issue == 'gps_present':
            score -= 5
            reasons.append("gps present")

    struct = checks.get('structure')
    if struct:
        if isinstance(struct, list) and len(struct) > 0:
            score -= 25
            reasons.append(f"structure issues: {struct}")

    ela_stats = checks.get('ela_stats')
    if ela_stats:
        mean = ela_stats.get('mean', 0)
        std = ela_stats.get('std', 0)
        if mean > ELA_MEAN_SUSPICIOUS:
            delta = int(min(40, (mean - ELA_MEAN_SUSPICIOUS)))
            score -= delta
            reasons.append(f"high mean ELA: {mean:.2f}")
        if std > ELA_STD_SUSPICIOUS:
            score -= 5
            reasons.append(f"high ELA std: {std:.2f}")

    ent = checks.get('entropy_stats')
    if ent:
        if ent.get('mean') is not None:
            if ent['mean'] < ENTROPY_MEAN_LOW:
                score -= 20
                reasons.append(f"low entropy mean: {ent['mean']:.2f}")
            if ent.get('std') and ent['std'] > ENTROPY_VAR_HIGH:
                score -= 10
                reasons.append(f"high entropy variance: {ent['std']:.2f}")

    cm = checks.get('copy_move')
    if cm:
        if isinstance(cm, dict) and cm.get('status') == 'possible_copy_move':
            score -= 30
            reasons.append(f"possible copy-move: {cm.get('count')} matches (disp {cm.get('common_disp')})")

    ml = checks.get('hf_model')
    if ml and isinstance(ml, dict):
        if 'error' in ml:
            reasons.append(f"model_error: {ml.get('error')}")
        else:
            p = ml.get('confidence')
            if p and p > 0.7:
                score -= 40
                reasons.append(f"model flags suspicious with confidence {p:.2f}")

    score = max(0, min(100, score))
    return score, reasons

# --------------------------
# Main
# --------------------------
def main(path):
    if not os.path.exists(path):
        print("File not found:", path)
        return 2

    base = os.path.splitext(path)[0]
    report = {'file': path, 'scan_time': now_utc_iso(), 'checks': {}}

    print("-> Running file magic check")
    report['checks']['file_magic'] = file_magic_check(path)

    print("-> Extracting EXIF (piexif + exifread)")
    report['checks']['exif_piexif'] = safe_extract_exif_piexif(path)
    report['checks']['exif_exifread'] = safe_extract_exif_exifread(path)

    print("-> Metadata consistency checks")
    report['checks']['metadata_flags'] = check_metadata_consistency(report['checks']['exif_piexif'], report['checks']['exif_exifread'])

    print("-> Filesystem timestamps")
    try:
        st = os.stat(path)
        report['checks']['filesystem'] = {
            'size': st.st_size,
            'mtime': datetime.datetime.fromtimestamp(st.st_mtime).isoformat(),
            'ctime': datetime.datetime.fromtimestamp(st.st_ctime).isoformat(),
            'atime': datetime.datetime.fromtimestamp(st.st_atime).isoformat()
        }
    except Exception as e:
        report['checks']['filesystem'] = {'error': str(e)}

    print("-> JPEG structural analysis")
    report['checks']['structure'] = parse_jpeg_structure(path)

    try:
        img = load_image_rgb(path)
    except Exception as e:
        report['error'] = f'could_not_open_image: {e}'
        with open(base + '.tamper_report.json', 'w') as fh:
            json.dump(report, fh, indent=2, default=str)
        print("Wrote partial report due to image open error")
        return 1

    try:
        print("-> Computing ELA")
        ela_img, ela_stats = ela_image_and_stats(img, quality=90)
        ela_path = base + '.ela.png'
        ela_img.save(ela_path)
        report['checks']['ela_image'] = ela_path
        report['checks']['ela_stats'] = ela_stats
    except Exception as e:
        report['checks']['ela'] = {'error': str(e)}

    try:
        print("-> Computing entropy map")
        ent_img, ent_stats = entropy_map_and_stats(img, window_size=9)
        ent_path = base + '.entropy.png'
        ent_img.save(ent_path)
        report['checks']['entropy_image'] = ent_path
        report['checks']['entropy_stats'] = ent_stats
    except Exception as e:
        report['checks']['entropy'] = {'error': str(e)}

    try:
        thumb = check_thumbnail(report['checks']['exif_piexif'], img)
        if thumb:
            report['checks']['thumbnail'] = thumb
    except Exception as e:
        report['checks']['thumbnail'] = {'error': str(e)}

    try:
        if _HAS_CV2:
            print("-> Running ORB-based copy-move detector (OpenCV)")
        cm = simple_copy_move_detector(img)
        report['checks']['copy_move'] = cm
    except Exception as e:
        report['checks']['copy_move'] = {'error': str(e)}

    if USE_LOCAL_SUSY:
        print(f"-> Running local SuSy model '{LOCAL_SUSY_PATH}'")
        susy_res = run_susy_model(path)
        report['checks']['hf_model'] = susy_res
    else:
        report['checks']['hf_model'] = {'skipped': 'USE_LOCAL_SUSY=False'}

    print("-> Integrating results and scoring")
    score, reasons = integrate_and_score(report)
    report['summary'] = {'score_estimate_out_of_100': score, 'reasons': reasons}

    out_json = base + '.tamper_report.json'
    with open(out_json, 'w') as fh:
        json.dump(report, fh, indent=2, default=str)

    print(f"\n✅ Report written: {out_json}")
    print(f"Score: {score}/100")
    print(f"ELA: {base + '.ela.png'}  ENTROPY: {base + '.entropy.png'}")
    return 0

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python tamper_audit.py <image_path>")
        sys.exit(1)
    sys.exit(main(sys.argv[1]))

def analyze_image_for_anomalies(image_path):
    """Runs all forensic checks and returns a structured JSON report."""
    result = {}
    try:
        file_info = file_magic_check(image_path)
        result["file_info"] = file_info

        img = load_image_rgb(image_path)

        piexif_data = safe_extract_exif_piexif(image_path)
        exifread_data = safe_extract_exif_exifread(image_path)
        consistency_flags = check_metadata_consistency(piexif_data, exifread_data)

        ela_img, ela_stats = ela_image_and_stats(img)
        ent_img, ent_stats = entropy_map_and_stats(img)
        jpeg_issues = parse_jpeg_structure(image_path)
        copy_move_result = simple_copy_move_detector(img)
        susy_output = run_susy_model(image_path)

        # Basic anomaly scoring
        suspicious = False
        risk_level = "low"
        integrity_score = 100

        if ela_stats["mean"] > 15 or ela_stats["std"] > 8:
            suspicious = True
            risk_level = "medium"
            integrity_score -= 30

        if len(jpeg_issues) > 0 or "possible_copy_move" in str(copy_move_result):
            suspicious = True
            risk_level = "high"
            integrity_score -= 50

        result.update({
            "ela_stats": ela_stats,
            "entropy_stats": ent_stats,
            "jpeg_issues": jpeg_issues,
            "copy_move": copy_move_result,
            "metadata_flags": consistency_flags,
            "susy_output": susy_output,
            "anomaly_detected": suspicious,
            "risk_level": risk_level,
            "integrity_score": max(integrity_score, 0),
            "timestamp": now_utc_iso()
        })
    except Exception as e:
        result["error"] = str(e)
        result["traceback"] = traceback.format_exc()

    return result

