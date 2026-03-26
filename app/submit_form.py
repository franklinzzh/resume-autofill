from PyPDF2 import PdfReader
from pathlib import Path
from typing import Optional, Dict, List

class PDFReader:
    """PDF 文件读取类"""

    def __init__(self, pdf_path: str):
        """
        初始化 PDF 读取器

        Args:
            pdf_path: PDF 文件路径
        """
        self.pdf_path = Path(pdf_path)
        self.reader = None
        self.num_pages = 0

    def open_pdf(self) -> bool:
        """
        打开 PDF 文件

        Returns:
            bool: 打开成功返回 True，否则返回 False
        """
        try:
            if not self.pdf_path.exists():
                print(f"错误: 文件 {self.pdf_path} 不存在")
                return False

            self.file = open(self.pdf_path, 'rb')
            self.reader = PdfReader(self.file)
            self.num_pages = len(self.reader.pages)
            print(f"成功打开 PDF: {self.pdf_path}, 总页数: {self.num_pages}")
            return True
        except Exception as e:
            print(f"打开 PDF 失败: {e}")
            return False

    def extract_text_from_page(self, page_num: int) -> Optional[str]:
        """
        从指定页面提取文本

        Args:
            page_num: 页码（从 0 开始）

        Returns:
            页面文本内容，失败返回 None
        """
        if self.reader is None:
            print("错误: PDF 尚未打开，请先调用 open_pdf()")
            return None

        if page_num < 0 or page_num >= self.num_pages:
            print(f"错误: 页码 {page_num} 超出范围 (0-{self.num_pages-1})")
            return None

        try:
            page = self.reader.pages[page_num]
            text = page.extract_text()
            return text
        except Exception as e:
            print(f"提取第 {page_num} 页文本失败: {e}")
            return None

    def extract_all_text(self) -> Optional[str]:
        """
        提取 PDF 中的所有文本

        Returns:
            所有文本内容，失败返回 None
        """
        if self.reader is None:
            print("错误: PDF 尚未打开，请先调用 open_pdf()")
            return None

        try:
            all_text = ""
            for page_num in range(self.num_pages):
                page = self.reader.pages[page_num]
                text = page.extract_text()
                all_text += f"\n--- 第 {page_num + 1} 页 ---\n{text}"
            return all_text
        except Exception as e:
            print(f"提取所有文本失败: {e}")
            return None

    def extract_text_by_pages(self) -> Optional[List[str]]:
        """
        按页面提取文本

        Returns:
            页面文本列表，失败返回 None
        """
        if self.reader is None:
            print("错误: PDF 尚未打开，请先调用 open_pdf()")
            return None

        try:
            pages_text = []
            for page_num in range(self.num_pages):
                page = self.reader.pages[page_num]
                text = page.extract_text()
                pages_text.append(text)
            return pages_text
        except Exception as e:
            print(f"按页面提取文本失败: {e}")
            return None

    def get_pdf_metadata(self) -> Optional[Dict]:
        """
        获取 PDF 元数据

        Returns:
            元数据字典，失败返回 None
        """
        if self.reader is None:
            print("错误: PDF 尚未打开，请先调用 open_pdf()")
            return None

        try:
            metadata = self.reader.metadata
            return {
                "title": metadata.get("/Title"),
                "author": metadata.get("/Author"),
                "subject": metadata.get("/Subject"),
                "creator": metadata.get("/Creator"),
                "producer": metadata.get("/Producer"),
                "creation_date": metadata.get("/CreationDate"),
                "modification_date": metadata.get("/ModDate"),
            }
        except Exception as e:
            print(f"获取元数据失败: {e}")
            return None


# 简化的辅助函数
def read_pdf_text(pdf_path: str) -> Optional[str]:
    """
    快速读取 PDF 中所有文本

    Args:
        pdf_path: PDF 文件路径

    Returns:
        提取的文本内容
    """
    reader = PDFReader(pdf_path)
    if reader.open_pdf():
        return reader.extract_all_text()
    return None


def read_pdf_page(pdf_path: str, page_num: int) -> Optional[str]:
    """
    快速读取 PDF 中指定页面的文本

    Args:
        pdf_path: PDF 文件路径
        page_num: 页码（从 0 开始）

    Returns:
        提取的页面文本内容
    """
    reader = PDFReader(pdf_path)
    if reader.open_pdf():
        return reader.extract_text_from_page(page_num)
    return None
