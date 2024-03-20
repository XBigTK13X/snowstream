from datetime import datetime, timedelta
from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm,
    SecurityScopes,
)
from fastapi import Depends, status, HTTPException, Security
from typing import Annotated
from log import log
from jose import JWTError, jwt
import util

from settings import config

import api_models as am
from db import db

# https://fastapi.tiangolo.com/tutorial/security
# https://casbin.org/docs/how-it-works/
# https://github.com/pycasbin/sqlalchemy-adapter
# https://fastapi.tiangolo.com/advanced/security/oauth2-scopes/
auth_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/login",
    scopes={
        "transcode": "Convert media streams server-side.",
        "media-delete": "Remove media from the library and the file system.",
    },
)


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
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, config.jwt_secret_hex, algorithm=config.jwt_algorithm
    )
    return encoded_jwt


async def get_current_user(
    security_scopes: SecurityScopes, token: Annotated[str, Depends(auth_scheme)]
):
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": authenticate_value},
    )
    try:
        payload = jwt.decode(
            token, config.jwt_secret_hex, algorithms=[config.jwt_algorithm]
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_scopes = payload.get("scopes", [])
        token_data = am.AuthTokenContent(username=username, scopes=token_scopes)
    except JWTError:
        raise credentials_exception
    user = db.op.get_user_by_name(username=token_data.username)
    if user is None:
        raise credentials_exception
    # Don't bother checking permissions for the admin user
    if user.username == "admin":
        return user
    for scope in security_scopes.scopes:
        if scope not in token_data.scopes:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"User does not have permission. This action requires the [{scope}] permission.",
                headers={"WWW-Authenticate": authenticate_value},
            )
    return user


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
        expiry = {config.jwt_expire_unit: config.jwt_expire_value}
        access_token_expires = timedelta(**expiry)
        user_scopes = []
        if user.permissions:
            user_scopes = user.permissions.split("|")
        access_token = create_access_token(
            data={"sub": user.username, "scopes": user_scopes},
            expires_delta=access_token_expires,
        )
        return {"access_token": access_token, "token_type": "bearer"}
