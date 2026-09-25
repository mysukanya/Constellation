from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from app.models.auth import UserResponse
from app.dependencies import get_current_user, require_role
from app.services.ingestion_service import ingestion_service

router = APIRouter(prefix="/ingestion", tags=["Ingestion"])

@router.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    case_id: str = Form(...),
    auto_commit: bool = Form(True),
    current_user: UserResponse = Depends(require_role(["admin", "investigator"]))
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported by this endpoint")

    content = await file.read()
    result = await ingestion_service.parse_and_extract_pdf(
        case_id=case_id,
        filename=file.filename,
        file_bytes=content,
        actor_id=current_user.id,
        auto_commit_entities=auto_commit
    )
    return result

@router.post("/upload-csv")
async def upload_csv(
    file: UploadFile = File(...),
    case_id: str = Form(...),
    current_user: UserResponse = Depends(require_role(["admin", "investigator"]))
):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported by this endpoint")

    content = await file.read()
    csv_text = content.decode("utf-8", errors="ignore")
    result = await ingestion_service.ingest_csv_call_records(
        case_id=case_id,
        filename=file.filename,
        csv_text=csv_text,
        actor_id=current_user.id
    )
    return result

@router.post("/upload-media")
async def upload_media(
    file: UploadFile = File(...),
    case_id: str = Form(...),
    media_type: str = Form("photo"),
    current_user: UserResponse = Depends(require_role(["admin", "investigator"]))
):
    content = await file.read()
    node = await ingestion_service.ingest_file_as_evidence(
        case_id=case_id,
        filename=file.filename,
        file_bytes=content,
        evidence_type=media_type,
        actor_id=current_user.id
    )
    return node

@router.post("/upload-file")
async def upload_file(
    file: UploadFile = File(...),
    case_id: str = Form(...),
    auto_commit: bool = Form(True),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Universal evidence file ingestion:
    Accepts PDF, CSV, Images, Audio, Spreadsheets, and text files.
    Computes cryptographic SHA-256 digest, extracts entities, and seals into evidence vault.
    """
    content = await file.read()
    filename_lower = file.filename.lower()

    if filename_lower.endswith(".pdf"):
        return await ingestion_service.parse_and_extract_pdf(
            case_id=case_id,
            filename=file.filename,
            file_bytes=content,
            actor_id=current_user.id,
            auto_commit_entities=auto_commit
        )
    elif filename_lower.endswith(".csv"):
        try:
            csv_text = content.decode("utf-8", errors="ignore")
            return await ingestion_service.ingest_csv_call_records(
                case_id=case_id,
                filename=file.filename,
                csv_text=csv_text,
                actor_id=current_user.id
            )
        except Exception:
            pass  # Fall through to generic evidence ingestion

    # Generic or binary evidence file
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "dat"
    ev_type = "document"
    if ext in ["jpg", "jpeg", "png", "webp"]:
        ev_type = "photo"
    elif ext in ["mp4", "mov", "avi", "mkv"]:
        ev_type = "video"
    elif ext in ["mp3", "wav", "m4a", "aac"]:
        ev_type = "audio"
    elif ext in ["csv", "xlsx", "xls"]:
        ev_type = "financial"

    node = await ingestion_service.ingest_file_as_evidence(
        case_id=case_id,
        filename=file.filename,
        file_bytes=content,
        evidence_type=ev_type,
        actor_id=current_user.id,
        title=file.filename
    )
    return {
        "status": "SEALED",
        "evidence_id": node["id"],
        "filename": file.filename,
        "file_hash": node["properties"].get("file_hash"),
        "file_size": node["properties"].get("file_size"),
        "evidence_type": ev_type,
        "collected_at": node["properties"].get("collected_at"),
        "message": f"File '{file.filename}' cryptographically sealed into evidence vault."
    }

