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
                outer.receive_create_player(uuid, data.username, data.photo)
            }
        }
    }

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
}
