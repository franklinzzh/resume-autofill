from submit_form import PDFReader

#读取PDF文件示例
reader = PDFReader("/Users/franklin/Desktop/NO_Drive/resume/backend/华盛顿大学_张卓和.pdf")
if reader.open_pdf():
    all_text = reader.extract_all_text()
    print(all_text)
