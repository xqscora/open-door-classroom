#!/usr/bin/env python3
"""Exercise the local Open Door Classroom student-to-teacher demo."""
from __future__ import annotations

import functools
import http.server
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
PORT = 8799


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args: object) -> None:
        pass


def start_server() -> tuple[http.server.ThreadingHTTPServer, threading.Thread]:
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, thread


def main() -> None:
    server, thread = start_server()
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            context = browser.new_context(viewport={"width": 1280, "height": 800})
            page = context.new_page()
            external_requests: list[str] = []
            page.on(
                "request",
                lambda request: external_requests.append(request.url)
                if "127.0.0.1" not in request.url
                else None,
            )
            page.goto(f"http://127.0.0.1:{PORT}/", wait_until="networkidle")

            assert page.title() == "Open Door Classroom"
            assert page.locator("#studentView").is_visible()
            assert page.locator(".signal").count() == 4

            page.get_by_role("button", name="Need an example").click()
            assert page.locator("#selectedSignal").is_visible()
            assert page.locator("#selectedLabel").inner_text() == "Need an example"
            page.get_by_role("button", name="Send signal").click()
            assert "Signal sent" in page.locator("#studentNotice").inner_text()
            assert page.evaluate("JSON.parse(localStorage.getItem('open-door-classroom-signals'))") == ["example"]

            page.get_by_role("tab", name="Teacher board").click()
            page.get_by_role("button", name="Load sample room").click()
            assert page.locator("#teacherView").is_visible()
            assert page.locator("#totalSignals").inner_text() == "5 signals"
            assert page.locator("#summary .summary").count() == 4
            assert "worked example" in page.locator("#nextTitle").inner_text().lower()
            assert "No student identity is stored" in page.locator("#teacherNotice").inner_text()

            page.get_by_role("tab", name="Student signal").click()
            page.get_by_role("button", name="Ready to stretch").click()
            page.get_by_role("button", name="Send signal").click()
            page.get_by_role("tab", name="Teacher board").click()
            assert page.locator("#totalSignals").inner_text() == "6 signals"
            assert not external_requests, f"Unexpected external requests: {external_requests}"

            browser.close()
    finally:
        server.shutdown()
        thread.join(timeout=2)
    print("Open Door Classroom UI smoke: OK")


if __name__ == "__main__":
    main()
