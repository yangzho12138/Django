from django.contrib.auth import authenticate, login # 验证密码
from django.http import JsonResponse

def signin(request): # import的函数里有一个login函数里
    data = request.GET
    username = data.get("username")
    password = data.get("password")
    user = authenticate(username=username, password=password)
    if not user:
        return JsonResponse({
            "result": "the username or password is wrong"
        })
    login(request, user); # 存到cookie里
    return JsonResponse({
        "result": "success"
    })


