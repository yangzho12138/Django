from django.contrib.auth import logout
from django.http import JsonResponse

def signout(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({
            "result": "success"
        })
    logout(request) # 从request中删除cookie
    return JsonResponse({
        "result": "success"
    })
