from datetime import timedelta
from hashlib import sha256

from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import Submission
from .serializers import SubmissionCreateSerializer
from .turnstile import verify_turnstile

COOLDOWN_SECONDS = 60
DEDUPE_WINDOW_SECONDS = 10 * 60


def compute_content_hash(*, kind: str, email: str, subject: str, message: str) -> str:
    normalized = "|".join(
        [
            kind.strip().lower(),
            email.strip().lower(),
            subject.strip(),
            message.strip(),
        ]
    )
    return sha256(normalized.encode("utf-8")).hexdigest()


class SubmissionCreateView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "submissions"

    def get_throttles(self):
        # If honeypot is filled, silently drop without throttling.
        try:
            honeypot = (self.request.data.get("honeypot") or "").strip()
            if honeypot:
                return []
        except Exception:
            pass
        return super().get_throttles()

    def post(self, request):
        serializer = SubmissionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        honeypot = (data.get("honeypot") or "").strip()
        if honeypot:
            return Response(status=status.HTTP_204_NO_CONTENT)

        now = timezone.now()
        remoteip = request.META.get("REMOTE_ADDR")

        kind = data["kind"]
        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip().lower()
        subject = (data.get("subject") or "").strip()
        message = (data.get("message") or "").strip()

        # 1) Cooldown: 1 successful submit per IP per 60s
        if remoteip:
            latest = (
                Submission.objects.filter(ip_address=remoteip)
                .order_by("-created_at")
                .only("created_at")
                .first()
            )
            if latest:
                elapsed = (now - latest.created_at).total_seconds()
                if elapsed < COOLDOWN_SECONDS:
                    retry_after = int(COOLDOWN_SECONDS - elapsed)
                    return Response(
                        {"detail": "COOLDOWN", "retry_after_seconds": retry_after},
                        status=status.HTTP_429_TOO_MANY_REQUESTS,
                        headers={"Retry-After": str(retry_after)},
                    )

        email_for_hash = email if email else "anonymous"
        content_hash = compute_content_hash(
            kind=kind,
            email=email_for_hash,
            subject=subject,
            message=message,
        )

        # 2) Dedupe: same email + same content within 10 minutes
        window_start = now - timedelta(seconds=DEDUPE_WINDOW_SECONDS)
        if email:
            recent_dupe = (
                Submission.objects.filter(
                    email=email,
                    content_hash=content_hash,
                    created_at__gte=window_start,
                )
                .order_by("-created_at")
                .only("created_at")
                .first()
            )
        else:
            recent_dupe = None
            if remoteip:
                recent_dupe = (
                    Submission.objects.filter(
                        ip_address=remoteip,
                        content_hash=content_hash,
                        created_at__gte=window_start,
                    )
                    .order_by("-created_at")
                    .only("created_at")
                    .first()
                )

        if recent_dupe:
            elapsed = (now - recent_dupe.created_at).total_seconds()
            retry_after = int(max(0, DEDUPE_WINDOW_SECONDS - elapsed))
            return Response(
                {"detail": "DUPLICATE_SUBMISSION", "retry_after_seconds": retry_after},
                status=status.HTTP_409_CONFLICT,
            )

        # Turnstile config comes from Django settings (source of truth).
        turnstile_enabled = getattr(settings, "TURNSTILE_ENABLED", True)
        turnstile_configured = getattr(settings, "TURNSTILE_CONFIGURED", False)
        is_testing = getattr(settings, "IS_TESTING", False)

        # Only hard-enforce in real production (not DEBUG, not tests).
        if (
            turnstile_enabled
            and not turnstile_configured
            and not settings.DEBUG
            and not is_testing
        ):
            return Response(
                {"detail": "CAPTCHA verification is not configured on the server."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # If enabled, verify token when we have the secret; otherwise (DEBUG/tests),
        # skip verification to avoid breaking CI/local without secrets.
        if turnstile_enabled and turnstile_configured:
            secret_key = getattr(settings, "TURNSTILE_SECRET_KEY", "")
            if not secret_key:
                # Defensive: TURNSTILE_CONFIGURED should have implied this.
                return Response(
                    {"detail": "TURNSTILE_SECRET_KEY is not set"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            token = data["turnstile_token"]
            result = verify_turnstile(
                secret_key=secret_key, token=token, remoteip=remoteip
            )

            if not result.success:
                return Response(
                    {"detail": "CAPTCHA_FAILED", "error_codes": result.error_codes},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            captcha_provider = "turnstile"
            captcha_verified = True
            captcha_error_codes = None
        else:
            # In DEBUG/tests we may allow submissions without Turnstile configured.
            captcha_provider = None
            captcha_verified = False
            captcha_error_codes = None

        Submission.objects.create(
            kind=kind,
            name=name,
            email=email,
            subject=subject,
            message=message,
            page_url=(data.get("page_url") or "").strip(),
            ip_address=remoteip if remoteip else None,
            user_agent=(request.META.get("HTTP_USER_AGENT") or "")[:300],
            captcha_provider=captcha_provider,
            captcha_verified=captcha_verified,
            captcha_error_codes=captcha_error_codes,
            content_hash=content_hash,
        )

        return Response(
            {"status": "ok", "cooldown_seconds": COOLDOWN_SECONDS},
            status=status.HTTP_201_CREATED,
        )
