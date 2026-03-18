import markdown
import re

md_path = r"C:\Users\rimaa\.gemini\antigravity\brain\bf65ad43-f50e-4c1a-abdf-f4fe895f7d64\MB_R1.md"
out_path = r"C:\Users\rimaa\3D Objects\Website\Rima's - PB_SOURCE\MB_R1.html"

with open(md_path, encoding="utf-8") as f:
    md_content = f.read()

html_body = markdown.markdown(md_content, extensions=["tables", "nl2br"])

# All colors as resolved hex — xhtml2pdf does not support CSS custom properties
CSS = """
@page { size: A4; margin: 18mm 16mm 16mm 16mm; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 9pt;
  line-height: 1.55;
  color: #2a2a2a;
  background: #ffffff;
}
.cover {
  border-bottom: 2pt solid #1a1a1a;
  padding-bottom: 10pt;
  margin-bottom: 10pt;
}
.cover-tag {
  font-size: 7pt;
  letter-spacing: 2pt;
  text-transform: uppercase;
  color: #9a9590;
  margin-bottom: 6pt;
}
.cover-name {
  font-size: 30pt;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 4pt;
}
.cover-title {
  font-size: 11pt;
  color: #b87333;
  letter-spacing: 1.5pt;
  text-transform: uppercase;
  margin-bottom: 6pt;
}
.cover-meta {
  font-size: 8pt;
  color: #6b6b6b;
  line-height: 1.7;
}
h1 { display: none; }
h2 {
  font-size: 11pt;
  font-weight: bold;
  color: #1a1a1a;
  text-transform: uppercase;
  letter-spacing: 1.5pt;
  margin-top: 14pt;
  margin-bottom: 4pt;
  padding-bottom: 2pt;
  border-bottom: 0.5pt solid #c4b5a4;
}
h3 {
  font-size: 8.5pt;
  font-weight: bold;
  color: #3d3d3d;
  text-transform: uppercase;
  letter-spacing: 1pt;
  margin-top: 8pt;
  margin-bottom: 3pt;
}
h4 {
  font-size: 8.5pt;
  font-weight: bold;
  color: #96602a;
  margin-top: 6pt;
  margin-bottom: 2pt;
}
p {
  font-size: 8.5pt;
  color: #6b6b6b;
  line-height: 1.6;
  margin-bottom: 4pt;
}
em { font-style: italic; color: #3d3d3d; }
strong { font-weight: bold; color: #2a2a2a; }
table {
  width: 100%;
  border-collapse: collapse;
  margin: 4pt 0 8pt 0;
  font-size: 8pt;
}
th {
  background-color: #1a1a1a;
  color: #f5f1ec;
  font-size: 6.5pt;
  font-weight: bold;
  letter-spacing: 1pt;
  text-transform: uppercase;
  padding: 4pt 5pt;
  text-align: left;
}
td {
  padding: 3pt 5pt;
  color: #2a2a2a;
  vertical-align: top;
  line-height: 1.5;
  border-bottom: 0.3pt solid #e8e0d6;
}
tr.even td { background-color: #f5f1ec; }
tr.odd td  { background-color: #ffffff; }
td:first-child { font-weight: bold; color: #3d3d3d; }
blockquote {
  border-left: 2pt solid #b87333;
  margin: 4pt 0;
  padding: 3pt 8pt;
  background-color: #f5f1ec;
}
blockquote p {
  font-size: 9.5pt;
  font-style: italic;
  color: #3d3d3d;
  margin: 0;
}
ul, ol { padding-left: 14pt; margin: 3pt 0 6pt 0; }
li { font-size: 8.5pt; color: #6b6b6b; line-height: 1.55; margin-bottom: 1.5pt; }
li strong { color: #2a2a2a; }
hr { border: none; border-top: 0.5pt solid #e8e0d6; margin: 8pt 0; }
.doc-footer {
  margin-top: 14pt;
  padding-top: 5pt;
  border-top: 0.5pt solid #e8e0d6;
  font-size: 8pt;
  font-style: italic;
  color: #9a9590;
  text-align: right;
}
code {
  font-size: 7.5pt;
  background-color: #f5f1ec;
  color: #6b6b6b;
  font-family: Courier, monospace;
}
"""

# Stripe table rows with classes since xhtml2pdf doesn't do nth-child well
def stripe_rows(html):
    count = [0]
    def replace_tr(m):
        count[0] += 1
        cls = "even" if count[0] % 2 == 0 else "odd"
        # Reset counter at each table
        return f'<tr class="{cls}">'
    # Reset per-table
    def process_table(m):
        count[0] = 0
        return re.sub(r'<tr>', replace_tr, m.group(0))
    return re.sub(r'<table>.*?</table>', process_table, html, flags=re.DOTALL)

html_body_striped = stripe_rows(html_body)

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Master Brand R1 — Rima Alshoufi</title>
<style>{CSS}</style>
</head>
<body>
<div class="cover">
  <div class="cover-tag">Master Brand Document</div>
  <div class="cover-name">Rima Alshoufi</div>
  <div class="cover-title">Spatial Experience Designer &amp; Creative Director</div>
  <div class="cover-meta">
    Dubai, UAE &nbsp;&middot;&nbsp; GCC &amp; Europe<br/>
    R1 &nbsp;&middot;&nbsp; February 2026<br/>
    Revised from v1.0 &nbsp;&middot;&nbsp; Discrepancy review applied
  </div>
</div>

{html_body_striped}

<div class="doc-footer">Master Brand R1 &nbsp;&middot;&nbsp; Rima Alshoufi &nbsp;&middot;&nbsp; February 2026</div>
</body>
</html>"""

with open(out_path, "w", encoding="utf-8") as f:
    f.write(html)

print("HTML written to:", out_path)
