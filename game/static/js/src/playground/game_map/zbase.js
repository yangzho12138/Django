class GameMap extends AcGameObject{
    constructor(playground){ // 传入AcGamePlayground对象
        super();

        this.playground = playground;
        // 渲染画面：canvas
        this.$canvas = $(`<canvas tabindex=0> </canvas>`); // tabindex使canvas元素可以监听事件
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);

    }

    start(){
        this.$canvas.focus();
    }
    // 背景大小自适应
    resize(){
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(0,0,0,1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    }

    update(){
        this.render();
    }

    render(){
        this.ctx.fillStyle = "rgba(0,0,0,0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    }
}
