class MultiPlayerSocket{
    constructor(playground){
        this.playground = playground;

        // 建立连接
        console.log("建立连接");
        this.ws = new WebSocket("ws://121.5.68.237:8000/ws/multiplayer/");
        console.log("建立连接2");

        this.start();
    }

    start(){
    }


}
