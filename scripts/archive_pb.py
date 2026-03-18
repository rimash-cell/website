import os
import shutil

def main():
    raw_dir = r"c:\Users\rimaa\3D Objects\Website\Rima's - PB _raw"
    archive_dir = os.path.join(raw_dir, "Archive")
    
    if not os.path.exists(archive_dir):
        os.makedirs(archive_dir)
        print(f"Created archive directory: {archive_dir}")
    
    # List of files to move to Archive (Consolidated or Redundant)
    to_archive = [
        "MASTER_BRAND_OS.pdf", # Uses Alshoufi name (contradiction)
        "Master Brand Playbook (Canonical v1).docx",
        "Aftersense - Brand Voice & Messaging Rules.docx",
        "Arabic_Brand_Voice_and_Language_Rules_Addendum_v1.1.docx",
        "Constraints & Guardrails.docx",
        "Service & Offer Architecture.docx",
        "Execution SOPs & Playbooks.docx",
        "AfterSense_Brand_Foundation.docx",
        "Personal_Brand_Master_Document.docx",
        "Personal Brand Operating Files — Rima Raymond.docx",
        "Personal Brand Operating Files — Rima the Founder .docx",
        "a6945222-a6a7-4471-9b6e-45022d0b7469_PB-_Master_Brand_Playbook_-_Draft_1.pdf",
        "Personal_Brand_v2.docx",
        "Brand Foundation.docx",
        "Brand Voice & Messaging Rules.docx",
        "Brand%20Foundation.docx",
        "Client Positioning Architecture.docx",
        "Execution SOPs & Playbooks - v2.docx",
        "Personal_Brand_System_Knowledge_Base.docx"
    ]
    
    for filename in to_archive:
        src = os.path.join(raw_dir, filename)
        if os.path.exists(src):
            print(f"Archiving: {filename}")
            shutil.move(src, os.path.join(archive_dir, filename))
        else:
            # Check if it's in the previously named folder if running older logic
            # Skipping (not found) is fine if already archived or not in this specific path
            pass

    print("Archive and reorganization complete.")

if __name__ == "__main__":
    main()
