from django.contrib import admin

from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "is_featured", "sort_order")
    list_display_links = ("title",)
    list_editable = ("is_featured", "sort_order")
    list_filter = ("is_featured",)
    search_fields = ("title", "slug")
    ordering = ("sort_order", "title")
