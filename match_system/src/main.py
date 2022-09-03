#! /usr/bin/env python3

import glob
import sys
sys.path.append('gen-py')
sys.path.insert(0, glob.glob('../../')[0]) # ../../是Django项目的家目录，这样才能import  Django项目里的包

from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer

from match_server.match_service import match # 引入创建的match_server下的match.py文件
from queue import Queue # 消息队列
from time import sleep
from threading import Thread

from djangoapp.asgi import channel_layer # agsi.py中配置
from asgiref.sync import async_to_sync # 多线程变单线程--》配合匹配系统client端的单线程
from django.core.cache import cache


queue = Queue() # 消息队列缓存消息，当玩家请求匹配，服务器却正在进行其他匹配时——缓存消息

class Player:
    def __init__(self, score, uuid, username, photo, channel_name):
        self.score = score
        self.uuid = uuid
        self.username = username
        self.photo = photo
        self.channel_name = channel_name
        self.waiting_time = 0 # 玩家匹配等待时间

# 匹配池
class Pool:
    def __init__(self):
        self.players = []

    def add_player(self, player):
        print("add player %s %d" % (player.username, player.score))
        self.players.append(player)

    def check_match(self, a, b):
        #if(a.username == b.username) # 防止同一个用户自行匹配
            #return False
        dt = abs(a.score - b.score)
        a_max_dif = a.waiting_time * 50 # 没多等待1s，可以匹配的分数范围扩大50
        b_max_dif = b.waiting_time * 50
        return dt <= a_max_dif and dt<= b_max_dif

    def match_success(self, ps):
        print("Match Success: %s %s" %(ps[0],ps[1]))
        room_name = "room-%s-%s" % (ps[0].uuid, ps[1].uuid) # 将玩家uuid存进房间名-》可通过用户uuid快速在redis中查找到用户在哪个房间
        players = []
        for p in ps:
            async_to_sync(channel_layer.group_add)(room_name, p.channel_name) # 将匹配成功的玩家加到一组里
            players.append({
                'uuid': p.uuid,
                'username': p.username,
                'photo': p.photo,
                'hp': 100, # 初始血量100
            })
        cache.set(room_name, players, 3600) # 房间有效时间1h
        for p in ps:
            async_to_sync(channel_layer.group_send)( # 广播（同步）信息，同client端consumer
                room_name,
                {
                    "type": "group_send_event", # 在server端调用了client端函数（agsi配置）
                    "event": "create_player",
                    "uuid": p.uuid,
                    "username": p.username,
                    "photo": p.photo,
                }
            )


    def increase_waiting_time(self):
        for player in self.players:
            player.waiting_time += 1

    def match(self):
        while len(self.players) >= 2:
            self.players = sorted(self.players, key=lambda p: p.score)
            flag = False
            for i in range(len(self.players) - 1):
                a, b = self.players[i], self.players[i + 1]
                if self.check_match(a,b): # 两两之间都要满足要求
                    flag = True
                    self.match_success([a,b])
                    self.players = self.players[:i] + self.players[i+2:] # 去除匹配成功的玩家
                    break
            if not flag:
                break
        self.increase_waiting_time()


class MatchHandler:
    def add_player(self, score, uuid, username, photo, channel_name):
        player = Player(score, uuid, username, photo, channel_name)
        queue.put(player)
        return 0 # 一定要有返回值，否则会报错

def get_player_from_queue():
    try:
        return queue.get_nowait() # 非阻塞方法，若队列内无元素则抛出异常
    except:
        return None # 队列内无元素

def worker(): # 消费者：将消息队列中的信息交给匹配池
    pool = Pool()
    while True:
        player = get_player_from_queue()
        if player:
            pool.add_player(player) # 消息队列中有player，则将其加入匹配池中
        else:
            pool.match() # 消息队列中无player，则开始匹配并休息1s
            sleep(1)


if __name__ == '__main__':
    handler = MatchHandler()
    processor = match.Processor(handler)
    transport = TSocket.TServerSocket(host='127.0.0.1', port=9090)
    tfactory = TTransport.TBufferedTransportFactory()
    pfactory = TBinaryProtocol.TBinaryProtocolFactory()

    # You could do one of these for a multithreaded server
    # 来一个处理一个
    server = TServer.TThreadedServer(
     processor, transport, tfactory, pfactory)

    # daemon=True 守护进程，关掉主进程时将该进程一同杀掉
    Thread(target=worker, daemon=True).start() # 开启消费者线程
    print('Starting the server...')
    server.serve()
    print('done.')
