from __future__ import annotations

from typing import Any

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.content.models import Project

SEED_PROJECTS: list[dict[str, Any]] = [
    {
        "slug": "personal-site",
        "title": "Personal Site",
        "description": "Monorepo personal site with Django API + React frontend.",
        "live_url": "",
        "repo_url": "",
        "sort_order": 10,
        "is_featured": True,
    },
    {
        "slug": "shipping-microservice",
        "title": "Shipping Microservice",
        "description": "Microservice integrating multiple carrier APIs.",
        "live_url": "",
        "repo_url": "",
        "sort_order": 20,
        "is_featured": True,
    },
    {
        "slug": "shodan-ip-tool",
        "title": "Shodan IP Tool",
        "description": "Backend-proxied Shodan IP intelligence lookup tool.",
        "live_url": "",
        "repo_url": "",
        "sort_order": 30,
        "is_featured": False,
    },
    {
        "slug": "rbtree-rankings",
        "title": "RBTree Player Rankings",
        "description": "C++ rankings backed by a red-black tree.",
        "live_url": "",
        "repo_url": "",
        "sort_order": 40,
        "is_featured": False,
    },
]


class Command(BaseCommand):
    help = "Seed local Project data (repeatable)."

    def add_arguments(self, parser) -> None:
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing projects before seeding.",
        )

    @transaction.atomic
    def handle(self, *args, **options) -> None:
        if options["clear"]:
            deleted_count, _ = Project.objects.all().delete()
            self.stdout.write(
                self.style.WARNING(
                    f"Cleared projects (deleted rows: {deleted_count})."
                )
            )

        created = 0
        updated = 0

        for project_data in SEED_PROJECTS:
            obj, was_created = Project.objects.update_or_create(
                slug=project_data["slug"],
                defaults={k: v for k, v in project_data.items() if k != "slug"},
            )
            if was_created:
                created += 1
                self.stdout.write(self.style.SUCCESS(f"Created: {obj.slug}"))
            else:
                updated += 1
                self.stdout.write(self.style.SUCCESS(f"Updated: {obj.slug}"))

        self.stdout.write(self.style.SUCCESS(f"Done. created={created} updated={updated}"))
