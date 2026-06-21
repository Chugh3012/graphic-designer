"""
Extract images from Portfolio PDF, organized by project.

Usage: python scripts/extract-pdf-images.py
Output: pdf-output/<project-folder>/page-XX-img-YY.png

Projects are detected by title pages matching "PROJECT N:" pattern.
"""

import sys
import os
import re
import fitz  # PyMuPDF

sys.stdout.reconfigure(encoding='utf-8')

PDF_PATH = os.path.join(os.path.dirname(__file__), '..', 'Portfolio 2025 v2.pdf')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'pdf-output')

# Project definitions: (start_page, end_page, folder_name, title)
# Pages are 1-indexed
PROJECTS = [
    (1, 3, '00-intro', 'Introduction & Bio'),
    (4, 7, '01-gillette-onsen-japan-kv', 'Gillette Onsen Japan KV'),
    (8, 13, '02-braun-e-content', 'Braun E-content'),
    (14, 16, '03-gillette-venus-festive-banner', 'Gillette Venus Festive Banner'),
    (17, 26, '04-kelloggs-muesli', "Kellogg's Muesli"),
    (27, 35, '05-nippo', 'Nippo Brand Identity'),
    (36, 49, '06-sugar-free-dlite', "Sugar Free D'lite"),
    (50, 71, '07-vizylac', 'Vizylac'),
    (72, 73, '08-nature-fresh-oil', 'Nature Fresh Oil'),
    (74, 77, '09-sugar-free-dlite-chocolate-spread', "Sugar Free D'lite Chocolate Spread"),
    (78, 81, '10-golden-terra-oil', 'Golden Terra Oil Nigeria'),
    (82, 85, '11-musaji-tea', 'Musaji Tea'),
    (86, 89, '12-better-for-you-illustrations', 'Better For You Illustrations'),
    (90, 91, '13-photography', 'Photography'),
    (92, 92, '14-thank-you', 'Thank You'),
]


def extract_images():
    if not os.path.exists(PDF_PATH):
        print(f"PDF not found at: {PDF_PATH}")
        sys.exit(1)

    doc = fitz.open(PDF_PATH)
    total_images = 0

    for start_page, end_page, folder, title in PROJECTS:
        project_dir = os.path.join(OUTPUT_DIR, folder)
        os.makedirs(project_dir, exist_ok=True)
        project_count = 0

        for page_num in range(start_page - 1, min(end_page, doc.page_count)):
            page = doc[page_num]
            images = page.get_images(full=True)

            for img_idx, img_info in enumerate(images):
                xref = img_info[0]
                try:
                    base_image = doc.extract_image(xref)
                    if base_image is None:
                        continue

                    image_bytes = base_image["image"]
                    image_ext = base_image["ext"]
                    width = base_image.get("width", 0)
                    height = base_image.get("height", 0)

                    # Skip tiny images (icons, artifacts) - less than 50x50
                    if width < 50 or height < 50:
                        continue

                    filename = f"page-{page_num + 1:02d}-img-{img_idx + 1:02d}.{image_ext}"
                    filepath = os.path.join(project_dir, filename)

                    with open(filepath, 'wb') as f:
                        f.write(image_bytes)

                    project_count += 1
                    total_images += 1
                except Exception as e:
                    print(f"  Warning: Could not extract image xref={xref} on page {page_num + 1}: {e}")

        print(f"[{folder}] {title}: {project_count} images extracted")

    doc.close()
    print(f"\nTotal: {total_images} images extracted to {OUTPUT_DIR}")


if __name__ == '__main__':
    extract_images()
