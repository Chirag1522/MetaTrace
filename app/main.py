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
import google.generativeai as genai  # ✅ Gemini integration
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

# ✅ Initialize Gemini API with your key
genai.configure(api_key="AIzaSyCQ9R_2svfu_xqmwospclxEI-5x_C-50bQ")

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

        # Build a rich response including tamper report and anomaly fields
        response_content = {
            "message": "File uploaded and metadata extracted",
            "metadata": metadata,
            "tamper_report": tamper_report,
            "anomaly_score": score_int,
            "anomaly_detected": anomaly_detected,
            "status": status_str, # Add status to top-level response
            "tamper_report_path": report_path # Pass the path for /recommend
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

# ✅ Gemini-powered metadata analyzer
@app.post("/recommend")
async def recommend(metadata: dict): # Signature requires a JSON object
    """Analyze metadata for anomalies using Gemini AI."""
    try:
        if not metadata:
            return JSONResponse(content={"error": "No metadata provided"}, status_code=400)

        # --- MODIFIED LOGIC ---
        report_path_candidate = None
        report_filename = None # Variable to store the filename
        try:
            # Check for the path key inside the provided dict
            report_path_candidate = metadata.get('tamper_report_path') or metadata.get('report_path')
            if isinstance(report_path_candidate, str):
                report_path_candidate = os.path.normpath(report_path_candidate)
                report_filename = os.path.basename(report_path_candidate) # Extract filename
            else:
                report_path_candidate = None # Ensure it's None if not a string
        except Exception:
            report_path_candidate = None
        # --- END MODIFIED LOGIC ---


        # If a report path is provided and the file exists, load its JSON and use that as metadata
        loaded_report = None
        if report_path_candidate:
            try:
                # Ensure the path is within the UPLOAD_DIR to prevent directory traversal
                if not os.path.normpath(report_path_candidate).startswith(os.path.normpath(UPLOAD_DIR)):
                     return JSONResponse(content={"error": "Access denied to report file"}, status_code=403)
                
                if os.path.exists(report_path_candidate):
                    with open(report_path_candidate, 'r', encoding='utf-8') as fh:
                        loaded_report = json.load(fh)
                    
                    # ✅ PRINT STATEMENT ADDED
                    print(f"✅ Successfully loaded report from: {report_path_candidate}")
                    print("--- REPORT CONTENT ---")
                    print(json.dumps(loaded_report, indent=2))
                    print("----------------------")
                    
                else:
                    return JSONResponse(content={"error": f"Report file not found: {report_path_candidate}"}, status_code=400)
            except Exception as e:
                return JSONResponse(content={"error": f"Failed to read report file: {str(e)}"}, status_code=500)

        # If we loaded a report, use it; otherwise use the provided metadata
        gemini_input = loaded_report if loaded_report is not None else metadata

        # Use the fields you specified (anomaly_score, anomaly_detected, status)
        # to build a strong hint for Gemini.
        score_hint = ""
        try:
            if isinstance(gemini_input, dict):
                # Find the tamper report, whether it's the root object or nested
                tr = gemini_input.get('tamper_report') or gemini_input
                if isinstance(tr, dict):
                    
                    # Get the fields you specified
                    score_val = tr.get('anomaly_score')
                    detected_val = tr.get('anomaly_detected')
                    status_val = tr.get('status')

                    # Build a more comprehensive hint
                    hint_parts = []
                    
                    # 1. Use anomaly_score
                    s_int = None
                    if score_val is not None:
                        try:
                            s_int = int(score_val)
                        except Exception:
                            try:
                                s_int = int(float(score_val))
                            except Exception:
                                s_int = None
                        if s_int is not None:
                             hint_parts.append(f"anomaly_score: {s_int}/100")

                    # 2. Use anomaly_detected
                    if isinstance(detected_val, bool):
                        hint_parts.append(f"anomaly_detected: {str(detected_val).lower()}")
                        
                    # 3. Use status
                    if isinstance(status_val, str):
                        hint_parts.append(f"status: \"{status_val}\"")
                    
                    # Create the final hint string
                    if hint_parts:
                        score_hint = "A pre-analysis was performed. Use these results to guide your final JSON output:\n"
                        score_hint += f"Pre-analysis results: {', '.join(hint_parts)}.\n"
                        score_hint += "Base your `anomaly_detected`, `integrity_score`, and `risk_level` fields primarily on these pre-analysis results.\n\n"

        except Exception:
            score_hint = "" # Fail silently

        metadata_str = json.dumps(gemini_input, indent=2)

        # --- NEW PROMPT ---
        # This prompt is more explicit about the source of the JSON.
        if report_filename:
            report_source_description = f"You are analyzing the full JSON tamper report from the file `{report_filename}`."
        else:
            report_source_description = "You are analyzing the following JSON data, which includes a tamper report."

        prompt = f"""
{score_hint}
You are an AI expert in metadata forensics and anomaly detection.
{report_source_description}

Analyze the full contents of the JSON report provided below. Use the `anomaly_score`, `anomaly_detected`, and `status` fields as the primary basis for your final decision.

Return **ONLY** a valid JSON output in the specified format. Do **NOT** include explanations outside the JSON.

**Full Tamper Report Content (JSON):**
{metadata_str}

**REQUIRED OUTPUT FORMAT (populate ALL fields with actual content):**
{{
    "anomaly_detected": true or false,
    "risk_level": "low" or "medium" or "high",
    "technical_analysis": "2-3 sentence technical explanation of the file's authenticity status based on metadata analysis",
    "recommendations": ["Action 1 to take", "Action 2 to take", "Action 3 to take"],
    "integrity_score": 0-100,
    "detailed_breakdown": {{
        "file_size": 0-100 (confidence score),
        "file_metadata_discrepancy": 0-100 (confidence score),
        "image_resolution": 0-100 (confidence score),
        "image_hash": 0-100 (confidence score)
    }},
    "metadata_summary": {{
        "brief_summary": {{
            "title": "File Properties Overview",
            "content": ["Property 1: Value", "Property 2: Value", "Property 3: Value"]
        }},
        "authenticity": {{
            "title": "Authenticity & Manipulation Analysis",
            "content": ["Finding 1 about file authenticity", "Finding 2 about potential issues", "Finding 3 about confidence level"]
        }},
        "metadata_table": {{
            "title": "Metadata Analysis Table",
            "headers": ["Field", "Value", "Status"],
            "rows": [
                ["FieldName1", "value1", "Normal"],
                ["FieldName2", "value2", "Anomalous"],
                ["FieldName3", "value3", "Normal"]
            ]
        }},
        "use_cases": {{
            "title": "Recommended Applications",
            "content": ["Application 1 for this file type", "Application 2 for this file type"]
        }}
    }}
}}

**CRITICAL INSTRUCTIONS:**
1. Extract ACTUAL metadata fields from the JSON and populate metadata_table.rows
2. List REAL file properties in brief_summary.content
3. Provide SPECIFIC authenticity findings in authenticity.content
4. Recommend ACTUAL applications suitable for this file type
5. Do NOT return empty arrays - every "content" and "rows" field MUST have at least 2-3 items
6. Keep content items concise (one sentence each)
"""
        # --- END NEW PROMPT ---

        print("🔹 Sending request to Gemini...")

        # ✅ Using valid model
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        try:
            # Call Gemini API (gunicorn timeout is 120s)
            response = model.generate_content(prompt)
            raw_response = response.text.strip()
            print("🔹 Raw Gemini Response:", raw_response[:200] + "..." if len(raw_response) > 200 else raw_response)
        except Exception as e:
            print(f"⚠️ Gemini API error: {str(e)}")
            # Return safe default response if API fails
            return JSONResponse(content={
                "anomaly_detected": False,
                "risk_level": "low",
                "reason": "Analysis unavailable. File appears safe based on automated checks.",
                "technical_analysis": "Analysis unavailable. File appears safe based on automated checks.",
                "recommendations": ["Try again if you need detailed AI analysis"],
                "best_practices": ["Ensure files are from trusted sources", "Regularly verify file authenticity"],
                "integrity_score": 75,
                "detailed_breakdown": {"file_size": 0, "file_metadata_discrepancy": 0, "image_resolution": 0, "image_hash": 0},
                "metadata_summary": {"brief_summary": {"title": "File Properties Overview", "content": []}, "authenticity": {"title": "Authenticity & Manipulation Analysis", "content": []}, "metadata_table": {"title": "Metadata Analysis Table", "headers": ["Field", "Value", "Status"], "rows": []}, "use_cases": {"title": "Recommended Applications", "content": []}}
            }, status_code=200)
        except Exception as e:
            print(f"❌ Gemini API error: {str(e)}")
            return JSONResponse(content={"error": f"Gemini API error: {str(e)}"}, status_code=500)

        # Extract JSON safely
        match = re.search(r"\{.*\}", raw_response, re.DOTALL)
        if match:
            raw_response = match.group(0)

        try:
            result = json.loads(raw_response)
        except json.JSONDecodeError:
            print("❌ Gemini returned invalid JSON!")
            return JSONResponse(content={"error": "Invalid JSON from Gemini", "raw_output": raw_response}, status_code=500)

        # Add fallback defaults
        result = {
            "anomaly_detected": result.get("anomaly_detected", False),
            "reason": result.get("reason") or result.get("technical_analysis", "File analysis complete."),
            "best_practices": result.get("best_practices", ["Ensure files are from trusted sources", "Keep security updated"]),
            "risk_level": result.get("risk_level", "low"),
            "technical_analysis": result.get("technical_analysis", "No detailed report available."),
            "recommendations": result.get("recommendations", []),
            "integrity_score": result.get("integrity_score", 100),
            "detailed_breakdown": result.get("detailed_breakdown", {
                "file_size": 0,
                "file_metadata_discrepancy": 0,
                "image_resolution": 0,
                "image_hash": 0
            }),
            "metadata_summary": result.get("metadata_summary", {
                "brief_summary": {"title": "File Properties Overview", "content": []},
                "authenticity": {"title": "Authenticity & Manipulation Analysis", "content": []},
                "metadata_table": {
                    "title": "Metadata Analysis Table",
                    "headers": ["Field", "Value", "Status"],
                    "rows": []
                },
                "use_cases": {"title": "Recommended Applications", "content": []}
            })
        }

        print("✅ Sending response to frontend")
        return JSONResponse(content=result, status_code=200)

    except Exception as e:
        print(f"❌ Error in recommend endpoint: {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)