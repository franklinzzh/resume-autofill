from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app import models, crud
from sqlalchemy.orm import Session
from fastapi import Depends

# 创建所有数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Resume Autofill API", version="1.0.0")

# CORS 中间件配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 获取数据库连接
def get_db():
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 示例路由
@app.get("/")
def read_root():
    return {"message": "Welcome to Resume Autofill API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
