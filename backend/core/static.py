"""Static file serving for the exported frontend."""

import os

from starlette.responses import Response
from starlette.staticfiles import PathLike, StaticFiles
from starlette.types import Scope


class FrontendStaticFiles(StaticFiles):
    """Serves the frontend; HTML pages must be revalidated on every request.

    Without Cache-Control, browsers may reuse a cached page after a rebuild and
    run stale JavaScript. Hashed assets under _next/ keep default caching.
    """

    def file_response(
        self, full_path: PathLike, stat_result: os.stat_result, scope: Scope, status_code: int = 200
    ) -> Response:
        response = super().file_response(full_path, stat_result, scope, status_code)
        if str(full_path).endswith(".html"):
            response.headers["Cache-Control"] = "no-cache"
        return response
