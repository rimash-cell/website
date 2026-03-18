from PyPDF2 import PdfReader

reader = PdfReader(r"c:\Users\rimaa\3D Objects\Website\Rima's - PB_SOURCE\Master_Brand_Rima_Alshoufi.pdf")
with open(r"c:\Users\rimaa\3D Objects\Website\scripts\pb_final_verify.txt", "w", encoding="utf-8") as f:
    for page in reader.pages:
        f.write(page.extract_text() + "\n")
print("Done")
