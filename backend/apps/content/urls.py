from django.urls import path

from .views import ProjectListAPIView

urlpatterns = [
    path("content/projects/", ProjectListAPIView.as_view(), name="content-projects-list"),
]
