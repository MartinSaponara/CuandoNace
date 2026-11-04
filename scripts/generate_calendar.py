"""Genera el HTML del calendario '¿Cuándo nacerá Santiago?' — VERSIÓN 2.

Cambios vs v1:
- 2 hojas A4 horizontales con 3 semanas cada una (~21 días por hoja)
- Hoja 1: 16 nov – 6 dic 2026 (3 semanas completas Lun→Dom)
- Hoja 2: 7 dic – 26 dic 2026 (3 semanas: la última celda Dom 27 queda vacía)
- Sin celdas atenuadas/muted: solo se muestran los días activos (o celdas vacías al final)
- Celdas mucho más grandes con 3 líneas para nombres (varias personas pueden firmar)
- El 16 dic sigue destacado en verde menta con estrella ★ (sin texto "FPP médica")
- Paleta celeste/verde/crema (sin rosa)
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


def build_weeks(start: datetime.date, end: datetime.date) -> list[list]:
    """Devuelve una lista de semanas (filas de 7 celdas).
    Cada celda es un dict o None si cae fuera del rango (solo al final de la última fila)."""
    weeks = []
    cur = start
    # Aseguramos que start sea lunes
    assert cur.weekday() == 0, f"Start debe ser lunes, fue {cur} ({cur.weekday()})"
    while cur <= end:
        week = []
        for dow_idx in range(7):
            if cur > end:
                week.append(None)  # celda vacía al final
            elif cur.weekday() != dow_idx:
                # Esto no debería pasar si start es lunes y avanzamos día por día
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
    """Renderiza una celda de día del calendario (versión celdas grandes con 3 líneas)."""
    if cell is None:
        return '<div class="cell empty"></div>'

    classes = ["cell", DOW_CLASS[cell["dow_idx"]]]
    star = ""
    if cell["fpp"]:
        classes.append("fpp")
        star = '<span class="star">★</span>'

    day = cell["day"]
    month = cell["month_abbr"]

    return (
        f'<div class="{" ".join(classes)}">'
        f'{star}'
        f'<div class="day-num">{day} <span class="day-month">{month}</span></div>'
        f'<div class="checkbox"></div>'
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

    # Encabezado: subtítulo con el rango de fechas
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

    return f"""
    <section class="page" data-range="{range_str}">
      <div class="bg-decor"></div>
      <header class="header">
        <div class="header-left">
          <div class="eyebrow">Calendario interactivo</div>
          <h1>¿Cuándo nacerá Santiago?</h1>
          <div class="subtitle">{subtitle}</div>
        </div>
        <div class="header-right">
          <div class="month-label">{range_str}</div>
          <div>Hoja {page_num} de {total_pages}</div>
        </div>
      </header>

      <div class="instr">
        <span class="icon">✎</span>
        <span><strong>Cómo jugar:</strong> Elegí el día que creés que nacerá Santiago, marcá el cuadrito ☐ y escribi tu nombre en una de las líneas. ¡Cada casilla tiene lugar para 3 personas!</span>
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
  --cream: #F4FAFE;
  --sky: #BDE3F5;
  --sky-soft: #E5F2FA;
  --sky-deep: #5BA7D9;
  --mint: #C7E8CE;
  --mint-soft: #E6F3E9;
  --mint-deep: #6BB58A;
  --yellow: #FFE9B1;
  --ink: #3D4A5C;
  --muted: #AEB6C2;
  --line: #DEE5ED;
}
html, body {
  background: var(--cream);
  font-family: 'Inter', system-ui, sans-serif;
  color: var(--ink);
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.page {
  width: 297mm;
  height: 210mm;
  padding: 9mm 13mm 7mm;
  page-break-after: always;
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--cream);
}
.page:last-child { page-break-after: auto; }

/* Decorative background: radial gradients painted directly on .bg-decor */
.bg-decor {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 100% 0%, rgba(189, 227, 245, 0.70) 0%, rgba(189, 227, 245, 0.25) 18%, transparent 38%),
    radial-gradient(circle at 0% 100%, rgba(199, 232, 206, 0.60) 0%, rgba(199, 232, 206, 0.22) 16%, transparent 35%),
    radial-gradient(circle at 92% 88%, rgba(189, 227, 245, 0.45) 0%, transparent 18%);
}

.header {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 4mm;
  border-bottom: 0.4mm solid var(--line);
  padding-bottom: 3mm;
}
.header-left .eyebrow {
  font-size: 8.5pt;
  letter-spacing: 0.20em;
  text-transform: uppercase;
  color: var(--mint-deep);
  font-weight: 600;
  margin-bottom: 1.5mm;
}
.header-left h1 {
  font-family: 'Baloo 2', cursive;
  font-size: 30pt;
  font-weight: 700;
  line-height: 1.0;
  color: var(--ink);
  letter-spacing: -0.01em;
}
.header-left .subtitle {
  font-size: 10.5pt;
  color: var(--ink);
  opacity: 0.7;
  margin-top: 1.2mm;
  font-weight: 400;
}
.header-right {
  text-align: right;
  font-size: 8.5pt;
  color: var(--ink);
  opacity: 0.75;
  line-height: 1.4;
}
.header-right .month-label {
  font-family: 'Baloo 2', cursive;
  font-size: 17pt;
  color: var(--sky-deep);
  font-weight: 600;
  margin-bottom: 0.5mm;
}

.instr {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 3mm;
  background: #fff;
  border: 0.3mm solid var(--line);
  border-radius: 2mm;
  padding: 2mm 4mm;
  margin-bottom: 3.5mm;
  font-size: 9pt;
  line-height: 1.4;
}
.instr .icon { font-size: 11pt; color: var(--mint-deep); }
.instr strong { color: var(--mint-deep); }

.cal {
  position: relative;
  z-index: 2;
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: 6mm repeat(3, 1fr);
  gap: 1.2mm;
}
.cal .dow {
  text-align: center;
  font-family: 'Baloo 2', cursive;
  font-size: 9pt;
  font-weight: 600;
  color: var(--ink);
  opacity: 0.55;
  padding: 0.5mm 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cal .dow.weekend { color: var(--sky-deep); opacity: 0.9; }

.cell {
  background: #fff;
  border: 0.3mm solid var(--line);
  border-radius: 1.8mm;
  padding: 2.2mm 2.5mm 2.5mm;
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
  font-family: 'Baloo 2', cursive;
  font-size: 17pt;
  font-weight: 700;
  color: var(--ink);
  line-height: 1;
  display: flex;
  align-items: baseline;
  gap: 1.5mm;
  margin-bottom: 1mm;
}
.cell .day-month {
  font-family: 'Inter', sans-serif;
  font-size: 8.5pt;
  font-weight: 500;
  color: var(--ink);
  opacity: 0.55;
  letter-spacing: 0.05em;
}
.cell .checkbox {
  position: absolute;
  top: 2.2mm; right: 2.5mm;
  width: 4.5mm; height: 4.5mm;
  border: 0.4mm solid var(--sky-deep);
  border-radius: 1mm;
  background: #fff;
}

/* Name lines (3 per cell) */
.cell .name-lines {
  display: flex;
  flex-direction: column;
  gap: 2.5mm;
  margin-top: auto;
  padding-top: 1.5mm;
}
.cell .name-line {
  border-bottom: 0.3mm solid var(--line);
  height: 4.5mm;
  width: 100%;
}

/* Weekend cells get a soft sky tint */
.cell.sat,
.cell.sun {
  background: var(--sky-soft);
}

/* Highlighted FPP cell (Dec 16) */
.cell.fpp {
  background: var(--mint-deep) !important;
  border: 0.5mm solid var(--mint-deep);
}
.cell.fpp .day-num { color: #fff; }
.cell.fpp .day-month { color: #fff; opacity: 0.9; }
.cell.fpp .checkbox {
  border-color: #fff;
  background: rgba(255,255,255,0.18);
}
.cell.fpp .name-line { border-color: rgba(255,255,255,0.65); }
.cell.fpp .star {
  position: absolute;
  top: 2.2mm; left: 2.5mm;
  color: #FFE066;
  font-size: 13pt;
  line-height: 1;
  text-shadow: 0 0 1mm rgba(0,0,0,0.15);
}
.cell.fpp .day-num {
  padding-left: 6mm;  /* espacio para la estrella */
}

.footer {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 3mm;
  font-size: 7.5pt;
  color: var(--ink);
  opacity: 0.65;
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
  border-radius: 0.8mm;
  border: 0.2mm solid var(--line);
  background: #fff;
}
.footer .legend-box.fpp { background: var(--mint-deep); border-color: var(--mint-deep); }
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
        '<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">',
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
