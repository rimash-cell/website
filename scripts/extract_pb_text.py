import PyPDF2
import os
import sys

folder = r"C:\Users\rimaa\3D Objects\Website\Rima's - PB_SOURCE"
files = [
    "Master_Brand_Rima_Alshoufi.pdf",
    "PB_Goals_and_Ambitions.pdf",
    "Rima_Alshoufi_ CV.pdf"
]

out_path = r"C:\Users\rimaa\3D Objects\Website\scripts\pb_extracted.txt"

with open(out_path, "w", encoding="utf-8", errors="replace") as out:
    for f in files:
        path = os.path.join(folder, f)
        out.write("=" * 70 + "\n")
        out.write("FILE: " + f + "\n")
        out.write("=" * 70 + "\n")
        try:
            with open(path, "rb") as fh:
                reader = PyPDF2.PdfReader(fh)
                num_pages = len(reader.pages)
                out.write(f"Total pages: {num_pages}\n\n")
                for i, page in enumerate(reader.pages):
                    try:
                        text = page.extract_text() or ""
                    except Exception as pe:
                        text = f"[Page extraction error: {pe}]"
                    out.write(f"--- Page {i+1} ---\n")
                    out.write(text + "\n\n")
        except Exception as e:
            out.write("ERROR opening file: " + str(e) + "\n")
        out.write("\n\n")

print("Done. Output written to:", out_path)
