"""Extract the author's L4/L5 drawings into white portrait cards; no generation."""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'Images/A.1.2/Module 4/lesson 4 - sosed'
SHEETS = {
    4: ('c204a53b-43de-4d12-ae0d-11a1e43b65db.png', {
        'rude': (10, 72, 475, 535),
        'lazy': (495, 105, 974, 537),
        'noisy': (990, 76, 1425, 522),
        'polite': (20, 578, 465, 1038),
        'helpful': (496, 597, 935, 1020),
        'quiet': (980, 605, 1438, 1010),
    }),
    5: ('e1d48f80-58ec-4306-bf1e-52bc828558c2.png', {
        'food': (40, 199, 452, 452),
        'drink': (521, 179, 898, 449),
        'furniture': (981, 158, 1408, 453),
        'clothing': (32, 624, 453, 922),
        'building': (532, 608, 913, 936),
        'shop': (998, 623, 1404, 933),
    }),
}

def build():
    for lesson, (filename, boxes) in SHEETS.items():
        output = ROOT / f'assets/lesson-media/a1-2/module-4/lesson-{lesson}/word-pick'
        output.mkdir(parents=True, exist_ok=True)
        with Image.open(SOURCE / filename) as source:
            for word, box in boxes.items():
                drawing = ImageOps.contain(source.crop(box).convert('RGB'), (456, 552), Image.Resampling.LANCZOS)
                card = Image.new('RGB', (480, 600), 'white')
                card.paste(drawing, ((480-drawing.width)//2, (600-drawing.height)//2))
                card.save(output / f'{word}.webp', lossless=True, method=6)

if __name__ == '__main__':
    build()
