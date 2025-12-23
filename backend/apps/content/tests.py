from rest_framework.test import APITestCase

from .models import Project


class ProjectListTests(APITestCase):
    def test_list_projects_returns_ordered_list(self):
        Project.objects.create(
            slug="b-project",
            title="B Project",
            description="Second",
            live_url="https://example.com/b",
            repo_url="https://example.com/b-repo",
            sort_order=2,
            is_featured=False,
        )
        Project.objects.create(
            slug="a-project",
            title="A Project",
            description="First",
            live_url="https://example.com/a",
            repo_url="https://example.com/a-repo",
            sort_order=1,
            is_featured=True,
        )

        response = self.client.get("/api/content/projects/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            [
                {
                    "slug": "a-project",
                    "title": "A Project",
                    "description": "First",
                    "live_url": "https://example.com/a",
                    "repo_url": "https://example.com/a-repo",
                    "sort_order": 1,
                    "is_featured": True,
                },
                {
                    "slug": "b-project",
                    "title": "B Project",
                    "description": "Second",
                    "live_url": "https://example.com/b",
                    "repo_url": "https://example.com/b-repo",
                    "sort_order": 2,
                    "is_featured": False,
                },
            ],
        )
