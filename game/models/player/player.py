from django.db import models
from django.contrib.auth.models import User # Django自带的User表

class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE) # Player表（user属性） 与 User表一对一，删除方式为级联删除
    photo = models.URLField(max_length=256, blank=True) # 照片

    def __str__(self):
        return str(self.user) #  在后台管理页面显示用户（相当于Java中的toString)
