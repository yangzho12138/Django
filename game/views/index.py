from django.shortcuts import render

def index(request):
    return render(request, "multiends/web.html") 
    #路径从templates文件夹后开始写，引入html文件
