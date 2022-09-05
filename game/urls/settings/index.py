from django.urls import path, include
from game.views.settings.getinfo import InfoView
from game.views.settings.ranklist import RanklistView
from game.views.settings.register import PlayerView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # token登陆方式
    path("token/", TokenObtainPairView.as_view(), name="settings_token"),
    path("token/refresh/", TokenRefreshView.as_view(), name="settings_token_refresh"),

    path("getinfo/", InfoView.as_view(), name="settings_getinfo"), # .as_view()将class based view转换玮函数类型
    path("ranklist/", RanklistView.as_view(), name="settings_ranklist"),
    path("register/", PlayerView.as_view(), name="settings_register"),
    path("github/", include("game.urls.settings.github.index")),
]
