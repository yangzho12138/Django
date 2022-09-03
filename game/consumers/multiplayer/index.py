from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings #引入settings.py文件
from django.core.cache import cache
import json
from game.models.player.player import Player
from channels.db import database_sync_to_async #数据库单线程操作（串行）变为多线程（并行）

# thrift client端
from thrift import Thrift
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from match_system.src.match_server.match_service import match


class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = None
        for i in range(1000): # 遍历每一个房间
            name = "room-%d" % (i)
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY: # 房间未建立或未满员
                self.room_name = name
                break
        if not self.room_name: # 未找到合适的房间
            return


        await self.accept()
        print('accept')

        if not cache.has_key(self.room_name): # 创建新房间
            cache.set(self.room_name, [], 3600) # 每个房间有效期1h
        for player in cache.get(self.room_name):
            await self.send(text_data=json.dumps({ # 发送信息给前端
                "event": "create_player",
                "uuid": player['uuid'],
                "username": player["username"],
                "photo": player["photo"],
            }))

        await self.channel_layer.group_add(self.room_name, self.channel_name)

    async def disconnect(self, close_code):
        print('disconnect')
        if self.room_name: # 删掉房间
            await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def create_player(self, data):
        # 将进入多人模式的玩家信息发送给匹配系统服务端
        self.room_name = None
        self.uuid = data['uuid']
        # Make socket
        transport = TSocket.TSocket('127.0.0.1', 9090)
        # Buffering is critical. Raw sockets are very slow
        transport = TTransport.TBufferedTransport(transport)
        # Wrap in a protocol
        protocol = TBinaryProtocol.TBinaryProtocol(transport)
        # Create a client to use the protocol encoder
        client = match.Client(protocol)

        def db_get_player(): # 根据用户名在数据库中找到对应用户
            return Player.objects.get(user__username=data['username'])

        player = await database_sync_to_async(db_get_player)() # 异步函数加await
        # Connect!
        transport.open()
        # 调用server端的add_player函数
        client.add_player(player.score, data['uuid'], data['username'], data['photo'], self.channel_name)
        # Close!
        transport.close()


    async def move_to(self, data):
        await self.channel_layer.group_send(self.room_name,{
            "type": "group_send_event",
            "event": "move_to",
            "uuid": data["uuid"],
            "tx": data["tx"],
            "ty": data["ty"],
        })

    async def shoot_fireball(self, data):
        await self.channel_layer.group_send(self.room_name,{
            "type": "group_send_event",
            "event": "shoot_fireball",
            "uuid": data["uuid"],
            "tx" : data["tx"],
            "ty": data["ty"],
            "ball_uuid": data["ball_uuid"],
        })

    async def attack(self, data):
        await self.channel_layer.group_send(self.room_name,{
            "type": "group_send_event",
            "event": "attack",
            "uuid": data["uuid"],
            "attackee_uuid": data["attackee_uuid"],
            "x": data["x"],
            "y": data["y"],
            "angle": data["angle"],
            "damage": data["damage"],
            "ball_uuid": data["ball_uuid"],
        })

    async def blink(self, data):
        await self.channel_layer.group_send(self.room_name,{
            "type": "group_send_event",
            "event": "blink",
            "uuid": data["uuid"],
            "tx": data["tx"],
            "ty": data["ty"],
        })

    async def message(self, data):
        await self.channel_layer.group_send(self.room_name, {
            "type": "group_send_event",
            "event": "message",
            "uuid": data["uuid"],
            "username": data["username"],
            "text": data["text"],
        })

    async def group_send_event(self, data):
        if not self.room_name: # 更新房间名（初始化为None）
            keys = cache.keys('*%s*' % (self.uuid)) # 利用uuid查找所在房间
            if keys:
                self.room_name = keys[0]
        await self.send(text_data=json.dumps(data)) # 给前端群发信息

    async def receive(self, text_data):
        data = json.loads(text_data)
        print(data)
        event = data["event"]
        if event == "create_player":
            await self.create_player(data)
        elif event == "move_to":
            await self.move_to(data)
        elif event == "shoot_fireball":
            await self.shoot_fireball(data)
        elif event == "attack":
            await self.attack(data)
        elif event == "blink":
            await self.blink(data)
        elif event == "message":
            await self.message(data)

