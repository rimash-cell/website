import os
import sys
from docx2pdf import convert
from fpdf import FPDF
import markdown

def convert_md_to_pdf(md_path, pdf_path):
    try:
        with open(md_path, 'r', encoding='utf-8') as f:
            text = f.read()
        
        pdf = FPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)
        
        # Using a core font that might support more characters or just replacing problematic ones
        # For a more robust solution, we'd embed a full Unicode font, but we'll try to sanitize first
        sanitized_text = text.replace('™', '(TM)').replace('©', '(C)').replace('®', '(R)')
        
        pdf.set_font("Helvetica", size=12)
        
        lines = sanitized_text.split('\n')
        for line in lines:
            try:
                if line.startswith('# '):
                    pdf.set_font("Helvetica", style='B', size=16)
                    pdf.multi_cell(0, 10, line[2:])
                    pdf.set_font("Helvetica", size=12)
                elif line.startswith('## '):
                    pdf.set_font("Helvetica", style='B', size=14)
                    pdf.multi_cell(0, 10, line[3:])
                    pdf.set_font("Helvetica", size=12)
                elif line.startswith('### '):
                    pdf.set_font("Helvetica", style='B', size=12)
                    pdf.multi_cell(0, 8, line[4:])
                    pdf.set_font("Helvetica", size=12)
                elif line.startswith('- '):
                    pdf.multi_cell(0, 8, f"  - {line[2:]}") # Using - instead of bullet for compatibility
                else:
                    pdf.multi_cell(0, 8, line)
                pdf.ln(2)
            except:
                # If a specific line still fails, skip or replace characters
                pdf.multi_cell(0, 8, line.encode('ascii', 'ignore').decode('ascii'))
                pdf.ln(2)
            
        pdf.output(pdf_path)
        return True
    except Exception as e:
        print(f"Error converting MD to PDF: {e}")
        return False

def main():
    raw_dir = r"c:\Users\rimaa\3D Objects\Website\Rima's - PB _raw"

    # 1. Convert Canonical Master OS to PDF
    md_os_path = os.path.join(raw_dir, "AfterSense_MASTER_OS_CANONICAL.md")
    pdf_os_path = os.path.join(raw_dir, "AfterSense_MASTER_OS_CANONICAL.pdf")
    
    print(f"Converting Canonical OS: {md_os_path} to {pdf_os_path}...")
    if convert_md_to_pdf(md_os_path, pdf_os_path):
        print("Canonical OS conversion successful.")

    # 2. Convert Canonical Bios to PDF
    md_bio_path = os.path.join(raw_dir, "AfterSense_Bios_and_Credentials_CANONICAL.md")
    pdf_bio_path = os.path.join(raw_dir, "AfterSense_Bios_and_Credentials_CANONICAL.pdf")
    
    print(f"Converting Canonical Bios: {md_bio_path} to {pdf_bio_path}...")
    if convert_md_to_pdf(md_bio_path, pdf_bio_path):
        print("Canonical Bios conversion successful.")

if __name__ == "__main__":
    main()
