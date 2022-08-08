from django.http import JsonResponse
from urllib.parse import quote
from random import randint
from django.core.cache import cache

# 获取随机值函数
def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0,9))
    return res

def apply_code(request):
    client_id = "d36c347f635cc20a0158"
    redirect_uri = quote("http://121.5.68.237:8000/settings/github/web/receive_code/")
    scope = "read:user"
    state = get_state()
    # 将state的值存入redis, 有效期2h
    cache.set(state, True, 7200)

    apply_code_url = "https://github.com/login/oauth/authorize"
    return JsonResponse({
        "result": "success",
        "apply_code_url": apply_code_url+"?client_id=%s&redirect_uri=%s&scope=%s&state=%s" % (client_id, redirect_uri, scope, state),
    })


