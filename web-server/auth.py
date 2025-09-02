from datetime import datetime, timedelta, timezone
from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm,
    SecurityScopes,
)
from fastapi import Depends, status, HTTPException, Form
from typing import Annotated
from jose import JWTError, jwt
import util

from settings import config

import api_models as am
from db import db
import snow_media

# https://fastapi.tiangolo.com/tutorial/security
# https://casbin.org/docs/how-it-works/
# https://github.com/pycasbin/sqlalchemy-adapter
# https://fastapi.tiangolo.com/advanced/security/oauth2-scopes/
auth_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/login"
)


def authenticate_user(username: str, password: str, device_profile:str):
    user = db.op.get_user_by_name(username=username)
    if not user:
        return False
    device = snow_media.device.get_device(device_profile)
    if device.require_password or username == 'admin':
        if not util.verify_password(password, user.hashed_password):
            return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
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
    expired_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Login has expired"
    )
    try:
        payload = jwt.decode(
            token, config.jwt_secret_hex, algorithms=[config.jwt_algorithm]
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_scopes = payload.get("scopes", [])
        token_cduid = payload.get("client_device_user_id")
        token_data = am.AuthTokenContent(username=username, scopes=token_scopes,client_device_user_id=token_cduid)
    except JWTError:
        raise credentials_exception
    user = db.op.get_user_by_name(username=token_data.username)
    if user is None:
        raise credentials_exception
    user.cduid = token_data.client_device_user_id
    user.ticket = db.op.get_ticket_by_cduid(cduid=user.cduid)
    if not user.ticket:
        raise expired_exception
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
    @router.post("/login",tags=['Unauthed'])
    async def login(
        login_form: Annotated[OAuth2PasswordRequestForm, Depends()],
        device_name: Annotated[str, Form()] = "swagger-ui",
        device_profile: Annotated[str, Form()] = None
    ):
        # FIXME Workaround Pydantic validation failures on empty passwords
        if login_form.password == 'SNOWSTREAM_EMPTY':
            login_form.password = ''
        user = authenticate_user(
            username=login_form.username,
            password=login_form.password,
            device_profile=device_profile
        )
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        client_device = db.op.get_client_device_by_reported_name(device_name=device_name)
        if not client_device:
            client_device = db.op.create_client_device(device_name=device_name)
        client_device_user = db.op.get_client_device_user_by_ids(
            client_device_id=client_device.id,
            user_id=user.id
        )
        if not client_device_user:
            client_device_user = db.op.create_client_device_user(client_device_id=client_device.id,user_id=user.id)
        expiry = {config.jwt_expire_unit: config.jwt_expire_value}
        access_token_expires = timedelta(**expiry)
        user_scopes = []
        if user.permissions:
            user_scopes = user.permissions.split("|")
        access_token = create_access_token(
            data={
                "sub": user.username,
                "scopes": user_scopes,
                "client_device_user_id": client_device_user.id
            },
            expires_delta=access_token_expires,
        )
        display_name = user.display_name if user.display_name else user.username
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "permissions": user_scopes,
            "username": user.username,
            "display_name": display_name
        }
