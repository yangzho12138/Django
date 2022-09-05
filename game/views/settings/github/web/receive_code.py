from django.shortcuts import redirect, reverse
from django.core.cache import cache
import requests
from django.contrib.auth.models import User
from game.models.player.player import Player
from random import randint
from rest_framework_simplejwt.tokens import RefreshToken # 手动构造jwt

def receive_code(request):
    data = request.GET
    code = data.get("code")
    state = data.get("state")

    if not cache.has_key(state): # 攻击行为
        return redirect("index")

    cache.delete(state)

    # post请求: 获取access_token
    apply_access_token_url = "https://github.com/login/oauth/access_token"
    params = {
        'client_id': "d36c347f635cc20a0158",
        'client_secret': "275f4084d6253b78e7cda448f2c315c6d7728136",
        'code': code
    }
    headers = { 'accept': 'application/json' }

    access_token_res = requests.post(apply_access_token_url, params=params, headers=headers).json()

    # 利用access_token获取用户信息
    get_userinfo_url = "https://api.github.com/user"
    access_token = access_token_res["access_token"]
    headers = { 'Authorization': "token %s" % (access_token) }
    userinfo_res = requests.get(get_userinfo_url, headers=headers).json()
    # 拿到用户信息
    username = userinfo_res['login']
    photo = userinfo_res['avatar_url']
    # 用户之前已经授权登录过
    client_id = userinfo_res['id']
    players = Player.objects.filter(client_id=client_id)
    if players.exists():
        refresh = RefreshToken.for_user(players[0].user)
        return redirect(reverse("index") + "?access=%s&refresh=%s"%(str(refresh.access_token),str(refresh)))

    # 注册用户信息
    while User.objects.filter(username=username).exists():
        username += str(randint(0,9))
    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, client_id=client_id)

    return redirect(reverse("index") + "?access=%s&refresh=%s"%(str(refresh.access_token),str(refresh))) # 对应名字为index的路由
