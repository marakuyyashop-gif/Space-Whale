"""Remove only the selected accessory sheet's paper using an alpha mask.

Requires Pillow, numpy and scipy. No generation, RGB edits or resampling.
The source remains untouched; individual exercise crops are not changed.
"""
from io import BytesIO
from pathlib import Path
import runpy
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

crop = runpy.run_path(str(Path(__file__).with_name('crop-module4-selected-media.py')))
source = Image.open(crop['ACCESSORIES']).convert('RGB')
rgb = np.array(source)
alpha = np.zeros(rgb.shape[:2], dtype=np.uint8)

for name, (left, top, right, bottom) in crop['BOXES'].items():
    tile = rgb[top:bottom, left:right]
    # The ink outlines separate pale cloth from the connected paper region.
    # The cap uses a darker threshold to exclude the drawn paper shadow.
    ink = ndimage.binary_closing(tile.min(axis=2) < (155 if name == 'cap' else 180), iterations=1)
    labels, _ = ndimage.label(ink)
    sizes = np.bincount(labels.ravel())
    sizes[0] = 0
    foreground = labels == sizes.argmax() if name == 'cap' else np.isin(labels, np.flatnonzero(sizes > 15))
    foreground = ndimage.binary_fill_holes(foreground)
    if name == 'scarf':
        # Protect the pale woven panel where the original outline is broken.
        cloth = Image.new('1', (right-left, bottom-top))
        ImageDraw.Draw(cloth).polygon([(143,226),(240,252),(222,337),(212,358),(122,335)], fill=1)
        foreground |= np.array(cloth, dtype=bool)
        # The neck opening is paper, not a light patch of fabric.
        opening = Image.new('1', cloth.size)
        ImageDraw.Draw(opening).polygon([(245,121),(264,119),(294,128),(306,133),(295,145),(283,156),(267,151),(258,144),(241,130)], fill=1)
        foreground &= ~np.array(opening, dtype=bool)
    # Subpixel edge softness affects opacity only, never the original RGB.
    alpha[top:bottom, left:right] = (ndimage.gaussian_filter(foreground.astype(float), .55)*255).round().astype(np.uint8)

result = Image.fromarray(np.dstack((rgb, alpha)))
encoded = BytesIO()
result.save(encoded, format='WEBP', lossless=True, method=6, exact=True)
data = encoded.getvalue()
decoded = np.array(Image.open(BytesIO(data)).convert('RGBA'))
assert np.array_equal(decoded[:, :, 3], alpha)
assert np.array_equal(decoded[:, :, :3][alpha > 0], rgb[alpha > 0])
output = crop['ROOT'] / 'lesson-3/media/speaking-cutout.webp'
temporary = output.with_suffix('.tmp')
temporary.write_bytes(data)
temporary.replace(output)
print(f'{output.name}: {source.width}×{source.height}, visible RGB preserved exactly')
