from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from core.database import get_db
from core.models import User
from core.auth import decode_optional

_bearer_opt = HTTPBearer(auto_error=False)

router = APIRouter(prefix="/profile", tags=["profile"])


async def _resolve_user(
    device_id: str,
    creds: HTTPAuthorizationCredentials | None,
    db: AsyncSession,
) -> User | None:
    """Priority: JWT auth user > device_id lookup."""
    jwt_payload = decode_optional(creds)
    if jwt_payload:
        try:
            user = await db.get(User, int(jwt_payload["sub"]))
            if user:
                return user
        except (ValueError, KeyError):
            pass

    result = await db.execute(select(User).where(User.device_id == device_id))
    return result.scalar_one_or_none()


class NutrientLimitItem(BaseModel):
    key: str
    label: str
    max: float
    unit: str
    enabled: bool = True


class HealthProfile(BaseModel):
    conditions: list[str] = []
    allergies: list[str] = []
    avoid_ingredients: list[str] = []
    notes: str = ""
    nutrient_limits: list[NutrientLimitItem] = []


@router.get("/{device_id}")
async def get_profile(
    device_id: str,
    db: AsyncSession = Depends(get_db),
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer_opt),
):
    user = await _resolve_user(device_id, creds, db)
    if not user:
        return {"device_id": device_id, "health_profile": {}}
    return {"device_id": user.device_id, "health_profile": user.health_profile}


@router.put("/{device_id}")
async def upsert_profile(
    device_id: str,
    profile: HealthProfile,
    db: AsyncSession = Depends(get_db),
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer_opt),
):
    user = await _resolve_user(device_id, creds, db)
    if not user:
        user = User(device_id=device_id, health_profile=profile.model_dump())
        db.add(user)
    else:
        user.health_profile = profile.model_dump()
    await db.commit()
    return {"device_id": user.device_id, "health_profile": user.health_profile}


@router.delete("/{device_id}")
async def delete_profile(
    device_id: str,
    db: AsyncSession = Depends(get_db),
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer_opt),
):
    user = await _resolve_user(device_id, creds, db)
    if not user:
        raise HTTPException(404, "ไม่พบผู้ใช้")
    await db.delete(user)
    await db.commit()
    return {"message": "ลบข้อมูลเรียบร้อยแล้ว"}