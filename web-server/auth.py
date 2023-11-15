from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import Depends, status, HTTPException
from typing import Annotated

from jose import JWTError, jwt
import util

import secrets

import api_models as am
from db import db

# https://fastapi.tiangolo.com/tutorial/security
# https://casbin.org/docs/how-it-works/
# https://github.com/pycasbin/sqlalchemy-adapter
auth_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

SECRET_KEY=secrets.token_hex(32)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30


def authenticate_user(username: str, password: str):
    user = db.op.get_user_by_name(username=username)
    if not user:
        return False
    if not util.verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: Annotated[str, Depends(auth_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = am.AuthTokenContent(username=username)
    except JWTError:
        raise credentials_exception
    user = db.op.get_user_by_name(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


AuthUser = Annotated[am.User, Depends(get_current_user)]

async def get_current_active_user(auth_user: AuthUser):
    if not auth_user.enabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return auth_user

def register(router):
    @router.post("/login")
    async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
        user = authenticate_user(form_data.username, form_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token_expires = timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}


    @router.get("/users/me")
    async def read_users_me(auth_user: AuthUser):
        return auth_user