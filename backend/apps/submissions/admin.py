from django.contrib import admin
from django.utils import timezone

from .models import Submission


@admin.action(description="Mark selected submissions as handled")
def mark_handled(modeladmin, request, queryset):
    queryset.update(is_handled=True, handled_at=timezone.now())


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = (
        "created_at",
        "kind",
        "name",
        "email",
        "subject",
        "is_handled",
    )
    list_filter = ("kind", "is_handled", "created_at")
    search_fields = ("name", "email", "subject", "message")
    actions = [mark_handled]
    ordering = ("-created_at",)
