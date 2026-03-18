from xhtml2pdf import pisa
import os

html_path = r"C:\Users\rimaa\3D Objects\Website\Rima's - PB_SOURCE\MB_R1.html"
pdf_path  = r"C:\Users\rimaa\3D Objects\Website\Rima's - PB_SOURCE\MB_R1.pdf"

with open(html_path, "rb") as src, open(pdf_path, "wb") as dst:
    result = pisa.CreatePDF(src, dest=dst)

if result.err:
    print("Errors during PDF creation:", result.err)
else:
    print("PDF saved to:", pdf_path)
