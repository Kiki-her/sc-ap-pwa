#!/usr/bin/env python3
"""PWA用アプリアイコンを生成する。

デザイン: ダークブルー背景(#1e3a5f)に白い盾、内側に緑のチェックマーク。
高解像度で描画してから縮小することでアンチエイリアスをかける。

使い方:
    python3 scripts/generate-icons.py
"""

from pathlib import Path

from PIL import Image, ImageDraw

PUBLIC = Path(__file__).resolve().parent.parent / "public"

BG = (30, 58, 95, 255)  # #1e3a5f
SHIELD_FILL = (255, 255, 255, 38)
SHIELD_LINE = (255, 255, 255, 255)
CHECK = (74, 222, 128, 255)  # #4ade80

SS = 4  # スーパーサンプリング倍率


def shield_points(size: int) -> list[tuple[float, float]]:
    """512基準の盾の輪郭を size にスケールして返す。"""
    base = [
        (256, 92),
        (392, 140),
        (392, 266),
        (376, 316),
        (330, 372),
        (256, 428),
        (182, 372),
        (136, 316),
        (120, 266),
        (120, 140),
    ]
    k = size / 512
    return [(x * k, y * k) for x, y in base]


def draw_icon(size: int, padding_ratio: float = 0.0) -> Image.Image:
    """アイコンを1枚描く。padding_ratio>0 で内側に余白を作る（maskable用）。"""
    canvas = size * SS
    image = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    radius = int(canvas * 96 / 512)
    draw.rounded_rectangle([(0, 0), (canvas - 1, canvas - 1)], radius=radius, fill=BG)

    # 盾とチェックを描く領域（maskable では内側に縮める）
    inner = int(canvas * (1 - padding_ratio * 2))
    offset = (canvas - inner) // 2

    layer = Image.new("RGBA", (inner, inner), (0, 0, 0, 0))
    layer_draw = ImageDraw.Draw(layer)

    points = shield_points(inner)
    layer_draw.polygon(points, fill=SHIELD_FILL)
    layer_draw.line(
        points + [points[0]],
        fill=SHIELD_LINE,
        width=max(int(inner * 18 / 512), 1),
        joint="curve",
    )

    k = inner / 512
    check = [(186 * k, 262 * k), (236 * k, 312 * k), (332 * k, 206 * k)]
    check_width = max(int(inner * 34 / 512), 1)
    layer_draw.line(check, fill=CHECK, width=check_width, joint="curve")
    # 線端を丸くする
    r = check_width / 2
    for x, y in (check[0], check[2]):
        layer_draw.ellipse([(x - r, y - r), (x + r, y + r)], fill=CHECK)

    image.alpha_composite(layer, (offset, offset))
    return image.resize((size, size), Image.LANCZOS)


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)

    draw_icon(512).save(PUBLIC / "icon-512.png")
    draw_icon(192).save(PUBLIC / "icon-192.png")
    draw_icon(180).save(PUBLIC / "apple-touch-icon.png")
    # maskable: セーフゾーン確保のため内側に余白を取る
    draw_icon(512, padding_ratio=0.11).save(PUBLIC / "icon-maskable-512.png")

    favicon = draw_icon(64)
    favicon.save(
        PUBLIC / "favicon.ico",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64)],
    )

    print("generated: icon-512.png, icon-192.png, apple-touch-icon.png, icon-maskable-512.png, favicon.ico")


if __name__ == "__main__":
    main()
