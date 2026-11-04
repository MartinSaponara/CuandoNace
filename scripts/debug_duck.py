"""Diagnóstico: mide el bounding box real del patito en la página."""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1123, "height": 794})  # A4 landscape @ 96dpi
        await page.goto("file:///home/z/my-project/scripts/calendario_santiago.html")
        await page.wait_for_load_state("networkidle")
        await page.wait_for_timeout(800)  # fonts

        # Medir el .page
        page_box = await page.evaluate("""() => {
            const el = document.querySelector('.page');
            const r = el.getBoundingClientRect();
            return {left: r.left, top: r.top, width: r.width, height: r.height, right: r.right, bottom: r.bottom};
        }""")
        print(f".page: {page_box}")

        # Medir el .corner-tr
        corner_box = await page.evaluate("""() => {
            const el = document.querySelector('.corner-tr');
            const r = el.getBoundingClientRect();
            return {left: r.left, top: r.top, width: r.width, height: r.height, right: r.right, bottom: r.bottom};
        }""")
        print(f".corner-tr: {corner_box}")

        # Medir el svg.illo-duck dentro de corner-tr
        duck_box = await page.evaluate("""() => {
            const el = document.querySelector('.corner-tr svg');
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return {left: r.left, top: r.top, width: r.width, height: r.height, right: r.right, bottom: r.bottom};
        }""")
        print(f"svg.illo-duck: {duck_box}")

        # Medir el viewport
        vp = await page.evaluate("() => ({innerWidth: window.innerWidth, innerHeight: window.innerHeight})")
        print(f"viewport: {vp}")

        # ¿El patito está fuera del viewport?
        if duck_box:
            if duck_box['right'] > vp['innerWidth']:
                print(f"!! PATITO SE DESBORDA: right={duck_box['right']:.0f} > viewport width={vp['innerWidth']}")
            else:
                print(f"OK: patito dentro del viewport")

        # ¿El patito está fuera del .page?
        if duck_box and page_box:
            if duck_box['right'] > page_box['right']:
                print(f"!! PATITO FUERA DE .page: right={duck_box['right']:.0f} > page right={page_box['right']:.0f}")

        await browser.close()

asyncio.run(main())
