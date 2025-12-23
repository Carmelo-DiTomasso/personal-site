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
