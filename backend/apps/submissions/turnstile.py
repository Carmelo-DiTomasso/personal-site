from __future__ import annotations

import json
import urllib.parse
import urllib.request
from dataclasses import dataclass

TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


@dataclass(frozen=True)
class TurnstileResult:
    success: bool
    error_codes: list[str]


def verify_turnstile(*, secret_key: str, token: str, remoteip: str | None) -> TurnstileResult:
    form = {
        "secret": secret_key,
        "response": token,
    }
    if remoteip:
        form["remoteip"] = remoteip

    data = urllib.parse.urlencode(form).encode("utf-8")
    req = urllib.request.Request(
        TURNSTILE_VERIFY_URL,
        data=data,
        method="POST",
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )

    with urllib.request.urlopen(req, timeout=5) as resp:
        payload = json.loads(resp.read().decode("utf-8"))

    success = bool(payload.get("success", False))
    error_codes_raw = payload.get("error-codes", []) or payload.get("error_codes", [])
    if isinstance(error_codes_raw, list):
        error_codes = [str(x) for x in error_codes_raw]
    else:
        error_codes = [str(error_codes_raw)]

    return TurnstileResult(success=success, error_codes=error_codes)
