#!/usr/bin/env python3
"""
serve.py — the local preview, serving addresses the way GitHub Pages does.

    python3 tools/serve.py          # http://localhost:8000/
    python3 tools/serve.py 8001     # another port (sign-in works only on 8000)

GitHub Pages serves item/<slug>.html at /item/<slug>, and the share pages,
item pages and list pages all link that way. `python3 -m http.server`
answers those addresses with 404, so this is Python's own file server with
one change: an address with no extension that isn't a folder is served
from <address>.html when that file exists. Port 8000 by default, the only
port the Worker and Google sign-in accept; bound to 127.0.0.1 only.
"""

import functools
import http.server
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class Handler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        local = super().translate_path(path)
        if not os.path.splitext(local)[1] and not os.path.isdir(local) and os.path.isfile(local + ".html"):
            return local + ".html"
        return local


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    handler = functools.partial(Handler, directory=str(ROOT))
    with http.server.ThreadingHTTPServer(("127.0.0.1", port), handler) as server:
        print(f"Serving {ROOT} at http://localhost:{port}/ (Ctrl+C to stop)")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
