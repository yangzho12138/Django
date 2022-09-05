from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from game.models.player.player import Player

class RanklistView(APIView):
    # permission_calsses = ([IsAuthenticated]) # 需要登录授权才能查看

    def get(self, request):
        players = Player.objects.all().order_by('-score')[:10]
        resp = []
        for player in players:
            resp.append({
                "username": player.user.username,
                "photo": player.photo,
                "score": player.score,
            })
        return Response(resp)
