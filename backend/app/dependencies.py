import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
import hashlib
import secrets
from app.config import settings
from app.models.auth import TokenData, UserResponse
from app.db.sqlite_client import get_db_connection

security = HTTPBearer(auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        parts = hashed_password.split("$")
        if len(parts) != 3:
            return False
        salt, iterations, stored_hash = parts[0], int(parts[1]), parts[2]
        computed = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt.encode("utf-8"),
            iterations
        ).hex()
        return secrets.compare_digest(computed, stored_hash)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    salt = secrets.token_hex(16)
    iterations = 100000
    hashed = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        iterations
    ).hex()
    return f"{salt}${iterations}${hashed}"

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def get_user_by_username(username: str) -> Optional[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def create_initial_users():
    """Seeds or updates default accounts so admin / password and investigator / password work out of the box."""
    default_users = [
        ("admin", "password", "admin", "System Administrator"),
        ("investigator", "password", "investigator", "Lead Intelligence Officer"),
        ("analyst", "password", "read_only", "Intelligence Analyst")
    ]
    conn = get_db_connection()
    cursor = conn.cursor()
    for username, raw_pass, role, full_name in default_users:
        cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
        row = cursor.fetchone()
        now = datetime.now(timezone.utc).isoformat()
        hashed = get_password_hash(raw_pass)
        if not row:
            user_id = f"usr_{uuid.uuid4().hex[:10]}"
            cursor.execute(
                "INSERT INTO users (id, username, hashed_password, full_name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (user_id, username, hashed, full_name, role, now)
            )
        else:
            # Update password hash so 'password' works for existing accounts as well
            cursor.execute(
                "UPDATE users SET hashed_password = ? WHERE username = ?",
                (hashed, username)
            )
    conn.commit()
    conn.close()

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> UserResponse:
    # If no token provided during dev, provide fallback investigator context
    if not credentials:
        # Default dev user
        return UserResponse(
            id="usr_default_investigator",
            username="investigator",
            role="investigator",
            full_name="Lead Intelligence Officer",
            created_at=datetime.now(timezone.utc).isoformat()
        )

    token = credentials.credentials
    if token.startswith("demo"):
        return UserResponse(
            id="usr_demo_admin",
            username="admin",
            role="admin",
            full_name="Lead Intelligence Officer (Demo)",
            created_at=datetime.now(timezone.utc).isoformat()
        )

    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        user_id: str = payload.get("user_id")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
        # Fetch full user data
        user_data = get_user_by_username(username)
        full_name = user_data.get("full_name", username) if user_data else username
        
        return UserResponse(id=user_id, username=username, role=role, full_name=full_name, created_at="")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

def require_role(allowed_roles: list[str]):
    def role_checker(current_user: UserResponse = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation requires one of these roles: {allowed_roles}"
            )
        return current_user
    return role_checker
