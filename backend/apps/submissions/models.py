from django.db import models


class Submission(models.Model):
    class Kind(models.TextChoices):
        CONTACT = "contact", "Contact"
        FEEDBACK = "feedback", "Feedback"

    created_at = models.DateTimeField(auto_now_add=True)

    kind = models.CharField(max_length=16, choices=Kind.choices)
    name = models.CharField(max_length=120, blank=True)
    email = models.EmailField(blank=True)
    subject = models.CharField(max_length=200, blank=True)
    message = models.TextField(max_length=4000)

    page_url = models.URLField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=300, blank=True)

    captcha_provider = models.CharField(max_length=32, default="turnstile")
    captcha_verified = models.BooleanField(default=False)
    captcha_error_codes = models.JSONField(null=True, blank=True)

    # used for dedupe checks (sha256 hex)
    content_hash = models.CharField(max_length=64, blank=True, db_index=True)

    is_handled = models.BooleanField(default=False)
    handled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["ip_address", "-created_at"]),
            models.Index(fields=["email", "content_hash", "-created_at"]),
        ]

    def __str__(self) -> str:
        who = self.email or "(no email)"
        return f"{self.kind} from {who} @ {self.created_at:%Y-%m-%d %H:%M}"
