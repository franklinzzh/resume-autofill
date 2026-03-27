import sys
import os
sys.path.insert(0, '/Users/franklin/Projects/resume-autofill')

from app.resume_parser import ResumeParser

pdf_path = "/Users/franklin/Desktop/NO_Drive/resume/backend/华盛顿大学_张卓和.pdf"

# 使用环境变量中的API密钥，或者直接传入
# api_key = os.getenv("ANTHROPIC_API_KEY")
parser = ResumeParser(pdf_path)

print("=" * 60)
print("开始提取PDF内容...")
print("=" * 60)

if parser.extract_from_pdf():
    print("\n✓ PDF提取成功")
    print(f"原始文本长度: {len(parser.raw_text)} 字符")

    print("\n" + "=" * 60)
    print("调用Claude API进行数据提取...")
    print("=" * 60)

    # 解析并提取结构化数据
    parsed_data = parser.parse()

    print("\n✓ 提取成功")
    print("\n结构化JSON结果：")
    print("=" * 60)
    print(parser.to_json())

    # 也可以保存到文件
    output_file = "/Users/franklin/Projects/resume-autofill/parsed_resume.json"
    parser.to_json(output_file)
    print(f"\n✓ 已保存到: {output_file}")
else:
    print("✗ 无法打开PDF")
