from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.auth_schema import RegisterRequest, LoginRequest
from app.services import auth_service
from app.utils.response import success_response

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    result = auth_service.register_user(db, request.name, request.email, request.password, request.role)
    return success_response(result, "Registration successful")


@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    result = auth_service.login_user(db, request.email, request.password)
    return success_response(result, "Login successful")


@router.get("/me")
def get_me(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    result = auth_service.get_current_user_profile(db, current_user)
    return success_response(result, "Profile retrieved")
