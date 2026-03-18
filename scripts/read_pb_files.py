import os
import sys
from docx import Document
from PyPDF2 import PdfReader

def read_docx(file_path):
    try:
        doc = Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])
    except Exception as e:
        return f"Error reading DOCX: {e}"

def read_pdf(file_path):
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        return f"Error reading PDF: {e}"

def main():
    # Set stdout to use utf-8 encoding to avoid UnicodeEncodeError on Windows
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    if len(sys.argv) < 2:
        print("Usage: python read_pb_files.py <file_path>")
        return

    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".docx":
        print(read_docx(file_path))
    elif ext == ".pdf":
        print(read_pdf(file_path))
    else:
        print(f"Unsupported file type: {ext}")

if __name__ == "__main__":
    main()
