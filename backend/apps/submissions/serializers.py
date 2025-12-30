from rest_framework import serializers

from .models import Submission


class SubmissionCreateSerializer(serializers.Serializer):
    kind = serializers.ChoiceField(choices=[k for k, _ in Submission.Kind.choices])
    name = serializers.CharField(max_length=120, allow_blank=True, required=False)
    email = serializers.EmailField(allow_blank=True, required=False)
    subject = serializers.CharField(max_length=200, allow_blank=True, required=False)
    message = serializers.CharField(max_length=4000)

    page_url = serializers.URLField(required=False, allow_blank=True)

    # Bot defenses
    turnstile_token = serializers.CharField()
    honeypot = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        kind = attrs.get("kind")
        name = (attrs.get("name") or "").strip()
        email = (attrs.get("email") or "").strip()
        subject = (attrs.get("subject") or "").strip()

        if kind == Submission.Kind.CONTACT:
            if not name:
                raise serializers.ValidationError({"name": "Name is required for contact."})
            if not email:
                raise serializers.ValidationError({"email": "Email is required for contact."})
            if not subject:
                raise serializers.ValidationError({"subject": "Subject is required for contact."})

        return attrs
