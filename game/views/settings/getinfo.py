from rest_framework.views import APIView
from rest_framework.response import Response
from game.models.player.player import Player
from rest_framework.permissions import IsAuthenticated

# Class Based Views(基于rest_framework)
class InfoView(APIView):
    permission_classes = ([IsAuthenticated])
    # 获取信息是get请求
    def get(self, request):
        user = request.user
        player = Player.objects.get(user=user)
        return Response({
            'result': 'success',
            'username': user.username,
            'photo': player.photo,
        })


