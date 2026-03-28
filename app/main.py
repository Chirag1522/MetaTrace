import os
import json
import hashlib
import re
import subprocess
import datetime
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
# web3 removed: blockchain uploading disabled in main.py
from groq import Groq  # ✅ Groq Llama integration
import tamper_audit as tamper_audit_module
from tamper_audit import analyze_image_for_anomalies

# ========== Configuration ==========
UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

RPC_URL = "https://rpc.api.moonbase.moonbeam.network"
CONTRACT_ADDRESS = "0xb51f74aa44AccD2d6fD0E8c0Bc78Af2c5819F197"
PRIVATE_KEY = "8d9043fe7be7c70134bc3849a314a545f4da8b0dc207a58b94ff6d20d3220652"

# Smart contract ABI
contract_abi = [
    {
        "inputs": [
            {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
            {"internalType": "string", "name": "jsonData", "type": "string"}
        ],
        "name": "storeMetadata",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
        ],
        "name": "getMetadata",
        "outputs": [
            {"internalType": "string", "name": "", "type": "string"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

# Blockchain uploading disabled in this build. The contract/web3 objects are not used.
contract = None

# ✅ Initialize Groq API with key from environment variable
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("❌ GROQ_API_KEY environment variable not set!")
groq_client = Groq(api_key=GROQ_API_KEY)

# ========== Middleware ==========
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== Helper Functions ==========
def calculate_file_hash(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()

def extract_metadata(file_path: str) -> dict:
    """Extract metadata using ExifTool (installed via Docker)."""
    try:
        result = subprocess.run(
            ["exiftool", "-json", file_path],
            capture_output=True,
            text=True,
            timeout=10,
            check=False,
        )
        if result.returncode == 0 and result.stdout:
            metadata_list = json.loads(result.stdout)
            print(f"✅ ExifTool extracted metadata successfully")
            return metadata_list[0] if metadata_list else {}
        else:
            print(f"⚠️ ExifTool warning: {result.stderr}")
            return {"source": "exiftool_failed", "error": result.stderr}
    except FileNotFoundError:
        print("❌ ExifTool not found - ensure Docker image has exiftool installed")
        return {"error": "exiftool_not_installed"}
    except subprocess.TimeoutExpired:
        print("⚠️ ExifTool extraction timed out")
        return {"error": "exiftool_timeout"}
    except json.JSONDecodeError as e:
        print(f"⚠️ ExifTool JSON decode error: {str(e)}")
        return {"error": "exiftool_json_invalid"}
    except Exception as e:
        print(f"⚠️ Metadata extraction error: {str(e)}")
        return {"error": str(e)}

def store_metadata_on_chain(metadata: dict) -> dict:
    """Blockchain uploading is disabled in this build.

    This stub exists so other code can call the function without error.
    """
    return {"skipped": "blockchain_disabled"}

def upload_forensic_images_to_pinata(base_path: str) -> dict:
    """Upload ELA and entropy images to Pinata IPFS."""
    pinata_urls = {}
    try:
        import requests
        
        # Get Pinata credentials from environment
        pinata_key = os.getenv("NEXT_PUBLIC_PINATA_API_KEY")
        pinata_secret = os.getenv("NEXT_PUBLIC_PINATA_SECRET_API_KEY")
        
        if not pinata_key or not pinata_secret:
            print("⚠️ Pinata credentials not found - skipping forensic image upload")
            return pinata_urls
        
        # Upload ELA image
        ela_path = base_path + '.ela.png'
        if os.path.exists(ela_path):
            try:
                with open(ela_path, 'rb') as f:
                    files = {'file': f}
                    headers = {
                        'pinata_api_key': pinata_key,
                        'pinata_secret_api_key': pinata_secret
                    }
                    response = requests.post(
                        'https://api.pinata.cloud/pinning/pinFileToIPFS',
                        files=files,
                        headers=headers,
                        timeout=30
                    )
                    if response.status_code == 200:
                        ipfs_hash = response.json().get('IpfsHash')
                        pinata_urls['ela_ipfs_hash'] = ipfs_hash
                        pinata_urls['ela_url'] = f"https://gateway.pinata.cloud/ipfs/{ipfs_hash}"
                        print(f"✅ ELA image uploaded to Pinata: {ipfs_hash}")
            except Exception as e:
                print(f"⚠️ Failed to upload ELA image to Pinata: {str(e)}")
        
        # Upload entropy image
        entropy_path = base_path + '.entropy.png'
        if os.path.exists(entropy_path):
            try:
                with open(entropy_path, 'rb') as f:
                    files = {'file': f}
                    headers = {
                        'pinata_api_key': pinata_key,
                        'pinata_secret_api_key': pinata_secret
                    }
                    response = requests.post(
                        'https://api.pinata.cloud/pinning/pinFileToIPFS',
                        files=files,
                        headers=headers,
                        timeout=30
                    )
                    if response.status_code == 200:
                        ipfs_hash = response.json().get('IpfsHash')
                        pinata_urls['entropy_ipfs_hash'] = ipfs_hash
                        pinata_urls['entropy_url'] = f"https://gateway.pinata.cloud/ipfs/{ipfs_hash}"
                        print(f"✅ Entropy image uploaded to Pinata: {ipfs_hash}")
            except Exception as e:
                print(f"⚠️ Failed to upload entropy image to Pinata: {str(e)}")
    
    except ImportError:
        print("⚠️ requests library not available")
    except Exception as e:
        print(f"⚠️ Error uploading forensic images: {str(e)}")
    
    return pinata_urls

# ========== API Endpoints ==========
@app.post("/upload/")
async def upload_file(file: UploadFile = File(...), email: str = Form(...)):
    """Handles file upload, metadata extraction, and blockchain storage."""
    print(f"📥 Processing upload: filename={file.filename}, email={email}, content_type={file.content_type}")
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        content = await file.read()
        print(f"✅ File read successfully. Size: {len(content)} bytes")
        file_hash = calculate_file_hash(content)

        with open(file_path, "wb") as buffer:
            buffer.write(content)

        # extract metadata with exiftool
        metadata = extract_metadata(file_path)

        # run the full tamper_audit pipeline (writes <image>.tamper_report.json)
        tamper_report = None
        report_path = None # Store path for /recommend
        try:
            # call the full main() in tamper_audit which produces the report file
            try:
                tamper_audit_module.main(file_path)
            except Exception:
                # if main() raises, fallback to lightweight analyzer
                pass

            # attempt to read the generated .tamper_report.json
            base = os.path.splitext(file_path)[0]
            report_path = base + '.tamper_report.json' # Define path
            if os.path.exists(report_path):
                try:
                    with open(report_path, 'r', encoding='utf-8') as fh:
                        tamper_report = json.load(fh)
                except Exception as e:
                    tamper_report = {"error": f"failed_to_read_report: {str(e)}"}
            else:
                report_path = None # Report wasn't created
                # fallback: run the programmatic analyzer
                try:
                    tamper_report = analyze_image_for_anomalies(file_path)
                except Exception as e:
                    tamper_report = {"error": f"tamper_analysis_failed: {str(e)}"}
        except Exception as e:
            tamper_report = {"error": f"tamper_pipeline_failed: {str(e)}"}

        # cleanup uploaded file (tamper analysis reads the file before this)
        try:
            os.remove(file_path)
        except Exception:
            pass

        metadata.update({
            "fileHash": file_hash,
            "originalFilename": file.filename,
            "uploaderEmail": email,
            "timestamp": str(datetime.datetime.utcnow())
        })
        
        # --- MODIFIED LOGIC ---
        # compute anomaly score and detected flag, attach to tamper_report and return values
        score_int = None
        anomaly_detected = None
        status_str = None
        try:
            if isinstance(tamper_report, dict):
                # 1. Prioritize the exact fields from the JSON report.
                score_val = tamper_report.get('anomaly_score')
                detected_val = tamper_report.get('anomaly_detected')
                status_str = tamper_report.get('status')

                # 2. Try to parse 'anomaly_score'
                if score_val is not None:
                    try:
                        score_int = int(score_val)
                    except Exception:
                        try:
                            score_int = int(float(score_val))
                        except Exception:
                            score_int = None
                
                # 3. Try to parse 'anomaly_detected'
                if isinstance(detected_val, bool):
                    anomaly_detected = detected_val
                
                # 4. Fallback: If fields were missing, calculate them.
                if score_int is None:
                    # Try to find a raw score to calculate from
                    score_raw = tamper_report.get('integrity_score') or (tamper_report.get('summary') or {}).get('score_estimate_out_of_100')
                    if score_raw is not None:
                        try:
                            score_int = int(score_raw)
                        except Exception:
                            try:
                                score_int = int(float(score_raw))
                            except Exception:
                                score_int = None
                
                if anomaly_detected is None:
                    # Calculate anomaly_detected based on the score (if we have one)
                    if score_int is not None:
                        anomaly_detected = False if score_int > 90 else True
                    else:
                        # Final fallback
                        anomaly_detected = False # Default to false if no info
                
                if status_str is None:
                     if score_int is not None:
                        status_str = 'normal' if score_int > 90 else 'red'
                     else:
                        status_str = 'red' if anomaly_detected else 'normal'

                # 5. Standardize fields *in* the report object for consistency
                tamper_report['anomaly_score'] = score_int
                tamper_report['anomaly_detected'] = anomaly_detected
                tamper_report['status'] = status_str

            # Print the final, trusted score
            if score_int is not None:
                print(f"Score: {score_int}/100")
                print(f"Anomaly Detected: {anomaly_detected}")
                print(f"Status: {status_str}")

        except Exception as e:
            # non-critical
            print(f"Error during score processing: {e}")
            score_int = None
            anomaly_detected = False
            status_str = "unknown"
        # --- END MODIFIED LOGIC ---

        # attach tamper report for frontend / storage
        metadata["tamper_report"] = tamper_report

        blockchain_response = store_metadata_on_chain(metadata)

        # ✅ Upload forensic images (ELA, entropy) to Pinata IPFS
        base = os.path.splitext(file_path)[0]
        forensic_images = upload_forensic_images_to_pinata(base)

        # Build a rich response including tamper report and anomaly fields
        response_content = {
            "message": "File uploaded and metadata extracted",
            "metadata": metadata,
            "tamper_report": tamper_report,
            "anomaly_score": score_int,
            "anomaly_detected": anomaly_detected,
            "status": status_str, # Add status to top-level response
            "tamper_report_path": report_path, # Pass the path for /recommend
            "forensic_images": forensic_images  # ✅ Add Pinata URLs for ELA and entropy
        }

        # If blockchain storage provided info, include it; if error, attach the error
        if isinstance(blockchain_response, dict):
            if blockchain_response.get('error'):
                response_content['blockchain_error'] = blockchain_response.get('error')
            else:
                response_content['blockchain'] = blockchain_response

        return JSONResponse(content=response_content, status_code=200)
    except Exception as e:
        print(f"❌ Upload Failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

# ✅ Groq-powered metadata analyzer
@app.post("/recommend")
async def recommend(metadata: dict): # Signature requires a JSON object
    """Analyze metadata for anomalies using Gemini AI."""
    try:
        if not metadata:
            return JSONResponse(content={"error": "No metadata provided"}, status_code=400)

        # --- CRITICAL FIX: Use nested tamper_report from metadata first ---
        loaded_report = None
        
        # PRIORITY 1: Check if tamper_report is already nested in metadata (from upload endpoint)
        if isinstance(metadata, dict) and 'tamper_report' in metadata:
            loaded_report = metadata.get('tamper_report')
            print(f"✅ Using nested tamper_report from metadata")
        
        # PRIORITY 2: Try to load from file path (fallback)
        if loaded_report is None:
            report_path_candidate = None
            try:
                report_path_candidate = metadata.get('tamper_report_path') or metadata.get('report_path')
                if isinstance(report_path_candidate, str):
                    report_path_candidate = os.path.normpath(report_path_candidate)
                else:
                    report_path_candidate = None
            except Exception:
                report_path_candidate = None
            
            if report_path_candidate:
                try:
                    if not os.path.normpath(report_path_candidate).startswith(os.path.normpath(UPLOAD_DIR)):
                        print(f"⚠️ Report path access denied: {report_path_candidate}")
                    elif os.path.exists(report_path_candidate):
                        with open(report_path_candidate, 'r', encoding='utf-8') as fh:
                            loaded_report = json.load(fh)
                        print(f"✅ Loaded report from file: {report_path_candidate}")
                    else:
                        print(f"⚠️ Report file not found: {report_path_candidate}")
                except Exception as e:
                    print(f"⚠️ Failed to load report file: {str(e)}")

        # If we found a report (nested or from file), extract its data; otherwise use metadata
        gemini_input = loaded_report if loaded_report is not None else metadata

        # ⚠️ CRITICAL: Extract forensic SOURCE OF TRUTH VALUES FIRST (before Groq call)
        # These will OVERRIDE whatever Groq returns - forensics are the authority
        actual_anomaly_detected = False
        actual_integrity_score = 75
        actual_status = "normal"
        actual_risk_level = "low"
        
        print(f"🔍 DEBUG: gemini_input type = {type(gemini_input).__name__}, keys = {list(gemini_input.keys()) if isinstance(gemini_input, dict) else 'N/A'}")
        
        # Direct extraction without nested complexity
        if isinstance(gemini_input, dict):
            # Try to get the anomaly score directly from multiple locations
            score_val = None
            
            # Location 1: anomaly_score field (most common)
            if 'anomaly_score' in gemini_input:
                score_val = gemini_input['anomaly_score']
                print(f"📊 Found anomaly_score: {score_val}")
            
            # Location 2: Inside nested tamper_report
            elif 'tamper_report' in gemini_input and isinstance(gemini_input['tamper_report'], dict):
                score_val = gemini_input['tamper_report'].get('anomaly_score')
                print(f"📊 Found in nested tamper_report.anomaly_score: {score_val}")
            
            # Location 3: Inside summary
            elif 'summary' in gemini_input and isinstance(gemini_input['summary'], dict):
                score_val = gemini_input['summary'].get('score_estimate_out_of_100')
                print(f"📊 Found in summary.score_estimate_out_of_100: {score_val}")
            
            # Location 4: integrity_score fallback
            elif 'integrity_score' in gemini_input:
                score_val = gemini_input['integrity_score']
                print(f"📊 Found integrity_score: {score_val}")
            
            # Now parse the score
            if score_val is not None:
                try:
                    actual_integrity_score = int(score_val)
                    print(f"✅ Successfully parsed score: {actual_integrity_score}")
                except (ValueError, TypeError):
                    try:
                        actual_integrity_score = int(float(str(score_val)))
                        print(f"✅ Parsed score via float conversion: {actual_integrity_score}")
                    except Exception as parse_error:
                        print(f"⚠️ Parse error for {score_val}: {parse_error}, using default 75")
                        actual_integrity_score = 75
            else:
                print(f"⚠️ No score found in any location, using default 75")
                actual_integrity_score = 75
            
            # ✅ SIMPLE RULE: score < 90 = tampered, >= 90 = clean
            if actual_integrity_score < 90:
                actual_anomaly_detected = True
                actual_status = 'red'
                actual_risk_level = 'high'
            else:
                actual_anomaly_detected = False
                actual_status = 'normal'
                actual_risk_level = 'low'
            
            print(f"🔴 SOURCE OF TRUTH FINAL: score={actual_integrity_score}, anomaly_detected={actual_anomaly_detected}, status={actual_status}")

        # Use the extracted values to build a strong hint for Groq
        score_hint = f"""🔴 VERDICT ALREADY DETERMINED:
Score: {actual_integrity_score}/100

Rule Applied:
- If score < 90: File is TAMPERED (anomaly_detected = true, risk = high)
- If score >= 90: File is CLEAN (anomaly_detected = false, risk = low)

Current: anomaly_detected = {str(actual_anomaly_detected).lower()}

Your job: Explain WHY the score is {actual_integrity_score}. Do NOT change the verdict."""

        metadata_str = json.dumps(gemini_input, indent=2)

        # Extract filename for prompt context
        report_filename = None
        if isinstance(metadata, dict):
            report_filename = metadata.get('originalFilename')

        # --- NEW PROMPT ---
        # This prompt is more explicit about the source of the JSON.
        if report_filename:
            report_source_description = f"You are analyzing the full JSON tamper report from the file `{report_filename}`."
        else:
            report_source_description = "You are analyzing the following JSON data, which includes a tamper report."

        prompt = f"""
You are a metadata forensics analyst. Your role is to EXPLAIN forensic findings, not make verdicts.

**VERDICT ALREADY DETERMINED by score-based rule:**
- Anomaly Score: {actual_integrity_score}/100
- Rule: If score < 90 → File is TAMPERED, If score >= 90 → File is CLEAN
- Current Status: {'TAMPERED (Red Alert)' if actual_anomaly_detected else 'CLEAN (No Issues)'}
- Risk Level: {actual_risk_level.upper()}

**Your role:**
1. DO NOT change the verdict above - it is final
2. Explain WHY the score is {actual_integrity_score}
3. List the forensic findings that led to this score
4. Provide recommendations based on the verdict

**Full Forensic Report:**
{metadata_str}

**REQUIRED JSON OUTPUT:**
{{
    "anomaly_detected": {str(actual_anomaly_detected).lower()},
    "risk_level": "{actual_risk_level}",
    "technical_analysis": "Explain the forensic score of {actual_integrity_score} and what it means",
    "recommendations": ["Action to take", "Best practice", "Next steps"],
    "integrity_score": {actual_integrity_score},
    "detailed_breakdown": {{
        "file_size": 50,
        "file_metadata_discrepancy": {actual_integrity_score},
        "image_resolution": 50,
        "image_hash": 50
    }},
    "metadata_summary": {{
        "brief_summary": {{
            "title": "File Properties Overview",
            "content": ["Extract 3 real properties from the forensic report"]
        }},
        "authenticity": {{
            "title": "Authenticity & Manipulation Analysis",
            "content": ["Explain findings for score {actual_integrity_score}", "What metadata issues were found", "Verdict: {'TAMPERED' if actual_anomaly_detected else 'AUTHENTIC'}"]
        }},
        "metadata_table": {{
            "title": "Metadata Analysis Table",
            "headers": ["Field", "Value", "Status"],
            "rows": [
                ["Anomaly Score", "{actual_integrity_score}", "{'High Risk' if actual_anomaly_detected else 'Low Risk'}"],
                ["Detected Issues", "{'Yes' if actual_anomaly_detected else 'No'}", "From score-based rule"],
                ["Verdict", "{'TAMPERED' if actual_anomaly_detected else 'AUTHENTIC'}", "Final"]
            ]
        }},
        "use_cases": {{
            "title": "Recommended Applications",
            "content": ["Image forensics tools", "Metadata validators"]
        }}
    }}
}}

**CRITICAL RULES:**
- anomaly_detected MUST be {str(actual_anomaly_detected).lower()} (do not change)
- integrity_score MUST be {actual_integrity_score} (do not change)
- risk_level MUST be "{actual_risk_level}" (do not change)
- Return ONLY valid JSON, no explanations outside brackets
"""
        # --- END NEW PROMPT ---

        print("🔹 Sending request to Groq LLM...")

        try:
            print("📤 Calling Groq API with prompt length:", len(prompt))
            # Call Groq API (fast, reliable)
            response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=2048
            )
            raw_response = response.choices[0].message.content.strip()
            print("✅ Groq API success! Response length:", len(raw_response))
            print("🔹 Raw Response:", raw_response[:200] + "..." if len(raw_response) > 200 else raw_response)
        except Exception as e:
            print(f"⚠️ Groq API error: {type(e).__name__}: {str(e)}")
            
            # Extract actual anomaly values from tamper report for fallback
            actual_anomaly_detected = False
            actual_integrity_score = 75
            actual_risk_level = "low"
            try:
                if isinstance(gemini_input, dict):
                    # Try nested tamper_report first
                    tr = gemini_input.get('tamper_report')
                    
                    # If not found, try direct access
                    if not isinstance(tr, dict):
                        tr = gemini_input
                    
                    if isinstance(tr, dict):
                        actual_anomaly_detected = tr.get('anomaly_detected', False)
                        
                        # Try to get score from any possible field
                        score_val = tr.get('anomaly_score')
                        if score_val is None:
                            score_val = tr.get('integrity_score')
                        if score_val is None:
                            score_val = (tr.get('summary') or {}).get('score_estimate_out_of_100')
                        
                        # Parse the score
                        if score_val is not None:
                            try:
                                actual_integrity_score = int(score_val)
                            except (ValueError, TypeError):
                                try:
                                    actual_integrity_score = int(float(score_val))
                                except (ValueError, TypeError):
                                    actual_integrity_score = 75
                        
                        # Recalculate based on score
                        if actual_integrity_score < 90:
                            actual_anomaly_detected = True
                            actual_risk_level = 'high'
                        else:
                            actual_anomaly_detected = False
                            actual_risk_level = 'low'
                        
                        print(f"✅ Fallback extraction: score={actual_integrity_score}, anomaly_detected={actual_anomaly_detected}")
            except Exception as ex:
                print(f"⚠️ Error in fallback extraction: {type(ex).__name__}: {str(ex)}")
            
            # Extract metadata for better fallback response
            metadata_summary = {"brief_summary": {"title": "File Properties Overview", "content": []}, 
                               "authenticity": {"title": "Authenticity & Manipulation Analysis", "content": []},
                               "metadata_table": {"title": "Metadata Analysis Table", "headers": ["Field", "Value", "Status"], "rows": []},
                               "use_cases": {"title": "Recommended Applications", "content": []}}
            
            try:
                if isinstance(gemini_input, dict):
                    # Extract basic properties from multiple possible locations
                    props = []
                    
                    # Try different locations for file info
                    filename = gemini_input.get('originalFilename') or gemini_input.get('FileName')
                    filesize = gemini_input.get('FileSize') or gemini_input.get('file_size')
                    mimetype = gemini_input.get('MIMEType') or gemini_input.get('mime_type')
                    width = gemini_input.get('ImageWidth') or gemini_input.get('image_width')
                    height = gemini_input.get('ImageHeight') or gemini_input.get('image_height')
                    
                    if filename:
                        props.append(f"Filename: {filename}")
                    if filesize:
                        props.append(f"Size: {filesize}")
                    if mimetype:
                        props.append(f"Type: {mimetype}")
                    if width and height:
                        props.append(f"Resolution: {width}x{height}")
                    
                    # Add more details from transcript
                    if gemini_input.get('FileType'):
                        props.append(f"Format: {gemini_input.get('FileType')}")
                    if gemini_input.get('EncodingProcess'):
                        props.append(f"Encoding: {gemini_input.get('EncodingProcess')}")
                    
                    if props:
                        metadata_summary["brief_summary"]["content"] = props[:3]  # Limit to 3 items
                    else:
                        metadata_summary["brief_summary"]["content"] = ["File analysis performed", "Forensic checks completed"]
                    
                    # Extract authenticity findings
                    auth_findings = []
                    tr = gemini_input.get('tamper_report') or {}
                    if isinstance(tr, dict):
                        if tr.get('anomaly_detected'):
                            auth_findings.append("⚠️ Anomalies detected in forensic analysis")
                        else:
                            auth_findings.append("✅ File appears authentic")
                        
                        # Add reasons from summary
                        summary_reasons = tr.get('summary', {}).get('reasons', [])
                        for reason in summary_reasons[:1]:  # Just first reason
                            auth_findings.append(f"Note: {str(reason)}")
                    
                    if not auth_findings:
                        if actual_anomaly_detected:
                            auth_findings = ["⚠️ Potential anomalies detected"]
                        else:
                            auth_findings = ["✅ File appears authentic"]
                    
                    metadata_summary["authenticity"]["content"] = auth_findings
                    
                    # Add recommended applications
                    if mimetype:
                        if 'image' in str(mimetype).lower():
                            metadata_summary["use_cases"]["content"] = ["Image viewer", "Photo editor", "Image analyzer"]
                        elif 'video' in str(mimetype).lower():
                            metadata_summary["use_cases"]["content"] = ["Video player", "Video editor"]
                        elif 'pdf' in str(mimetype).lower():
                            metadata_summary["use_cases"]["content"] = ["PDF viewer", "Document analyzer"]
                    
                    if not metadata_summary["use_cases"]["content"]:
                        metadata_summary["use_cases"]["content"] = ["File viewer", "Archive tool"]
                    
                    print(f"✅ Extracted metadata summary: {len(props)} properties, {len(auth_findings)} findings")
            except Exception as ex:
                print(f"⚠️ Error extracting fallback metadata: {str(ex)}")
                # Ensure we have at least some content
                metadata_summary["brief_summary"]["content"] = ["File analysis performed"]
                metadata_summary["authenticity"]["content"] = ["Forensic analysis unavailable"]
                metadata_summary["use_cases"]["content"] = ["File viewer"]
            
            # Return safe default response WITH ACTUAL DETECTION RESULTS
            return JSONResponse(content={
                "anomaly_detected": actual_anomaly_detected,  # ✅ USE REAL VALUE
                "risk_level": actual_risk_level,  # ✅ USE REAL VALUE
                "reason": "AI analysis unavailable. Results based on automated forensic checks.",
                "technical_analysis": "AI analysis unavailable. Results based on automated forensic checks.",
                "recommendations": ["Review the forensic analysis above", "Try manual inspection if needed"],
                "best_practices": ["Ensure files are from trusted sources", "Regularly verify file authenticity"],
                "integrity_score": int(actual_integrity_score),  # ✅ USE REAL VALUE
                "detailed_breakdown": {"file_size": 0, "file_metadata_discrepancy": 0, "image_resolution": 0, "image_hash": 0},
                "metadata_summary": metadata_summary
            }, status_code=200)

        # Extract JSON safely
        match = re.search(r"\{.*\}", raw_response, re.DOTALL)
        if match:
            raw_response = match.group(0)

        try:
            result = json.loads(raw_response)
        except json.JSONDecodeError:
            print("❌ Groq returned invalid JSON!")
            result = {}

        # ✅ FINAL RESPONSE: Always use extracted SOURCE OF TRUTH values
        # Override whatever Groq said - forensics are the authority
        final_response = {
            "anomaly_detected": actual_anomaly_detected,  # 🔴 FROM FORENSICS - NOT NEGOTIABLE
            "risk_level": actual_risk_level,  # 🔴 FROM FORENSICS - NOT NEGOTIABLE
            "integrity_score": int(actual_integrity_score),  # 🔴 FROM FORENSICS - NOT NEGOTIABLE
            "reason": result.get("reason") or result.get("technical_analysis") or "File analysis complete.",
            "technical_analysis": result.get("technical_analysis") or f"Forensic analysis detected score of {actual_integrity_score}. Status: {actual_status}",
            "recommendations": result.get("recommendations") or ["Review forensic findings above"],
            "best_practices": result.get("best_practices") or ["Ensure files from trusted sources", "Keep security updated"],
            "detailed_breakdown": result.get("detailed_breakdown") or {
                "file_size": 50,
                "file_metadata_discrepancy": actual_integrity_score,
                "image_resolution": 50,
                "image_hash": 50
            },
            "metadata_summary": result.get("metadata_summary") or {
                "brief_summary": {"title": "File Properties Overview", "content": ["Forensic analysis performed"]},
                "authenticity": {"title": "Authenticity & Manipulation Analysis", "content": [f"Anomaly score: {actual_integrity_score}"]},
                "metadata_table": {
                    "title": "Metadata Analysis Table",
                    "headers": ["Field", "Value", "Status"],
                    "rows": [
                        ["Anomaly Score", str(actual_integrity_score), "Indicates tampering likelihood"],
                        ["Anomalies Detected", "Yes" if actual_anomaly_detected else "No", "From forensic analysis"],
                        ["Status", actual_status.upper(), "Security verdict"]
                    ]
                },
                "use_cases": {"title": "Recommended Applications", "content": ["Forensics analyzer", "File validator"]}
            }
        }

        print(f"🔴 FINAL RESPONSE ENFORCED: anomaly_detected={final_response['anomaly_detected']}, risk_level={final_response['risk_level']}, score={final_response['integrity_score']}")
        return JSONResponse(content=final_response, status_code=200)

    except Exception as e:
        print(f"❌ Error in recommend endpoint: {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)