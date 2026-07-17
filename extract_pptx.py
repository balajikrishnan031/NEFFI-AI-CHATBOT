import zipfile
import xml.etree.ElementTree as ET
import os

pptx_path = r"e:\Neffi Ai\FIRST REVIEW.pptx"
out_path = r"e:\Neffi Ai\pptx_text.txt"

try:
    with zipfile.ZipFile(pptx_path) as z:
        slides = [f for f in z.namelist() if f.startswith('ppt/slides/slide')]
        text_content = []
        for s in slides:
            tree = ET.fromstring(z.read(s))
            for node in tree.iter():
                if node.text and node.text.strip():
                    text_content.append(node.text.strip())
                    
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(text_content))
    print(f"Successfully extracted PPTX text to {out_path}")
except Exception as e:
    print(f"Error: {e}")
