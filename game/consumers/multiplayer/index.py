from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings #引入settings.py文件
from django.core.cache import cache
import json

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
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def create_player(self, data):
        players = cache.get(self.room_name)
        players.append({
            "uuid": data["uuid"],
            "username": data["username"],
            "photo": data["photo"],
        })
        cache.set(self.room_name, players, 3600) # 将新玩家添加进入房间
        # 将信息发送给组内的所有人
        await self.channel_layer.group_send(self.room_name, {
            "type": "group_send_event", # 接收函数的名字
            "event": "create_player",
            "uuid": data["uuid"],
            "username": data["username"],
            "photo": data["photo"],
        })

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

    async def group_send_event(self, data):
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

