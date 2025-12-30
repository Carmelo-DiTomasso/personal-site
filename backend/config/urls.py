from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("apps.analytics.urls")),
    path("api/", include("apps.content.urls")),
    path("api/", include("apps.submissions.urls")),
]
