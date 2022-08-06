from django.http import JsonResponse
from game.models.player.player import Player

def getinfo_web(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({
            'result': "not login",
        })
    else:
        player = Player.objects.all()[0]
        return JsonResponse({
            'result': "success",
            'username': player.user.username,
            'photo': player.photo,
        }) # 返回一个字典


def getinfo(request):
    platform = request.GET.get("platform") # 从请求中获取platform参数的值
    if platform == "WEB":
        return getinfo_web(request)

