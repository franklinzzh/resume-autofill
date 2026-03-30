import json
import os
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database import engine, Base
from app import models, crud
from app.resume_parser import ResumeParser
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

# ============ 简历相关API ============

@app.get("/api/resume")
def get_resume():
    """获取已解析的简历JSON"""
    resume_file = Path("parsed_resume.json")
    if resume_file.exists():
        with open(resume_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"error": "No resume found"}

@app.post("/api/resume/parse")
async def parse_resume(file: UploadFile = File(...)):
    """从PDF文件解析简历"""
    try:
        # 保存上传的文件
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # 使用ResumeParser解析
        parser = ResumeParser(temp_path)

        # 提取文本
        if not parser.extract_from_pdf():
            raise HTTPException(status_code=400, detail="Failed to extract PDF text")

        # 使用Qwen API解析
        parsed_data = parser.parse()

        # 保存到JSON文件
        output_path = "parsed_resume.json"
        parser.to_json(output_path)

        # 清理临时文件
        if os.path.exists(temp_path):
            os.remove(temp_path)

        return {
            "status": "success",
            "data": parsed_data,
            "message": "Resume parsed successfully"
        }

    except Exception as e:
        # 清理临时文件
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/resume/upload")
async def upload_resume_json(file: UploadFile = File(...)):
    """上传简历JSON文件"""
    try:
        content = await file.read()
        resume_data = json.loads(content)

        # 保存到本地
        with open("parsed_resume.json", "w", encoding="utf-8") as f:
            json.dump(resume_data, f, ensure_ascii=False, indent=2)

        return {
            "status": "success",
            "message": "Resume uploaded successfully",
            "data": resume_data
        }
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ 基础路由 ============

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Resume Autofill API",
        "version": "1.0.0",
        "endpoints": {
            "GET /api/resume": "获取已解析的简历JSON",
            "POST /api/resume/parse": "从PDF文件解析简历",
            "POST /api/resume/upload": "上传简历JSON文件"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
