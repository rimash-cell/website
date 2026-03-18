from PyPDF2 import PdfReader

reader = PdfReader(r"C:\Users\rimaa\3D Objects\Website\CV\Rima_Alshoufi_CV.pdf")
with open(r"c:\Users\rimaa\3D Objects\Website\scripts\cv_extracted_content.txt", "w", encoding="utf-8") as f:
    for page in reader.pages:
        f.write(page.extract_text() + "\n")
print("Done")
