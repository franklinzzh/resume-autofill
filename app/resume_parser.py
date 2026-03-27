import json
import re
import os
from typing import Dict, Any, Optional
from pathlib import Path
from dashscope import Generation
from .submit_form import PDFReader


class ResumeParser:
    """简历解析器 - 使用Qwen API从原始文本提取结构化JSON"""

    # 定义要提取的JSON结构
    RESUME_SCHEMA = {
        "个人信息": {
            "姓名": "",
            "电话": "",
            "邮箱": "",
            "Github": "",
            "LinkedIn": "",
            "个人网站": "",
        },
        "教育背景": [
            {
                "学校": "",
                "专业": "",
                "学位": "",
                "时间": "",
                "描述": "",
            }
        ],
        "工作经验": [
            {
                "公司": "",
                "职位": "",
                "时间": "",
                "工作内容": "",
                "主要成就": [],
            }
        ],
        "技能": {
            "编程语言": [],
            "框架库": [],
            "工具": [],
            "其他": [],
        },
        "项目经验": [
            {
                "项目名": "",
                "角色": "",
                "时间": "",
                "技术栈": [],
                "项目描述": "",
                "主要成就": [],
            }
        ],
        "其他": {
            "获奖": [],
            "证书": [],
            "发表": [],
        }
    }

    def __init__(self, pdf_path: str, api_key: Optional[str] = None):
        self.pdf_path = pdf_path
        self.raw_text = ""
        self.parsed_data = {}

        # 初始化Qwen API密钥（从环境变量或参数获取）
        self.api_key = api_key or os.getenv("DASHSCOPE_API_KEY")
        if not self.api_key:
            raise ValueError("未找到Qwen API密钥，请设置DASHSCOPE_API_KEY环境变量")

    def extract_from_pdf(self) -> bool:
        """从PDF提取原始文本"""
        reader = PDFReader(self.pdf_path)
        if reader.open_pdf():
            self.raw_text = reader.extract_all_text() or ""
            return True
        return False

    def parse(self) -> Dict[str, Any]:
        """使用Qwen API解析简历，提取结构化数据"""
        if not self.raw_text:
            print("错误: 请先调用 extract_from_pdf()")
            return self.RESUME_SCHEMA

        # 构造提示词
        prompt = self._build_extraction_prompt()

        try:
            # 调用Qwen API
            response = Generation.call(
                model="qwen-turbo",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                api_key=self.api_key
            )

            # 检查API响应
            if response.status_code != 200:
                print(f"API调用失败: {response.message}")
                return self.RESUME_SCHEMA

            # 解析API返回的文本
            response_text = response.output.choices[0].message.content

            # 提取JSON（可能包含在markdown代码块中）
            json_match = re.search(r'```json\s*([\s\S]*?)\s*```', response_text)
            if json_match:
                json_str = json_match.group(1)
            else:
                # 尝试直接解析
                json_str = response_text

            self.parsed_data = json.loads(json_str)
            return self.parsed_data

        except json.JSONDecodeError as e:
            print(f"JSON解析失败: {e}")
            print(f"API返回内容: {response_text[:500] if 'response_text' in locals() else '无'}")
            return self.RESUME_SCHEMA
        except Exception as e:
            print(f"API调用失败: {e}")
            return self.RESUME_SCHEMA

    def _build_extraction_prompt(self) -> str:
        """构造提示词"""
        schema_str = json.dumps(self.RESUME_SCHEMA, ensure_ascii=False, indent=2)

        return f"""你是一个专业的简历解析助手。请从以下简历原始文本中提取信息，并填充到指定的JSON结构中。

=== 要提取的JSON结构 ===
{schema_str}

=== 简历原始文本 ===
{self.raw_text}

=== 任务要求 ===
1. 仔细阅读简历文本
2. 根据文本内容填充JSON结构中的各个字段
3. 如果某个字段在文本中找不到，保留为空字符串或空数组
4. 确保提取的信息准确、完整
5. 只返回JSON格式的结果，不要有其他文字说明

=== 返回格式 ===
请返回有效的JSON，使用以下格式：
```json
{{
  "个人信息": {{...}},
  "教育背景": [...],
  ...
}}
```"""

    def to_json(self, output_path: Optional[str] = None) -> str:
        """导出为JSON格式"""
        json_str = json.dumps(self.parsed_data, ensure_ascii=False, indent=2)

        if output_path:
            Path(output_path).write_text(json_str, encoding='utf-8')

        return json_str
