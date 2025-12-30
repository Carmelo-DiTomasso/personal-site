from django.urls import path

from .views import auth_check, health

urlpatterns = [
    path("health/", health),
    path("auth-check/", auth_check),
]
