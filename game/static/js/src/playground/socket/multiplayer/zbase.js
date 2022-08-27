class MultiPlayerSocket{
    constructor(playground){
        this.playground = playground;

        // 建立连接 ws—http, wss—https
        this.ws = new WebSocket("ws://121.5.68.237:8000/ws/multiplayer/");

        this.start();
    }

    start(){
        this.receive();
    }

    receive(){ // 接受从后端发来的信息
        let outer = this;
        this.ws.onmessage = function(e){
            let data = JSON.parse(e.data) // 将Json转换为字符串格式
            let uuid = data.uuid
            // 收到的信息是自己发的
            if(uuid === outer.uuid)
                return false;

            let event = data.event;
            if(event === "create_player"){
                outer.receive_create_player(uuid, data.username, data.photo);
            }else if(event === "move_to"){
                outer.receive_move_to(uuid, data.tx, data.ty);
            }else if(event === "shoot_fireball"){
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid);
            }else if(event === "attack"){
                outer.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid);
            }else if(event === "blink"){
                outer.receive_blink(uuid, data.tx, data.ty);
            }
        }
    }

    // 实现创建玩家同步
    // 向服务器端发送信息
    send_create_player(username, photo){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid': outer.uuid,
            "username": username,
            "photo": photo,
        }))
    }

    receive_create_player(uuid, username, photo){
        let player = new Player(this.playground, this.playground.width / 2 / this.playground.scale, this.playground.height / 2 / this.playground.scale,  this.playground.height * 0.05 / this.playground.scale, "white", this.playground.height * 0.15 / this.playground.scale, "enemy", username, photo);
        player.uuid = uuid; // 每一个player的id以创建他的server生成的id为准
        this.playground.players.push(player);
    }

    // 实现玩家的移动同步
    send_move_to(tx, ty){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': 'move_to',
            'uuid': outer.uuid, // 发出这个动作的人
            'tx': tx,
            'ty': ty,
        }));

    }

    get_player(uuid){
        let players = this.playground.players;
        for(let i=0; i < players.length; i++){
            let player = players[i];
            if(player.uuid === uuid)
                return player;
        }
        return null;
    }

    receive_move_to(uuid, tx, ty){
        let player = this.get_player(uuid);
        if (player){
            player.move_to(tx, ty);
        }
    }

    // 实现火球发射的同步
    send_shoot_fireball(tx, ty, ball_uuid){
        let outer = this;
        this.ws.send(JSON.stringify({
            "event": "shoot_fireball",
            "uuid": outer.uuid, //发出火球的人
            "tx": tx,
            "ty": ty,
            "ball_uuid": ball_uuid,
        }))
    }

    receive_shoot_fireball(uuid, tx, ty, ball_uuid){
        let player = this.get_player(uuid);
        if (player){
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = ball_uuid; // 将所有窗口的同一个火球的id进行统一
        }
    }

    // 同步攻击：以发出攻击并击中的终端为准，将其余终端上的被攻击玩家信息与该终端同步
    send_attack(attackee_uuid, x, y, angle, damage, ball_uuid){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "attack",
            'uuid': outer.uuid,
            'attackee_uuid': attackee_uuid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uuid': ball_uuid,
        }));
    }

    receive_attack(uuid, attackee_uuid, x, y, angle, damage, ball_uuid){
        let attacker = this.get_player(uuid);
        let attackee = this.get_player(attackee_uuid);
        if(attacker && attackee){
            attackee.receive_attack(x, y, angle, damage, ball_uuid, attacker);
        }
    }

    // 同步闪现
    send_blink(tx, ty){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "blink",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }

    receive_blink(uuid, tx, ty){
        let player = this.get_player(uuid);
        if(player)
            player.blink(tx, ty);
    }
}
