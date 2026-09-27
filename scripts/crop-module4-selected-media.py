"""Crop the author's chosen sheets without generative edits or resampling."""
from pathlib import Path
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1] / 'assets/lesson-media/a1-2/module-4'
ACCESSORIES = ROOT / '863e7675-68cb-4d75-ab3c-854fb1b037f4.png'
PEOPLE = ROOT / 'lesson-4-people.png'
BOXES = {
    'scarf': (16, 24, 498, 510),
    'belt': (532, 143, 1026, 418),
    'gloves': (1078, 32, 1494, 512),
    'cap': (19, 548, 520, 919),
    'tie': (620, 490, 931, 978),
    'sunglasses': (1004, 649, 1526, 898),
}
# Portrait crops include the entire head/hair. The first two original people
# touch at the shoulder: crop along that boundary to exclude the neighbour.
POLYGONS = {
    'A': [(18,65),(288,65),(288,157),(268,215),(260,260),(256,281),
          (267,308),(271,325),(276,345),(279,365),(283,390),(282,403),(18,403)],
    'B': [(585,65),(836,65),(836,403),(583,403)],
    'C': [(288,65),(582,65),(582,403),(293,403),(287,365),(277,319),
          (268,278),(272,215),(288,157)],
}

def save_lossless(image, path):
    encoded = BytesIO()
    image.save(encoded, format='WEBP', lossless=True, method=6)
    data = encoded.getvalue()
    with Image.open(BytesIO(data)) as check:
        check.load()
        assert check.size == image.size
    temporary = path.with_suffix('.tmp')
    temporary.write_bytes(data)
    temporary.replace(path)

def build():
    output3, output4 = ROOT / 'lesson-3/media', ROOT / 'lesson-4/media'
    output3.mkdir(parents=True, exist_ok=True)
    output4.mkdir(parents=True, exist_ok=True)
    with Image.open(ACCESSORIES) as source:
        for name, box in BOXES.items():
            save_lossless(source.crop(box), output3 / f'{name}.webp')
    with Image.open(PEOPLE) as source:
        portraits = {}
        for label, polygon in POLYGONS.items():
            mask = Image.new('L', source.size, 0)
            ImageDraw.Draw(mask).polygon(polygon, fill=255)
            cut = Image.new('RGB', source.size, 'white')
            cut.paste(source, (0,0), mask)
            box = (min(x for x,y in polygon),65,max(x for x,y in polygon),403)
            portraits[label] = cut.crop(box)
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',24)
        for labels, name in [('ABC','people-abc'),('AB','speaking-ab')]:
            canvas = Image.new('RGB',(340*len(labels),388),'white')
            draw = ImageDraw.Draw(canvas)
            for i, label in enumerate(labels):
                image = portraits[label]
                canvas.paste(image,(i*340+(340-image.width)//2,12))
                draw.text((i*340+170,363),label,font=font,fill='#42464b',anchor='mm')
            save_lossless(canvas, output4 / f'{name}.webp')

if __name__ == '__main__':
    build()
