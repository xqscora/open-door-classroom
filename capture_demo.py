from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).parent
OUT = ROOT / "demo"


def main() -> None:
    OUT.mkdir(exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1200, "height": 900}, device_scale_factor=1)
        page = context.new_page()
        page.goto("http://127.0.0.1:8789/", wait_until="networkidle")
        page.locator('[data-signal="unclear"]').click()
        page.get_by_role("button", name="Send signal", exact=True).click()
        page.get_by_role("tab", name="Teacher board", exact=True).click()
        page.get_by_role("button", name="Load sample room", exact=True).click()
        page.screenshot(path=str(OUT / "open-door-classroom_teacher-board_2026-09-04.png"), full_page=True)
        assert page.locator("#signalRows").get_by_text("Add a worked example before independent practice.", exact=True).is_visible()
        assert page.get_by_text("5 signals", exact=True).is_visible()
        context.close()
        browser.close()


if __name__ == "__main__":
    main()
