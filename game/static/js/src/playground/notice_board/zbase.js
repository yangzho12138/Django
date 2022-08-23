class NoticeBoard extends AcGameObject{
    constructor(playground){
        super();

        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.text = "waiting for begin: 0 players prepared";
    }

    start(){
    }

    write(text){
        this.text = text;
    }

    update(){
        this.render();
    }

    // 需要每一帧都渲染
    render(){
        // canvas 渲染文本
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.playground.width / 2, 20);
    }
}
