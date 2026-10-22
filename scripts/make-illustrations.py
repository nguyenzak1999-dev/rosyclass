"""Sinh bộ ảnh minh hoạ SVG cho website RosyClass (trẻ mầm non & tiểu học)."""
import os
import sys

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

INK = "#2b2140"
C = dict(cream="#fff8ec", rose="#ff5c93", rose_s="#ffe0ec", sun="#ffc93c", sun_s="#fff1c7", sky="#3bb4f2",
         sky_s="#dcf2ff", mint="#2ec4a0", mint_s="#d6f7ee", grape="#8c5cf0", grape_s="#ece3ff", orange="#ff8a3d",
         orange_s="#ffe6d4", wood="#e7c79a", wood_d="#b88c5a", white="#ffffff", board="#2f5d50")
SKINS = ["#f6d2b5", "#eab993", "#f3c6a0", "#d9a47e"]
HAIR = ["#2b1d16", "#3b2a20", "#4a3426", "#1f1612"]
SW = 4  # độ dày viền


def svg(w, h, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-label="{title}">'
            f'<title>{title}</title>'
            f'<g stroke="{INK}" stroke-width="{SW}" stroke-linejoin="round" stroke-linecap="round">{body}</g></svg>')


def kid(x, y, s=1.0, skin=0, hair="bob", hair_color=0, shirt="rose", arm="down", mouth="smile", flip=False):
    """Vẽ một bé, (x, y) là điểm giữa chân. s = tỉ lệ."""
    sk = SKINS[skin % len(SKINS)]
    hc = HAIR[hair_color % len(HAIR)]
    sh = C[shirt]
    t = f'translate({x} {y}) scale({-s if flip else s} {s})'
    parts = []
    # chân
    parts.append(f'<rect x="-22" y="-46" width="16" height="46" rx="8" fill="{C["sky"] if shirt != "sky" else C["grape"]}"/>')
    parts.append(f'<rect x="6" y="-46" width="16" height="46" rx="8" fill="{C["sky"] if shirt != "sky" else C["grape"]}"/>')
    parts.append(f'<ellipse cx="-14" cy="-2" rx="14" ry="7" fill="{INK}"/><ellipse cx="14" cy="-2" rx="14" ry="7" fill="{INK}"/>')
    # tay
    if arm == "up":
        parts.append(f'<path d="M24 -100 Q50 -140 44 -176" fill="none" stroke="{INK}" stroke-width="20"/>'
                     f'<path d="M24 -100 Q50 -140 44 -176" fill="none" stroke="{sh}" stroke-width="12"/>'
                     f'<circle cx="44" cy="-182" r="10" fill="{sk}"/>')
    elif arm == "wave":
        parts.append(f'<path d="M24 -100 Q58 -110 60 -146" fill="none" stroke="{INK}" stroke-width="20"/>'
                     f'<path d="M24 -100 Q58 -110 60 -146" fill="none" stroke="{sh}" stroke-width="12"/>'
                     f'<circle cx="60" cy="-152" r="10" fill="{sk}"/>')
    else:
        parts.append(f'<path d="M26 -104 Q40 -80 36 -58" fill="none" stroke="{INK}" stroke-width="20"/>'
                     f'<path d="M26 -104 Q40 -80 36 -58" fill="none" stroke="{sh}" stroke-width="12"/>'
                     f'<circle cx="36" cy="-54" r="9" fill="{sk}"/>')
    parts.append(f'<path d="M-26 -104 Q-40 -80 -36 -58" fill="none" stroke="{INK}" stroke-width="20"/>'
                 f'<path d="M-26 -104 Q-40 -80 -36 -58" fill="none" stroke="{sh}" stroke-width="12"/>'
                 f'<circle cx="-36" cy="-54" r="9" fill="{sk}"/>')
    # thân
    parts.append(f'<path d="M-30 -44 L-26 -110 Q0 -122 26 -110 L30 -44 Z" fill="{sh}"/>')
    parts.append(f'<circle cx="0" cy="-86" r="5" fill="{C["white"]}" stroke-width="3"/>')
    # đầu
    hy = -150
    if hair == "pigtails":
        parts.append(f'<circle cx="-40" cy="{hy - 6}" r="14" fill="{hc}"/><circle cx="40" cy="{hy - 6}" r="14" fill="{hc}"/>')
        parts.append(f'<circle cx="-30" cy="{hy - 14}" r="5" fill="{C["rose"]}" stroke-width="2"/><circle cx="30" cy="{hy - 14}" r="5" fill="{C["rose"]}" stroke-width="2"/>')
    if hair == "bun":
        parts.append(f'<circle cx="0" cy="{hy - 40}" r="14" fill="{hc}"/>')
    if hair == "long":
        # Hai lọn tóc dài hai bên má, không che cằm
        parts.append(f'<path d="M-34 {hy - 6} Q-46 {hy + 30} -36 {hy + 50} L-22 {hy + 46} Q-30 {hy + 20} -26 {hy - 4} Z" fill="{hc}"/>'
                     f'<path d="M34 {hy - 6} Q46 {hy + 30} 36 {hy + 50} L22 {hy + 46} Q30 {hy + 20} 26 {hy - 4} Z" fill="{hc}"/>')
    parts.append(f'<circle cx="0" cy="{hy}" r="34" fill="{sk}"/>')
    # tóc
    if hair == "spiky":
        parts.append(f'<path d="M-33 {hy - 6} L-30 {hy - 30} L-18 {hy - 22} L-10 {hy - 40} L2 {hy - 26} L12 {hy - 40} L18 {hy - 24} L30 {hy - 32} L33 {hy - 6} Q0 {hy - 18} -33 {hy - 6} Z" fill="{hc}"/>')
    elif hair == "short":
        parts.append(f'<path d="M-34 {hy - 2} Q-34 {hy - 38} 0 {hy - 36} Q34 {hy - 38} 34 {hy - 2} Q20 {hy - 18} -6 {hy - 16} Q-22 {hy - 16} -34 {hy - 2} Z" fill="{hc}"/>')
    else:  # bob, pigtails, bun, long
        parts.append(f'<path d="M-35 {hy + 6} Q-38 {hy - 40} 0 {hy - 37} Q38 {hy - 40} 35 {hy + 6} Q30 {hy - 14} 6 {hy - 20} Q-6 {hy - 8} -20 {hy - 14} Q-30 {hy - 8} -35 {hy + 6} Z" fill="{hc}"/>')
    # mặt
    parts.append(f'<circle cx="-12" cy="{hy + 2}" r="4" fill="{INK}" stroke="none"/><circle cx="12" cy="{hy + 2}" r="4" fill="{INK}" stroke="none"/>')
    parts.append(f'<circle cx="-20" cy="{hy + 14}" r="6" fill="{C["rose"]}" opacity="0.45" stroke="none"/><circle cx="20" cy="{hy + 14}" r="6" fill="{C["rose"]}" opacity="0.45" stroke="none"/>')
    if mouth == "sing":
        parts.append(f'<ellipse cx="0" cy="{hy + 18}" rx="7" ry="9" fill="{INK}" stroke="none"/>')
    elif mouth == "open":
        parts.append(f'<path d="M-10 {hy + 13} Q0 {hy + 28} 10 {hy + 13} Z" fill="{C["white"]}" stroke-width="3"/>')
    else:
        parts.append(f'<path d="M-10 {hy + 14} Q0 {hy + 24} 10 {hy + 14}" fill="none" stroke-width="3.5"/>')
    return f'<g transform="{t}">{"".join(parts)}</g>'


def teacher(x, y, s=1.0):
    sk = SKINS[0]
    t = f'translate({x} {y}) scale({s})'
    p = [
        f'<path d="M-40 0 L-34 -120 Q0 -136 34 -120 L40 0 Z" fill="{C["mint"]}"/>',
        f'<path d="M-34 -120 Q0 -112 34 -120 L30 -70 Q0 -64 -30 -70 Z" fill="{C["white"]}" stroke-width="3"/>',
        f'<path d="M34 -114 Q62 -100 56 -60" fill="none" stroke="{INK}" stroke-width="20"/><path d="M34 -114 Q62 -100 56 -60" fill="none" stroke="{C["mint"]}" stroke-width="12"/>',
        f'<path d="M-34 -114 Q-64 -132 -70 -168" fill="none" stroke="{INK}" stroke-width="20"/><path d="M-34 -114 Q-64 -132 -70 -168" fill="none" stroke="{C["mint"]}" stroke-width="12"/>',
        f'<circle cx="-70" cy="-174" r="10" fill="{sk}"/>',
        f'<rect x="38" y="-86" width="40" height="30" rx="4" fill="{C["sun"]}" transform="rotate(-12 58 -71)"/>',
        f'<path d="M-35 -176 Q-50 -130 -40 -104 L-24 -110 Q-32 -140 -28 -170 Z" fill="{HAIR[1]}"/>',
        f'<path d="M35 -176 Q50 -130 40 -104 L24 -110 Q32 -140 28 -170 Z" fill="{HAIR[1]}"/>',
        f'<circle cx="0" cy="-168" r="36" fill="{sk}"/>',
        f'<path d="M-37 -160 Q-40 -212 0 -208 Q40 -212 37 -160 Q24 -190 0 -186 Q-24 -190 -37 -160 Z" fill="{HAIR[1]}"/>',
        f'<circle cx="-12" cy="-166" r="4" fill="{INK}" stroke="none"/><circle cx="12" cy="-166" r="4" fill="{INK}" stroke="none"/>',
        f'<path d="M-11 -152 Q0 -141 11 -152" fill="none" stroke-width="3.5"/>',
        f'<circle cx="-22" cy="-154" r="6" fill="{C["rose"]}" opacity="0.45" stroke="none"/><circle cx="22" cy="-154" r="6" fill="{C["rose"]}" opacity="0.45" stroke="none"/>',
    ]
    return f'<g transform="{t}">{"".join(p)}</g>'


def star(x, y, r, fill):
    import math
    pts = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 == 0 else r * 0.45
        pts.append(f"{x + rr * math.cos(a):.1f},{y + rr * math.sin(a):.1f}")
    return f'<polygon points="{" ".join(pts)}" fill="{fill}"/>'


def block(x, y, size, fill, letter):
    return (f'<g transform="translate({x} {y})"><rect x="0" y="0" width="{size}" height="{size}" rx="10" fill="{fill}"/>'
            f'<text x="{size / 2}" y="{size * 0.7}" text-anchor="middle" font-family="Arial Rounded MT Bold, Nunito, Baloo 2, sans-serif" '
            f'font-weight="800" font-size="{size * 0.62}" fill="{INK}" stroke="none">{letter}</text></g>')


def balloon(x, y, fill):
    return (f'<path d="M{x} {y + 46} Q{x - 6} {y + 80} {x + 4} {y + 110}" fill="none" stroke-width="3"/>'
            f'<ellipse cx="{x}" cy="{y}" rx="30" ry="38" fill="{fill}"/><path d="M{x - 5} {y + 38} L{x + 5} {y + 38} L{x} {y + 47} Z" fill="{fill}"/>'
            f'<ellipse cx="{x - 10}" cy="{y - 14}" rx="7" ry="11" fill="{C["white"]}" opacity="0.6" stroke="none"/>')


def bunting(y, x0, x1, n, colors):
    step = (x1 - x0) / n
    out = [f'<path d="M{x0} {y} Q{(x0 + x1) / 2} {y + 40} {x1} {y}" fill="none" stroke-width="3"/>']
    for i in range(n):
        cx = x0 + step * (i + 0.5)
        sag = 40 * (1 - ((cx - (x0 + x1) / 2) / ((x1 - x0) / 2)) ** 2) * 0.5
        out.append(f'<path d="M{cx - 16} {y + sag} L{cx + 16} {y + sag} L{cx} {y + sag + 34} Z" fill="{colors[i % len(colors)]}" stroke-width="3"/>')
    return "".join(out)


def note(x, y, fill):
    return (f'<g transform="translate({x} {y})"><path d="M0 0 L0 -40 L24 -48 L24 -8" fill="none" stroke-width="5"/>'
            f'<ellipse cx="-6" cy="2" rx="9" ry="7" fill="{fill}"/><ellipse cx="18" cy="-6" rx="9" ry="7" fill="{fill}"/></g>')


def bubble(x, y, w, h, text, fill):
    return (f'<g transform="translate({x} {y})"><rect x="0" y="0" width="{w}" height="{h}" rx="{h / 2}" fill="{fill}"/>'
            f'<path d="M{w * 0.25} {h - 2} L{w * 0.2} {h + 18} L{w * 0.38} {h - 2} Z" fill="{fill}"/>'
            f'<path d="M{w * 0.25 + 3} {h - 4} L{w * 0.38 - 3} {h - 4}" stroke="{fill}" stroke-width="6"/>'
            f'<text x="{w / 2}" y="{h * 0.68}" text-anchor="middle" font-family="Arial Rounded MT Bold, Nunito, Baloo 2, sans-serif" font-weight="800" '
            f'font-size="{h * 0.5}" fill="{INK}" stroke="none">{text}</text></g>')


def frame(bg):
    return f'<rect x="-10" y="-10" width="820" height="620" fill="{bg}" stroke="none"/>'


# 1. Lớp học (hero)
classroom = "".join([
    frame(C["sky_s"]),
    f'<rect x="-10" y="440" width="820" height="170" fill="{C["wood"]}" stroke="none"/>',
    f'<path d="M-10 440 L810 440" stroke-width="4"/>',
    bunting(30, 40, 760, 11, [C["rose"], C["sun"], C["mint"], C["sky"], C["grape"], C["orange"]]),
    # bảng
    f'<rect x="250" y="110" width="320" height="190" rx="18" fill="{C["wood_d"]}"/>',
    f'<rect x="266" y="126" width="288" height="158" rx="10" fill="{C["board"]}"/>',
    f'<text x="410" y="200" text-anchor="middle" font-family="Arial Rounded MT Bold, Nunito, Baloo 2, sans-serif" font-weight="800" font-size="64" fill="{C["white"]}" stroke="none">ABC</text>',
    f'<text x="410" y="258" text-anchor="middle" font-family="Arial Rounded MT Bold, Nunito, Baloo 2, sans-serif" font-weight="700" font-size="34" fill="{C["sun"]}" stroke="none">Hello!</text>',
    star(310, 160, 14, C["sun"]), star(520, 250, 10, C["rose"]),
    # cửa sổ
    f'<rect x="40" y="120" width="150" height="150" rx="16" fill="{C["white"]}"/>',
    f'<circle cx="115" cy="195" r="34" fill="{C["sun"]}"/>',
    f'<path d="M115 120 L115 270 M40 195 L190 195" stroke-width="4"/>',
    balloon(690, 160, C["rose"]), balloon(740, 190, C["sun"]), balloon(640, 200, C["mint"]),
    teacher(560, 470, 1.1),
    kid(150, 520, 0.95, skin=1, hair="pigtails", hair_color=0, shirt="rose", arm="up", mouth="open"),
    kid(285, 540, 1.0, skin=0, hair="spiky", hair_color=2, shirt="sun", arm="wave", mouth="smile"),
    kid(410, 530, 0.9, skin=2, hair="bun", hair_color=1, shirt="grape", arm="down", mouth="open", flip=True),
    block(660, 470, 62, C["sky"], "A"), block(704, 510, 56, C["orange"], "B"), block(640, 530, 52, C["mint"], "C"),
    star(470, 360, 16, C["sun"]),
])

# 2. Mầm non
preschool = "".join([
    frame(C["rose_s"]),
    f'<path d="M80 470 A320 320 0 0 1 720 470" fill="none" stroke="{C["rose"]}" stroke-width="34"/>',
    f'<path d="M120 470 A280 280 0 0 1 680 470" fill="none" stroke="{C["sun"]}" stroke-width="34"/>',
    f'<path d="M160 470 A240 240 0 0 1 640 470" fill="none" stroke="{C["mint"]}" stroke-width="34"/>',
    f'<path d="M200 470 A200 200 0 0 1 600 470" fill="none" stroke="{C["sky"]}" stroke-width="34"/>',
    f'<rect x="-10" y="460" width="820" height="150" fill="{C["mint_s"]}" stroke="none"/><path d="M-10 460 L810 460"/>',
    f'<ellipse cx="160" cy="110" rx="70" ry="34" fill="{C["white"]}"/><ellipse cx="640" cy="90" rx="60" ry="30" fill="{C["white"]}"/>',
    kid(300, 540, 0.85, skin=3, hair="short", hair_color=0, shirt="orange", arm="up", mouth="open"),
    kid(500, 545, 0.8, skin=0, hair="pigtails", hair_color=1, shirt="sky", arm="wave", mouth="smile", flip=True),
    block(120, 470, 70, C["sun"], "A"), block(150, 410, 60, C["rose"], "B"), block(190, 480, 60, C["grape"], "C"),
    f'<circle cx="660" cy="500" r="42" fill="{C["rose"]}"/><path d="M618 500 Q660 470 702 500 M660 458 L660 542" fill="none" stroke-width="4"/>',
    star(400, 200, 22, C["sun"]), star(250, 260, 12, C["white"]), star(560, 250, 14, C["white"]),
])

# 3. Lớp 1-2 (thẻ từ vựng)
def flashcard(x, y, rot, fill, letter, word):
    return (f'<g transform="translate({x} {y}) rotate({rot})"><rect x="-70" y="-90" width="140" height="180" rx="16" fill="{C["white"]}"/>'
            f'<circle cx="0" cy="-26" r="42" fill="{fill}"/>'
            f'<text x="0" y="-8" text-anchor="middle" font-family="Arial Rounded MT Bold, Nunito, Baloo 2, sans-serif" font-weight="800" font-size="52" fill="{INK}" stroke="none">{letter}</text>'
            f'<text x="0" y="64" text-anchor="middle" font-family="Arial Rounded MT Bold, Nunito, Baloo 2, sans-serif" font-weight="800" font-size="30" fill="{INK}" stroke="none">{word}</text></g>')

grade12 = "".join([
    frame(C["sun_s"]),
    f'<rect x="-10" y="470" width="820" height="140" fill="{C["wood"]}" stroke="none"/><path d="M-10 470 L810 470"/>',
    flashcard(560, 220, 8, C["rose"], "A", "apple"),
    flashcard(690, 260, -6, C["sky"], "B", "ball"),
    flashcard(620, 400, 4, C["mint"], "C", "cat"),
    kid(230, 560, 1.05, skin=1, hair="bob", hair_color=0, shirt="mint", arm="up", mouth="open"),
    kid(400, 565, 0.95, skin=2, hair="short", hair_color=3, shirt="rose", arm="wave", mouth="smile", flip=True),
    f'<rect x="80" y="470" width="90" height="16" rx="8" fill="{C["orange"]}" transform="rotate(-8 125 478)"/>',
    star(120, 120, 20, C["sun"]), star(420, 90, 14, C["rose"]), star(330, 180, 10, C["grape"]),
])

# 4. Lớp 3-5 / Cambridge
grade35 = "".join([
    frame(C["grape_s"]),
    f'<rect x="-10" y="470" width="820" height="140" fill="{C["sky_s"]}" stroke="none"/><path d="M-10 470 L810 470"/>',
    bubble(110, 90, 170, 70, "Hi!", C["white"]),
    bubble(500, 70, 230, 70, "I can do it!", C["sun"]),
    kid(260, 560, 1.15, skin=0, hair="long", hair_color=0, shirt="sky", arm="wave", mouth="open"),
    kid(470, 565, 1.15, skin=3, hair="spiky", hair_color=1, shirt="orange", arm="up", mouth="smile", flip=True),
    # cúp & sách
    f'<path d="M620 360 L700 360 L690 420 Q660 440 630 420 Z" fill="{C["sun"]}"/><rect x="645" y="440" width="30" height="20" fill="{C["sun"]}"/><rect x="625" y="460" width="70" height="16" rx="5" fill="{C["wood_d"]}"/>',
    star(660, 395, 14, C["white"]),
    f'<path d="M600 520 L660 506 L720 520 L720 470 L660 456 L600 470 Z" fill="{C["white"]}"/><path d="M660 456 L660 506"/>',
    star(90, 300, 14, C["rose"]), star(740, 220, 18, C["mint"]),
])

# 5. Bài hát & phát âm
songs = "".join([
    frame(C["mint_s"]),
    f'<rect x="-10" y="480" width="820" height="130" fill="{C["sun_s"]}" stroke="none"/><path d="M-10 480 L810 480"/>',
    kid(400, 575, 1.25, skin=2, hair="pigtails", hair_color=0, shirt="grape", arm="up", mouth="sing"),
    note(230, 220, C["rose"]), note(560, 180, C["sky"]), note(620, 320, C["orange"]), note(170, 340, C["mint"]),
    star(680, 120, 18, C["sun"]), star(120, 140, 14, C["rose"]),
    bubble(470, 260, 150, 60, "ABC ♪", C["white"]),
])

# 6. Giờ kể chuyện
story = "".join([
    frame(C["orange_s"]),
    f'<ellipse cx="400" cy="520" rx="360" ry="70" fill="{C["rose_s"]}"/>',
    teacher(400, 470, 1.05),
    f'<g transform="translate(330 440)"><path d="M0 0 L70 -14 L140 0 L140 -80 L70 -94 L0 -80 Z" fill="{C["white"]}"/><path d="M70 -94 L70 -14"/>'
    f'<circle cx="38" cy="-48" r="16" fill="{C["sun"]}"/><path d="M96 -36 L122 -70 L130 -36 Z" fill="{C["mint"]}"/></g>',
    kid(170, 560, 0.85, skin=0, hair="bun", hair_color=2, shirt="sky", mouth="open"),
    kid(630, 565, 0.85, skin=1, hair="short", hair_color=0, shirt="sun", mouth="smile", flip=True),
    kid(740, 575, 0.75, skin=3, hair="bob", hair_color=1, shirt="mint", mouth="open", flip=True),
    star(140, 140, 20, C["sun"]), star(660, 110, 14, C["rose"]), star(700, 230, 10, C["grape"]),
])

ITEMS = {
    "kids-classroom.svg": (classroom, "Cô giáo và các bé trong lớp học tiếng Anh"),
    "kids-preschool.svg": (preschool, "Bé mầm non chơi khối chữ cái"),
    "kids-grade-1-2.svg": (grade12, "Bé tiểu học học từ vựng với thẻ hình"),
    "kids-grade-3-5.svg": (grade35, "Bé tiểu học tự tin nói tiếng Anh"),
    "kids-songs.svg": (songs, "Bé hát bài hát tiếng Anh"),
    "kids-storytime.svg": (story, "Giờ kể chuyện tiếng Anh"),
}

# Ảnh chia sẻ mạng xã hội 1200x630: chữ bên trái, lớp học bên phải
og_text = (
    f'<rect x="-10" y="-10" width="1220" height="650" fill="{C["cream"]}" stroke="none"/>'
    f'<g transform="translate(600 45) scale(0.75)">{classroom}</g>'
    f'<rect x="560" y="15" width="640" height="600" fill="none" stroke="none"/>'
    f'<text x="70" y="200" font-family="Arial Rounded MT Bold, Nunito, sans-serif" font-size="78" fill="{INK}" stroke="none">RosyClass</text>'
    f'<text x="70" y="290" font-family="Arial Rounded MT Bold, Nunito, sans-serif" font-size="44" fill="{INK}" stroke="none">Tiếng Anh cho bé</text>'
    f'<rect x="64" y="318" width="330" height="76" rx="38" fill="{C["rose"]}"/>'
    f'<text x="229" y="370" text-anchor="middle" font-family="Arial Rounded MT Bold, Nunito, sans-serif" font-size="40" fill="{INK}" stroke="none">3 – 11 tuổi</text>'
    f'<text x="70" y="470" font-family="Arial Rounded MT Bold, Nunito, sans-serif" font-size="28" fill="#5c5470" stroke="none">Mầm non · Tiểu học · Gia Lâm, Hà Nội</text>'
)
with open(os.path.join(OUT, "og-rosyclass.svg"), "w") as f:
    f.write(svg(1200, 630, og_text, "RosyClass – Tiếng Anh cho bé 3–11 tuổi"))

for name, (body, title) in ITEMS.items():
    with open(os.path.join(OUT, name), "w") as f:
        f.write(svg(800, 600, body, title))
print("\n".join(ITEMS))
