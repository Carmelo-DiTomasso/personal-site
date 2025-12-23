from rest_framework.generics import ListAPIView

from .models import Project
from .serializers import ProjectSerializer


class ProjectListAPIView(ListAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
