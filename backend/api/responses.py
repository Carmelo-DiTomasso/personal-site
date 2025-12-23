from __future__ import annotations

from typing import Any

from django.http import JsonResponse


def error_response(*, code: str, message: str, status: int = 400, details: Any | None = None) -> JsonResponse:
    return JsonResponse(
        {"error": {"code": code, "message": message, "details": details}},
        status=status,
    )
