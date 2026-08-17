from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from core.database import get_db
from core.models import User
from core.auth import require_user

router = APIRouter(prefix="/profile", tags=["profile"])


async def _resolve_user(jwt_payload: dict, db: AsyncSession) -> User | None:
    """ต้องล็อกอินเท่านั้น — ไม่รองรับ lookup ผ่าน device_id อีกต่อไป"""
    try:
        return await db.get(User, int(jwt_payload["sub"]))
    except (ValueError, KeyError):
        return None


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
    jwt_payload: dict = Depends(require_user),
):
    user = await _resolve_user(jwt_payload, db)
    if not user:
        return {"device_id": device_id, "health_profile": {}}
    return {"device_id": user.device_id, "health_profile": user.health_profile}


@router.put("/{device_id}")
async def upsert_profile(
    device_id: str,
    profile: HealthProfile,
    db: AsyncSession = Depends(get_db),
    jwt_payload: dict = Depends(require_user),
):
    user = await _resolve_user(jwt_payload, db)
    if not user:
        raise HTTPException(401, "กรุณาเข้าสู่ระบบ")
    user.health_profile = profile.model_dump()
    await db.commit()
    return {"device_id": user.device_id, "health_profile": user.health_profile}


@router.delete("/{device_id}")
async def delete_profile(
    device_id: str,
    db: AsyncSession = Depends(get_db),
    jwt_payload: dict = Depends(require_user),
):
    user = await _resolve_user(jwt_payload, db)
    if not user:
        raise HTTPException(404, "ไม่พบผู้ใช้")
    await db.delete(user)
    await db.commit()
    return {"message": "ลบข้อมูลเรียบร้อยแล้ว"}