from rest_framework import serializers

from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            "slug",
            "title",
            "description",
            "live_url",
            "repo_url",
            "sort_order",
            "is_featured",
        ]
