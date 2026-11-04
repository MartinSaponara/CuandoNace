"""Genera el HTML del calendario '¿Cuándo nacerá Santiago?' (2 páginas A4 horizontales).

Página 1 = Noviembre 2026 (activos: 16–30 nov)
Página 2 = Diciembre 2026 (activos: 1–26 dic; 16 dic destacado como FPP médica)
"""
import calendar
import datetime
from pathlib import Path

OUTPUT_HTML = Path("/home/z/my-project/scripts/calendario_santiago.html")

DOW_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
DOW_CLASS = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"]

MONTH_LABEL_ES = {11: "Noviembre", 12: "Diciembre"}
MONTH_ABBR_ES = {11: "nov", 12: "dic"}

# (year, month) -> (start_day, end_day) for the active range
RANGES = {
    11: (16, 30),  # November: 16–30 active
    12: (1, 26),   # December: 1–26 active
}
FPP_DATE = (2026, 12, 16)  # 16 de diciembre = Fecha Probable de Parto (FPP médica)


def build_calendar_cells(year: int, month: int) -> list[list]:
    """Devuelve una lista de semanas; cada semana es una lista de 7 items.
    Item = None si el día no pertenece al mes, o dict con día / dow_index / estado."""
    start_active, end_active = RANGES[month]
    weeks = calendar.Calendar(firstweekday=0).monthdayscalendar(year, month)
    rows = []
    for week in weeks:
        row = []
        for dow_idx, day in enumerate(week):
            if day == 0:
                row.append(None)
            else:
                state = "active" if start_active <= day <= end_active else "muted"
                fpp = (year, month, day) == FPP_DATE
                row.append({
                    "day": day,
                    "dow_idx": dow_idx,
                    "state": state,
                    "fpp": fpp,
                })
        rows.append(row)
    return rows


def render_cell(cell) -> str:
    """Renderiza una celda de día del calendario."""
    if cell is None:
        return '<div class="cell empty"></div>'

    state = cell["state"]
    day = cell["day"]
    dow = DOW_CLASS[cell["dow_idx"]]
    month_abbr = MONTH_ABBR_ES[datetime.date(2026, 1, 1).month]  # placeholder
    return ""  # replaced below


def render_cell_v2(cell, month_abbr: str) -> str:
    if cell is None:
        return '<div class="cell empty"></div>'

    day = cell["day"]
    dow = DOW_CLASS[cell["dow_idx"]]
    classes = ["cell", dow]

    if cell["fpp"]:
        classes.append("fpp")
        star = '<span class="star">★</span>'
    else:
        star = ""

    if cell["state"] == "muted":
        classes.append("muted")
        return (
            f'<div class="{" ".join(classes)}">'
            f'<div class="day-num">{day}</div>'
            f'<div class="day-month">{month_abbr}</div>'
            f'</div>'
        )

    classes.append("active")
    return (
        f'<div class="{" ".join(classes)}">'
        f'{star}'
        f'<div class="day-num">{day} <span class="day-month">{month_abbr}</span></div>'
        f'<div class="checkbox"></div>'
        f'<div class="name-line"></div>'
        f'</div>'
    )


def render_page(year: int, month: int, page_num: int, total_pages: int) -> str:
    month_label = MONTH_LABEL_ES[month]
    month_abbr = MONTH_ABBR_ES[month]
    weeks = build_calendar_cells(year, month)

    # Encabezado: subtítulo cambia según la página
    if page_num == 1:
        subtitle = "Noviembre 2026"
    else:
        subtitle = "Diciembre 2026"

    dow_row = ""
    for i, (label, cls) in enumerate(zip(DOW_ES, DOW_CLASS)):
        weekend = " weekend" if cls in ("sab", "dom") else ""
        dow_row += f'<div class="dow{weekend}">{label}</div>'

    grid_html = dow_row
    for week in weeks:
        for cell in week:
            grid_html += render_cell_v2(cell, month_abbr)

    # Pequeña leyenda inferior
    legend_html = """
      <div class="legend">
        <div class="legend-item">
          <span class="legend-box active"></span>
          <span>Día para apostar</span>
        </div>
        <div class="legend-item">
          <span class="legend-box fpp"></span>
          <span>16 dic · fecha probable de parto</span>
        </div>
        <div class="legend-item">
          <span class="legend-box muted"></span>
          <span>Fuera del rango</span>
        </div>
      </div>
    """

    return f"""
    <section class="page" data-month="{month_label}">
      <div class="bg-decor"></div>
      <header class="header">
        <div class="header-left">
          <div class="eyebrow">Calendario interactivo</div>
          <h1>¿Cuándo nacerá Santiago?</h1>
          <div class="subtitle">{subtitle}</div>
        </div>
        <div class="header-right">
          <div class="month-label">{month_label} 2026</div>
          <div>Hoja {page_num} de {total_pages}</div>
        </div>
      </header>

      <div class="instr">
        <span class="icon">✎</span>
        <span><strong>Cómo jugar:</strong> Elegí el día que creés que nacerá Santiago, marcá el cuadrito ☐ y escribi tu nombre en la línea de abajo.</span>
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
  --muted-bg: #ECEEF2;
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
  padding: 10mm 13mm 8mm;
  page-break-after: always;
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--cream);
}
.page:last-child { page-break-after: auto; }

/* Decorative background: radial gradients painted directly on .bg-decor.
   No positioned children, so nothing can overflow the page. */
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
  margin-bottom: 5mm;
  border-bottom: 0.4mm solid var(--line);
  padding-bottom: 3.5mm;
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
  padding: 2.2mm 4mm;
  margin-bottom: 4mm;
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
  grid-template-rows: 6.5mm repeat(6, 1fr);
  gap: 1.0mm;
}
.cal .dow {
  text-align: center;
  font-family: 'Baloo 2', cursive;
  font-size: 8.5pt;
  font-weight: 600;
  color: var(--ink);
  opacity: 0.55;
  padding: 1mm 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cal .dow.weekend { color: var(--sky-deep); opacity: 0.9; }

.cell {
  background: #fff;
  border: 0.3mm solid var(--line);
  border-radius: 1.8mm;
  padding: 1.3mm 1.8mm 1.5mm;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0;
  overflow: hidden;
}
.cell.empty {
  background: transparent;
  border: none;
}
.cell.muted {
  background: var(--muted-bg);
  border-color: transparent;
  padding: 1.3mm 1.8mm;
}
.cell.muted .day-num {
  font-family: 'Baloo 2', cursive;
  font-size: 11pt;
  font-weight: 500;
  color: var(--muted);
  line-height: 1;
}
.cell.muted .day-month {
  font-family: 'Inter', sans-serif;
  font-size: 7.5pt;
  font-weight: 500;
  color: var(--muted);
  opacity: 0.7;
  margin-top: 0.5mm;
  letter-spacing: 0.05em;
}
.cell.muted .checkbox,
.cell.muted .name-line { display: none; }

.cell.active .day-num {
  font-family: 'Baloo 2', cursive;
  font-size: 13pt;
  font-weight: 700;
  color: var(--ink);
  line-height: 1;
  display: flex;
  align-items: baseline;
  gap: 1.2mm;
}
.cell.active .day-month {
  font-family: 'Inter', sans-serif;
  font-size: 7.5pt;
  font-weight: 500;
  color: var(--ink);
  opacity: 0.55;
  letter-spacing: 0.05em;
}
.cell.active .checkbox {
  width: 3.5mm; height: 3.5mm;
  border: 0.35mm solid var(--sky-deep);
  border-radius: 0.8mm;
  margin-top: auto;
  margin-bottom: 1.2mm;
  background: #fff;
}
.cell.active .name-line {
  border-bottom: 0.3mm solid var(--line);
  height: 3mm;
  width: 100%;
}

/* Weekend cells get a soft sky tint */
.cell.active.sat,
.cell.active.sun {
  background: var(--sky-soft);
}

/* Highlighted FPP cell (Dec 16) */
.cell.fpp {
  background: var(--mint-deep) !important;
  border: 0.5mm solid var(--mint-deep);
  color: #fff;
  box-shadow: 0 0 0 0.3mm rgba(107, 181, 138, 0.3);
}
.cell.fpp .day-num { color: #fff; font-size: 15pt; }
.cell.fpp .day-num .day-month { color: #fff; opacity: 0.9; }
.cell.fpp .day-month { color: #fff; opacity: 0.95; }
.cell.fpp .checkbox {
  border-color: #fff;
  background: rgba(255,255,255,0.18);
}
.cell.fpp .name-line { border-color: rgba(255,255,255,0.65); }
.cell.fpp .star {
  position: absolute;
  bottom: 1.2mm; right: 1.5mm;
  color: #FFE066;
  font-size: 11pt;
  line-height: 1;
  text-shadow: 0 0 1mm rgba(0,0,0,0.15);
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
.footer .legend-box.muted { background: var(--muted-bg); border-color: transparent; }
"""


def main():
    html_parts = [
        "<!DOCTYPE html>",
        '<html lang="es">',
        '<head>',
        '<meta charset="UTF-8">',
        '<title>¿Cuándo nacerá Santiago? — Calendario</title>',
        '<meta name="author" content="Z.ai">',
        '<meta name="description" content="Calendario de apuestas para la fecha probable de parto de Santiago">',
        '<link rel="preconnect" href="https://fonts.googleapis.com">',
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
        '<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">',
        '<style>',
        CSS,
        '</style>',
        '</head>',
        '<body>',
    ]
    html_parts.append(render_page(2026, 11, 1, 2))
    html_parts.append(render_page(2026, 12, 2, 2))
    html_parts.append('</body></html>')

    html_str = "\n".join(html_parts)
    OUTPUT_HTML.write_text(html_str, encoding="utf-8")
    print(f"HTML generado: {OUTPUT_HTML} ({len(html_str)} bytes)")


if __name__ == "__main__":
    main()
