from fastapi import (
    Depends,
    HTTPException,
    status
)

from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer
)

from database import SessionLocal

from models.user import User

from security import decode_access_token


security = HTTPBearer()


def get_current_user(
    credentials:
        HTTPAuthorizationCredentials
        =
        Depends(security)
):

    token = credentials.credentials

    payload = decode_access_token(
        token
    )


    if payload is None:

        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,
            detail=
                "Invalid or expired token"
        )


    user_id = payload.get("sub")


    if user_id is None:

        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,
            detail=
                "Invalid authentication token"
        )


    db = SessionLocal()


    try:

        user = db.query(User).filter(
            User.id == int(user_id)
        ).first()


        if user is None:

            raise HTTPException(
                status_code=
                    status.HTTP_401_UNAUTHORIZED,
                detail=
                    "User not found"
            )


        db.expunge(user)

        return user


    finally:

        db.close()


def require_student(
    current_user: User =
        Depends(get_current_user)
):

    if current_user.role != "student":

        raise HTTPException(
            status_code=
                status.HTTP_403_FORBIDDEN,
            detail=
                "Student access required"
        )

    return current_user


def require_faculty(
    current_user: User =
        Depends(get_current_user)
):

    if current_user.role != "faculty":

        raise HTTPException(
            status_code=
                status.HTTP_403_FORBIDDEN,
            detail=
                "Faculty access required"
        )

    return current_user


def require_admin(
    current_user: User =
        Depends(get_current_user)
):

    if current_user.role != "admin":

        raise HTTPException(
            status_code=
                status.HTTP_403_FORBIDDEN,
            detail=
                "Admin access required"
        )

    return current_user