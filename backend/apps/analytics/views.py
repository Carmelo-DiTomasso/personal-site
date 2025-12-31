from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.http import JsonResponse

from api.responses import error_response


def health(request):
    if request.method != "GET":
        return error_response(
            code="method_not_allowed",
            message=f"Method {request.method} not allowed.",
            status=405,
        )

    return JsonResponse({"status": "ok"})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def auth_check(request):
    return Response({"status": "ok"})
