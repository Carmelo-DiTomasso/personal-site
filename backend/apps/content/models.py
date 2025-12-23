from django.db import models


class Project(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    live_url = models.URLField(blank=True)
    repo_url = models.URLField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)

    class Meta:
        ordering = ["sort_order", "title"]

    def __str__(self) -> str:
        return self.title
