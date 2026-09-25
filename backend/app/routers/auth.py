from fastapi import APIRouter, HTTPException, Depends, status
from app.models.auth import UserLogin, UserCreate, UserResponse, Token
from app.dependencies import (
    get_user_by_username, verify_password, get_password_hash,
    create_access_token, get_current_user
)
from app.db.sqlite_client import get_db_connection
import uuid
from datetime import datetime, timezone

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
async def register(user_in: UserCreate):
    """
    Register a new investigator account.
    Returns a JWT token on successful registration.
    """
    existing = get_user_by_username(user_in.username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists"
        )

    user_id = f"usr_{uuid.uuid4().hex[:10]}"
    now = datetime.now(timezone.utc).isoformat()
    hashed = get_password_hash(user_in.password)
    full_name = getattr(user_in, 'full_name', '') or user_in.username.title()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO users (id, username, hashed_password, full_name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (user_id, user_in.username, hashed, full_name, user_in.role, now)
    )
    conn.commit()
    conn.close()

    token = create_access_token({
        "sub": user_in.username,
        "user_id": user_id,
        "role": user_in.role
    })

    user_resp = UserResponse(
        id=user_id,
        username=user_in.username,
        role=user_in.role,
        full_name=full_name,
        created_at=now
    )
    return Token(access_token=token, token_type="bearer", user=user_resp)

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    uname = credentials.username.strip().lower()
    user = get_user_by_username(uname) or get_user_by_username(credentials.username)
    valid = False
    if user:
        if verify_password(credentials.password, user["hashed_password"]):
            valid = True

    if not valid or not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    token = create_access_token({
        "sub": user["username"],
        "user_id": user["id"],
        "role": user["role"]
    })
    
    user_resp = UserResponse(
        id=user["id"],
        username=user["username"],
        role=user["role"],
        full_name=user.get("full_name", user["username"]),
        created_at=user["created_at"]
    )
    return Token(access_token=token, token_type="bearer", user=user_resp)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user

@router.get("/users")
async def list_users():
    """
    List all registered users from the database.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, full_name, role, created_at FROM users ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    users = [
        {
            "id": row["id"],
            "username": row["username"],
            "full_name": row["full_name"],
            "role": row["role"],
            "created_at": row["created_at"]
        }
        for row in rows
    ]
    return users

@router.post("/users")
async def create_user(user_in: UserCreate):
    """
    Admin endpoint to add a new user to the SQLite database.
    """
    uname = user_in.username.strip().lower()
    existing = get_user_by_username(uname)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Username '{uname}' already exists"
        )
    
    user_id = f"usr_{uuid.uuid4().hex[:10]}"
    now = datetime.now(timezone.utc).isoformat()
    hashed = get_password_hash(user_in.password)
    full_name = getattr(user_in, 'full_name', '') or uname.title()
    role = user_in.role or 'investigator'

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO users (id, username, hashed_password, full_name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (user_id, uname, hashed, full_name, role, now)
    )
    conn.commit()
    conn.close()

    return {
        "id": user_id,
        "username": uname,
        "full_name": full_name,
        "role": role,
        "created_at": now,
        "status": "created"
    }

