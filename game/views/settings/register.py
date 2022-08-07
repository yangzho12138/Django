from django.contrib.auth import login
from django.http import JsonResponse
from django.contrib.auth.models import User
from game.models.player.player import Player

def register(request):
    data = request.GET
    username = data.get("username","").strip()  # 没有名为username的参数则返回空，strip去掉前后空格
    password = data.get("password","").strip()
    password_confirm = data.get("password_confirm","").strip()
    if not username or not password or not password_confirm:
        return JsonResponse({
            "result": "the username or password can not be null"
        })
    if password != password_confirm:
        return JsonResponse({
            "result" : "the passwords entered twice must be the same"
        })
    if User.objects.filter(username=username).exists(): # 查找数据库
        return JsonResponse({
            "result": "the username already exists"
        })
    user = User(username=username)
    user.set_password(password)
    user.save()
    Player.objects.create(user=user, photo="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fc-ssl.duitang.com%2Fuploads%2Fblog%2F202107%2F09%2F20210709142454_dc8dc.thumb.1000_0.jpeg&refer=http%3A%2F%2Fc-ssl.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1661779231&t=7fd32076") # 创建player（和user一对一）和默认头像
    login(request, user)
    return JsonResponse({
        "result": "success"
    })



