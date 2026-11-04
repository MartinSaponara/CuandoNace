"""Genera el HTML del calendario '¿Cuándo nacerá Santiago?' — VERSIÓN 3 INFANTIL.

Cambios vs v2:
- Tipografía Fredoka (más redondeada e infantil) + Baloo 2 como respaldo
- Ilustraciones SVG inline (chupete, nube, sonajero, piececito, patito)
- Bordes más redondeados (3-4mm), colores un toque más vivos
- Chupete grande en el encabezado acompañando al título
- Líneas de firma punteadas en vez de sólidas
- Día FPP con icono de bebé + estrella
- Conserva: 3 semanas por hoja, 3 líneas para nombres, paleta celeste/verde (sin rosa)
"""
import datetime
from pathlib import Path

OUTPUT_HTML = Path("/home/z/my-project/scripts/calendario_santiago.html")

DOW_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
DOW_CLASS = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"]

MONTH_ABBR_ES = {11: "nov", 12: "dic"}

# Rango de cada hoja (start, end) — start siempre lunes
SHEETS = [
    (datetime.date(2026, 11, 16), datetime.date(2026, 12, 6)),  # Hoja 1: 16 nov – 6 dic
    (datetime.date(2026, 12, 7),  datetime.date(2026, 12, 26)),  # Hoja 2: 7 – 26 dic
]
FPP_DATE = datetime.date(2026, 12, 16)  # 16 dic = Fecha Probable de Parto


# ─── Ilustraciones SVG inline (vectoriales, nítidas al imprimir) ───

SVG_PACIFIER = """
<svg class="illo illo-pacifier" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="60" r="22" fill="#BDE3F5" stroke="#5BA7D9" stroke-width="3"/>
  <circle cx="50" cy="60" r="9" fill="#5BA7D9"/>
  <ellipse cx="50" cy="32" rx="9" ry="13" fill="#5BA7D9"/>
  <ellipse cx="50" cy="32" rx="4" ry="7" fill="#3D4A5C"/>
</svg>
"""

SVG_CLOUD = """
<svg class="illo illo-cloud" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
  <path d="M 25,50 Q 8,50 8,38 Q 8,28 20,26 Q 22,14 38,14 Q 52,14 56,26 Q 70,22 76,32 Q 90,32 90,44 Q 90,52 80,52 Z"
        fill="#fff" stroke="#5BA7D9" stroke-width="2.5" stroke-linejoin="round"/>
</svg>
"""

SVG_RATTLE = """
<svg class="illo illo-rattle" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="28" r="20" fill="#C7E8CE" stroke="#6BB58A" stroke-width="3"/>
  <circle cx="42" cy="22" r="4" fill="#6BB58A"/>
  <circle cx="58" cy="22" r="4" fill="#6BB58A"/>
  <circle cx="50" cy="34" r="4" fill="#6BB58A"/>
  <line x1="50" y1="48" x2="50" y2="84" stroke="#5BA7D9" stroke-width="6" stroke-linecap="round"/>
  <circle cx="50" cy="88" r="6" fill="#BDE3F5" stroke="#5BA7D9" stroke-width="3"/>
</svg>
"""

SVG_BABY_FOOT = """
<svg class="illo illo-foot" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="65" rx="22" ry="28" fill="#FBD3DD" stroke="#E48BA3" stroke-width="2.5"/>
  <circle cx="32" cy="32" r="6" fill="#FBD3DD" stroke="#E48BA3" stroke-width="2"/>
  <circle cx="48" cy="22" r="6" fill="#FBD3DD" stroke="#E48BA3" stroke-width="2"/>
  <circle cx="64" cy="22" r="6" fill="#FBD3DD" stroke="#E48BA3" stroke-width="2"/>
  <circle cx="76" cy="30" r="5" fill="#FBD3DD" stroke="#E48BA3" stroke-width="2"/>
</svg>
"""

SVG_DUCK = """
<svg class="illo illo-duck" viewBox="-8 -8 116 116" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="60" rx="28" ry="22" fill="#FFE9B1" stroke="#E0B865" stroke-width="2.5"/>
  <circle cx="58" cy="36" r="14" fill="#FFE9B1" stroke="#E0B865" stroke-width="2.5"/>
  <path d="M 70,36 L 84,32 L 80,42 Z" fill="#E0B865"/>
  <circle cx="55" cy="33" r="2.5" fill="#3D4A5C"/>
  <circle cx="62" cy="32" r="1" fill="#fff"/>
  <path d="M 28,75 Q 22,80 28,82" fill="#E0B865"/>
  <path d="M 72,75 Q 78,80 72,82" fill="#E0B865"/>
</svg>
"""

SVG_STAR = """
<svg class="illo-star" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M 12,2 L 14.6,8.6 L 22,9.2 L 16.4,13.8 L 18.2,21 L 12,17 L 5.8,21 L 7.6,13.8 L 2,9.2 L 9.4,8.6 Z"
        fill="#FFE066" stroke="#E0B865" stroke-width="1.2" stroke-linejoin="round"/>
</svg>
"""

SVG_BABY_FACE = """
<svg class="illo illo-baby" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="34" fill="#FFF6E8" stroke="#E0B865" stroke-width="2.5"/>
  <path d="M 25,42 Q 30,28 42,32" stroke="#E0B865" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M 58,32 Q 70,28 75,42" stroke="#E0B865" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <circle cx="38" cy="48" r="3" fill="#3D4A5C"/>
  <circle cx="62" cy="48" r="3" fill="#3D4A5C"/>
  <path d="M 42,62 Q 50,68 58,62" stroke="#E48BA3" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <circle cx="32" cy="58" r="3.5" fill="#FBD3DD" opacity="0.7"/>
  <circle cx="68" cy="58" r="3.5" fill="#FBD3DD" opacity="0.7"/>
</svg>
"""


def build_weeks(start: datetime.date, end: datetime.date) -> list[list]:
    """Devuelve una lista de semanas (filas de 7 celdas)."""
    weeks = []
    cur = start
    while cur <= end:
        week = []
        for dow_idx in range(7):
            if cur > end:
                week.append(None)
            elif cur.weekday() != dow_idx:
                week.append(None)
            else:
                week.append({
                    "date": cur,
                    "day": cur.day,
                    "month_abbr": MONTH_ABBR_ES[cur.month],
                    "dow_idx": dow_idx,
                    "fpp": cur == FPP_DATE,
                })
            cur += datetime.timedelta(days=1)
        weeks.append(week)
    return weeks


def render_cell(cell) -> str:
    """Renderiza una celda de día del calendario (versión infantil)."""
    if cell is None:
        return '<div class="cell empty"></div>'

    classes = ["cell", DOW_CLASS[cell["dow_idx"]]]
    star = ""
    if cell["fpp"]:
        classes.append("fpp")
        star = f'<span class="star">{SVG_STAR}</span>'

    day = cell["day"]
    month = cell["month_abbr"]

    return (
        f'<div class="{" ".join(classes)}">'
        f'{star}'
        f'<div class="checkbox"></div>'
        f'<div class="day-num">{day} <span class="day-month">{month}</span></div>'
        f'<div class="name-lines">'
        f'<div class="name-line"></div>'
        f'<div class="name-line"></div>'
        f'<div class="name-line"></div>'
        f'</div>'
        f'</div>'
    )


def fmt_range(start: datetime.date, end: datetime.date) -> str:
    """Formato corto para el rango de fechas de cada hoja."""
    if start.month == end.month:
        return f"{start.day}–{end.day} {MONTH_ABBR_ES[start.month]}"
    return f"{start.day} {MONTH_ABBR_ES[start.month]} – {end.day} {MONTH_ABBR_ES[end.month]}"


def render_page(start: datetime.date, end: datetime.date, page_num: int, total_pages: int) -> str:
    weeks = build_weeks(start, end)
    range_str = fmt_range(start, end)
    subtitle = range_str

    dow_row = ""
    for label, cls in zip(DOW_ES, DOW_CLASS):
        weekend = " weekend" if cls in ("sab", "dom") else ""
        dow_row += f'<div class="dow{weekend}">{label}</div>'

    grid_html = dow_row
    for week in weeks:
        for cell in week:
            grid_html += render_cell(cell)

    legend_html = """
      <div class="legend">
        <div class="legend-item">
          <span class="legend-box active"></span>
          <span>Día para apostar · 3 líneas para firmar</span>
        </div>
        <div class="legend-item">
          <span class="legend-box fpp"></span>
          <span>16 dic · fecha probable de parto</span>
        </div>
      </div>
    """

    # Ilustración decorativa distinta según la hoja
    if page_num == 1:
        big_illo = SVG_PACIFIER
    else:
        big_illo = SVG_RATTLE

    return f"""
    <section class="page" data-range="{range_str}">
      <div class="bg-decor"></div>

      <div class="corner-illo corner-tl">{SVG_CLOUD}</div>
      <div class="corner-illo corner-tr">{SVG_DUCK}</div>

      <header class="header">
        <div class="header-left">
          <div class="eyebrow">Calendario interactivo</div>
          <div class="title-row">
            <span class="title-illo">{SVG_PACIFIER}</span>
            <h1>¿Cuándo nacerá Santiago?</h1>
            <span class="title-illo">{SVG_CLOUD}</span>
          </div>
          <div class="subtitle">{subtitle}</div>
        </div>
        <div class="header-right">
          <div class="month-label">{range_str}</div>
          <div>Hoja {page_num} de {total_pages}</div>
          <span class="header-illo">{big_illo}</span>
        </div>
      </header>

      <div class="instr">
        <span class="icon">{SVG_BABY_FOOT}</span>
        <span><strong>Cómo jugar:</strong> Elegí el día que creés que nacerá Santiago, marcá el cuadrito y escribi tu nombre en una de las líneas. ¡Cada casilla tiene lugar para 3 personas!</span>
      </div>

      <div class="cal">
        {grid_html}
      </div>

      <footer class="footer">
        {legend_html}
        <div>Calendario Santiago · 2026</div>
      </footer>
    </section>
    """


CSS = """
@page { size: A4 landscape; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --cream: #FAFCFE;
  --sky: #BDE3F5;
  --sky-soft: #EAF4FB;
  --sky-deep: #4A95CA;
  --mint: #C7E8CE;
  --mint-soft: #E9F4EC;
  --mint-deep: #5BAE7E;
  --yellow: #FFE9B1;
  --yellow-deep: #E0B865;
  --pink: #FBD3DD;
  --ink: #3D4A5C;
  --muted: #AEB6C2;
  --line: #D5E0EC;
}
html, body {
  background: var(--cream);
  font-family: 'Fredoka', 'Baloo 2', system-ui, sans-serif;
  color: var(--ink);
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.page {
  width: 297mm;
  height: 210mm;
  padding: 14mm 18mm 7mm;  /* padding top amplio para ilustraciones */
  page-break-after: always;
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--cream);
}
.page:last-child { page-break-after: auto; }

/* Fondo decorativo: manchas suaves celestes y verdes */
.bg-decor {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 100% 0%, rgba(189, 227, 245, 0.75) 0%, rgba(189, 227, 245, 0.25) 18%, transparent 38%),
    radial-gradient(circle at 0% 100%, rgba(199, 232, 206, 0.65) 0%, rgba(199, 232, 206, 0.22) 16%, transparent 35%),
    radial-gradient(circle at 50% 50%, rgba(255, 233, 177, 0.18) 0%, transparent 35%);
}

/* Ilustraciones decorativas en las esquinas */
.corner-illo {
  position: absolute;
  z-index: 5;  /* encima de todo */
  pointer-events: none;
  opacity: 0.90;
  width: 14mm;
  height: 14mm;
}
.corner-tl { top: 3mm; left: 4mm; }
.corner-tr { top: 3mm; right: 4mm; }

/* Header */
.header {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 6mm;
  margin-bottom: 4mm;
  border-bottom: 0.5mm dashed var(--sky);
  padding-bottom: 3mm;
}
.header-left .eyebrow {
  font-family: 'Fredoka', 'Baloo 2', sans-serif;
  font-size: 8.5pt;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--mint-deep);
  font-weight: 600;
  margin-bottom: 1.2mm;
}
.title-row {
  display: flex;
  align-items: center;
  gap: 4mm;
}
.title-row .title-illo {
  width: 14mm;
  flex-shrink: 0;
  display: block;
}
.title-row .title-illo:nth-child(3) { width: 18mm; }

.header-left h1 {
  font-family: 'Fredoka', 'Baloo 2', cursive;
  font-size: 32pt;
  font-weight: 700;
  line-height: 1.0;
  color: var(--ink);
  letter-spacing: -0.01em;
}
.header-left .subtitle {
  font-family: 'Fredoka', 'Baloo 2', sans-serif;
  font-size: 11pt;
  color: var(--sky-deep);
  margin-top: 1.5mm;
  font-weight: 500;
}
.header-right {
  text-align: right;
  font-size: 8.5pt;
  color: var(--ink);
  opacity: 0.8;
  line-height: 1.4;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5mm;
}
.header-right .month-label {
  font-family: 'Fredoka', 'Baloo 2', cursive;
  font-size: 16pt;
  color: var(--sky-deep);
  font-weight: 600;
}
.header-illo {
  width: 18mm;
  margin-top: 1mm;
  display: block;
}

/* Instrucciones */
.instr {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 3mm;
  background: #fff;
  border: 0.4mm solid var(--sky);
  border-radius: 4mm;
  padding: 2mm 4mm 2mm 3mm;
  margin-bottom: 3.5mm;
  font-family: 'Fredoka', 'Baloo 2', sans-serif;
  font-size: 9pt;
  line-height: 1.4;
}
.instr .icon {
  width: 7mm;
  flex-shrink: 0;
  display: block;
}
.instr strong { color: var(--mint-deep); }

/* Calendario */
.cal {
  position: relative;
  z-index: 2;
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: 6mm repeat(3, 1fr);
  gap: 1.4mm;
}
.cal .dow {
  text-align: center;
  font-family: 'Fredoka', 'Baloo 2', cursive;
  font-size: 10pt;
  font-weight: 600;
  color: var(--ink);
  opacity: 0.6;
  padding: 0.5mm 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cal .dow.weekend { color: var(--sky-deep); opacity: 0.95; }

.cell {
  background: #fff;
  border: 0.4mm solid var(--line);
  border-radius: 3.5mm;
  padding: 2.5mm 2.5mm 2.5mm;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0;
}
.cell.empty {
  background: transparent;
  border: none;
}

.cell .day-num {
  font-family: 'Fredoka', 'Baloo 2', cursive;
  font-size: 19pt;
  font-weight: 700;
  color: var(--ink);
  line-height: 1;
  display: flex;
  align-items: baseline;
  gap: 1.5mm;
  margin-bottom: 1mm;
}
.cell .day-month {
  font-family: 'Fredoka', 'Baloo 2', sans-serif;
  font-size: 9pt;
  font-weight: 500;
  color: var(--ink);
  opacity: 0.55;
  letter-spacing: 0.04em;
}
.cell .checkbox {
  position: absolute;
  top: 2.5mm; right: 2.5mm;
  width: 4.5mm; height: 4.5mm;
  border: 0.5mm solid var(--sky-deep);
  border-radius: 1.5mm;
  background: #fff;
}

/* Name lines: punteadas y más juguetonas */
.cell .name-lines {
  display: flex;
  flex-direction: column;
  gap: 2.5mm;
  margin-top: auto;
  padding-top: 1.5mm;
}
.cell .name-line {
  border-bottom: 0.4mm dashed var(--line);
  height: 4.5mm;
  width: 100%;
}

/* Weekend cells */
.cell.sat,
.cell.sun {
  background: var(--sky-soft);
  border-color: var(--sky);
}

/* Día FPP: verde menta con estrella */
.cell.fpp {
  background: var(--mint-deep) !important;
  border: 0.6mm solid var(--mint-deep);
}
.cell.fpp .day-num { color: #fff; }
.cell.fpp .day-month { color: #fff; opacity: 0.95; }
.cell.fpp .checkbox {
  border-color: #fff;
  background: rgba(255,255,255,0.18);
}
.cell.fpp .name-line { border-color: rgba(255,255,255,0.7); }
.cell.fpp .star {
  position: absolute;
  top: 2mm; left: 2mm;
  width: 6.5mm;
  height: 6.5mm;
  z-index: 3;
}
.cell.fpp .star svg { width: 100%; height: 100%; display: block; }
.cell.fpp .day-num {
  padding-left: 8mm;  /* espacio para la estrella */
}

/* Footer */
.footer {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 3mm;
  font-family: 'Fredoka', 'Baloo 2', sans-serif;
  font-size: 7.5pt;
  color: var(--ink);
  opacity: 0.7;
}
.footer .legend {
  display: flex;
  gap: 5mm;
  align-items: center;
}
.footer .legend-item {
  display: flex;
  align-items: center;
  gap: 1.5mm;
}
.footer .legend-box {
  width: 3mm; height: 3mm;
  border-radius: 1mm;
  border: 0.2mm solid var(--line);
  background: #fff;
}
.footer .legend-box.fpp { background: var(--mint-deep); border-color: var(--mint-deep); }

/* SVG responsive por defecto */
svg.illo { display: block; width: 100%; height: 100%; max-width: 100%; max-height: 100%; }
"""


def main():
    html_parts = [
        "<!DOCTYPE html>",
        '<html lang="es">',
        '<head>',
        '<meta charset="UTF-8">',
        '<title>¿Cuándo nacerá Santiago? — Calendario</title>',
        '<meta name="author" content="Z.ai">',
        '<meta name="description" content="Calendario de fechas probables de parto para Santiago">',
        '<link rel="preconnect" href="https://fonts.googleapis.com">',
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
        '<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Fredoka:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">',
        '<style>',
        CSS,
        '</style>',
        '</head>',
        '<body>',
    ]
    total = len(SHEETS)
    for i, (start, end) in enumerate(SHEETS, 1):
        html_parts.append(render_page(start, end, i, total))
    html_parts.append('</body></html>')

    html_str = "\n".join(html_parts)
    OUTPUT_HTML.write_text(html_str, encoding="utf-8")
    print(f"HTML generado: {OUTPUT_HTML} ({len(html_str)} bytes)")


if __name__ == "__main__":
    main()
