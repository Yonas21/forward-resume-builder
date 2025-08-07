"""
Authentication routes for the Resume Builder API.
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
from typing import Optional
import jwt
import logging

from core.config import settings
from schemas.requests import UserSignupRequest, UserLoginRequest, PasswordResetRequest, PasswordResetConfirm
from schemas.responses import AuthResponse, UserResponse, SuccessResponse
from database import User
from db_service import UserService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

class TokenData:
    def __init__(self, email: Optional[str] = None):
        self.email = email

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def verify_token(token: str) -> Optional[TokenData]:
    """Verify JWT token and return token data."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email: str = payload.get("sub")
        if email is None:
            return None
        return TokenData(email=email)
    except jwt.PyJWTError:
        return None

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """Get current authenticated user."""
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = verify_token(token)
    if token_data is None or token_data.email is None:
        raise credentials_exception
        
    user = await UserService.get_user_by_email(token_data.email)
    if user is None:
        raise credentials_exception
        
    return user

@router.post("/signup", response_model=AuthResponse)
async def signup(user_data: UserSignupRequest):
    """Register a new user."""
    logger.info(f"Signup request received for user: {user_data.email}")
    
    try:
        user = await UserService.create_user(
            email=user_data.email,
            password=user_data.password,
            first_name=user_data.first_name,
            last_name=user_data.last_name
        )
        
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": user.email}, 
            expires_delta=access_token_expires
        )
        
        user_response = UserResponse(
            id=str(user.id),
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            created_at=user.created_at,
            is_active=user.is_active
        )
        
        logger.info(f"User {user.email} signed up successfully")
        
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
        
    except ValueError as e:
        logger.error(f"Validation error during signup for {user_data.email}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error signing up user {user_data.email}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/login", response_model=AuthResponse)
async def login(login_data: UserLoginRequest):
    """Authenticate user and return access token."""
    logger.info(f"Login request received for user: {login_data.email}")
    
    try:
        user = await UserService.get_user_by_email(login_data.email)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=401,
                detail="Incorrect email or password"
            )
        
        if not UserService.verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=401,
                detail="Incorrect email or password"
            )
        
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": user.email}, 
            expires_delta=access_token_expires
        )
        
        user_response = UserResponse(
            id=str(user.id),
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            created_at=user.created_at,
            is_active=user.is_active
        )
        
        logger.info(f"User {user.email} logged in successfully")
        
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login for {login_data.email}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        created_at=current_user.created_at,
        is_active=current_user.is_active
    )

@router.post("/logout", response_model=SuccessResponse)
async def logout(current_user: User = Depends(get_current_user)):
    """Logout user (placeholder for token blacklisting)."""
    logger.info(f"User {current_user.email} logged out")
    return SuccessResponse(message="Successfully logged out")

@router.post("/reset-password", response_model=SuccessResponse)
async def request_password_reset(reset_request: PasswordResetRequest):
    """Request password reset."""
    logger.info(f"Password reset request for user: {reset_request.email}")
    
    try:
        user = await UserService.get_user_by_email(reset_request.email)
        if not user:
            return SuccessResponse(
                message="If the email exists in our system, you will receive a password reset link"
            )
        
        reset_token_expires = timedelta(hours=1)
        reset_token = create_access_token(
            data={"sub": user.email, "type": "password_reset"}, 
            expires_delta=reset_token_expires
        )
        
        # TODO: Send email with reset token
        logger.info(f"Password reset token for {user.email}: {reset_token}")
        
        return SuccessResponse(
            message="If the email exists in our system, you will receive a password reset link"
        )
        
    except Exception as e:
        logger.error(f"Error during password reset request for {reset_request.email}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/reset-password/confirm", response_model=SuccessResponse)
async def confirm_password_reset(reset_confirm: PasswordResetConfirm):
    """Confirm password reset with token."""
    logger.info("Password reset confirmation attempt")
    
    try:
        try:
            payload = jwt.decode(reset_confirm.token, settings.secret_key, algorithms=[settings.algorithm])
            email: str = payload.get("sub")
            token_type: str = payload.get("type")
            
            if email is None or token_type != "password_reset":
                raise HTTPException(status_code=400, detail="Invalid reset token")
                
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=400, detail="Reset token has expired")
        except jwt.PyJWTError:
            raise HTTPException(status_code=400, detail="Invalid reset token")
        
        user = await UserService.get_user_by_email(email)
        if not user:
            raise HTTPException(status_code=400, detail="Invalid reset token")
        
        success = await UserService.update_user_password(str(user.id), reset_confirm.new_password)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update password")
        
        logger.info(f"Password reset successful for user: {user.email}")
        
        return SuccessResponse(message="Password has been reset successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during password reset confirmation: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")