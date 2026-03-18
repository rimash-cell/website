import os
import shutil

def main():
    raw_dir = r"c:\Users\rimaa\3D Objects\Website\Rima's - personal_brand_raw"
    archive_dir = os.path.join(raw_dir, "Archive")
    
    if not os.path.exists(archive_dir):
        os.makedirs(archive_dir)

    to_archive = [
        "Aftersense - 1- Client Positioning Architecture.docx",
        "Aftersense - CONSTRAINTS & GUARDRAILS.docx",
        "Aftersense - Client Positioning Architecture.docx",
        "Aftersense - Content Strategy & Editorial Engine.docx",
        "Aftersense - Creative Direction & Visual Language.docx",
        "Aftersense - KPI & Measurement Framework.docx",
        "Aftersense - Marketing Growth Strategy.docx",
        "Aftersense- Marketing Growth Strategy.docx",
        "Aftersense_Founder_Personal_Brand_Blueprint.docx",
        "Content Strategy & Editorial Engine (1).docx",
        "Content Strategy & Editorial Engine.docx",
        "Creative Direction & Visual Language.docx",
        "KPI & Measurement Framework.docx",
        "Marketing Growth Strategy.docx",
        "Voice_and_Language_Rules_EN_AR_v1.0.docx",
        "Rima_Raymond_Personal_Brand_v2.docx",
        "AfterSense — Brand & Growth OS Index.docx",
        "AfterSense_Business_Fundamentals.docx",
        "AfterSense_Client Knowledge Base Document.docx",
        "AfterSense — Reference Compendium (Non-Governing).docx",
        "AfterSense_Master_OS_v1.docx"
    ]
    
    for filename in to_archive:
        src = os.path.join(raw_dir, filename)
        if os.path.exists(src):
            print(f"Archiving: {filename}")
            try:
                shutil.move(src, os.path.join(archive_dir, filename))
            except Exception as e:
                print(f"Error archiving {filename}: {e}")

    # Copy the master OS correctly
    master_v1 = os.path.join(archive_dir, "AfterSense_Master_OS_v1.docx")
    master_final = os.path.join(raw_dir, "AfterSense_MASTER_OS.docx")
    if os.path.exists(master_v1):
        shutil.copy2(master_v1, master_final)
        print(f"Final Master OS created at: {master_final}")

if __name__ == "__main__":
    main()
