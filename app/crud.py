from sqlalchemy.orm import Session
from app import models
from typing import Optional, List

# ============ Resume CRUD ============

def create_resume(db: Session, name: str, email: str, phone: Optional[str] = None,
                 summary: Optional[str] = None, experience: Optional[str] = None,
                 education: Optional[str] = None, skills: Optional[str] = None) -> models.Resume:
    """创建新简历"""
    db_resume = models.Resume(
        name=name,
        email=email,
        phone=phone,
        summary=summary,
        experience=experience,
        education=education,
        skills=skills
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    return db_resume

def get_resume(db: Session, resume_id: int) -> Optional[models.Resume]:
    """获取单个简历"""
    return db.query(models.Resume).filter(models.Resume.id == resume_id).first()

def get_resume_by_email(db: Session, email: str) -> Optional[models.Resume]:
    """通过邮箱获取简历"""
    return db.query(models.Resume).filter(models.Resume.email == email).first()

def get_all_resumes(db: Session, skip: int = 0, limit: int = 100) -> List[models.Resume]:
    """获取所有简历"""
    return db.query(models.Resume).offset(skip).limit(limit).all()

def update_resume(db: Session, resume_id: int, **kwargs) -> Optional[models.Resume]:
    """更新简历"""
    db_resume = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
    if db_resume:
        for key, value in kwargs.items():
            if hasattr(db_resume, key) and value is not None:
                setattr(db_resume, key, value)
        db.commit()
        db.refresh(db_resume)
    return db_resume

def delete_resume(db: Session, resume_id: int) -> bool:
    """删除简历"""
    db_resume = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
    if db_resume:
        db.delete(db_resume)
        db.commit()
        return True
    return False

# ============ User CRUD ============

def create_user(db: Session, username: str, email: str, hashed_password: str) -> models.User:
    """创建新用户"""
    db_user = models.User(
        username=username,
        email=email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: int) -> Optional[models.User]:
    """获取单个用户"""
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    """通过用户名获取用户"""
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """通过邮箱获取用户"""
    return db.query(models.User).filter(models.User.email == email).first()

def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    """获取所有用户"""
    return db.query(models.User).offset(skip).limit(limit).all()

def update_user(db: Session, user_id: int, **kwargs) -> Optional[models.User]:
    """更新用户信息"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        for key, value in kwargs.items():
            if hasattr(db_user, key) and value is not None:
                setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int) -> bool:
    """删除用户"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False
