from django.shortcuts import render

def index(request):
    data = request.GET
    context = {
        'access': data.get('access', ""), # 未获取到参数即为空
        'refresh': data.get('refresh',""),
    }
    return render(request, "multiends/web.html", context)
    #路径从templates文件夹后开始写，引入html文件,将获取到的信息传给html
