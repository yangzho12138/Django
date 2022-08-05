class Player extends AcGameObject{
    // 传入地图，玩家圆心的x和y坐标，颜色，速度（占屏幕百分比），是否是玩家自己（自己由鼠标操纵，其他玩家由网络传入的信息操作
    constructor(playground, x, y, radius, color, speed, is_me){
        super();

        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1; // 允许的误差

        this.cur_skill = null;
    }

    start(){
        if(this.is_me){
            this.add_listening_events();
        }
    }
    // 监听鼠标（小球的移动）
    add_listening_events(){
        let outer = this;
        // 取消鼠标点击出现菜单
        this.playground.game_map.$canvas.on("contextmenu", function(){
            return false;
        });

        this.playground.game_map.$canvas.mousedown(function(e){
            if(e.which === 3){ // 右键
                outer.move_to(e.clientX, e.clientY);
            }else if(e.which === 1){ // 左键
                if(outer.cur_skill === "fireball"){
                    outer.shot_fireball(e.clientX, e.clientY);
                }
                outer.cur_skill = null;
            }
        });

        $(window).keydown(function(e) {
            if(e.which === 81){ // keydown 81对应Q键
                outer.cur_skill = "fireball";
                return false;
            }
        })
    }

    shot_fireball(tx, ty){
        let x= this.x, y = this.y;
        let radius = this.radius * 0.3;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = this.speed * 4;
        let move_length = this.playground.height * 1;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length);
    }

    // 获得2点之间的欧几里得距离
    get_dist(x1,y1, x2, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty){
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    update(){
        if(this.move_length < this.eps){
            this.move_length = 0;
            this.vx = this.vy = 0;
        }else{
            let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
            this.x += this.vx * moved; // 角度*距离 == x,y的移动距离
            this.y += this.vy * moved;
            this.move_length -= moved;
        }

        this.render(); // 每一帧都要画一次玩家
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();

    }
}
