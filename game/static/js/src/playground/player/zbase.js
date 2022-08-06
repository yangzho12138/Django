class Player extends AcGameObject{
    // 传入地图，玩家圆心的x和y坐标，颜色，速度（占屏幕百分比），是否是玩家自己（自己由鼠标操纵，其他玩家由网络传入的信息操作
    constructor(playground, x, y, radius, color, speed, is_me){
        super();

        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0; // 鼠标点击移动的角度
        this.vy = 0;
        this.damage_x = 0; //被击中后移动的角度
        this.damage_y = 0;
        this.damage_speed = 0; // 被击中后的移动速度
        this.friction = 0.9; //被击中后影响速度的摩擦力
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1; // 允许的误差

        this.cur_skill = null;
        this.spent_time = 0;
    }

    start(){
        if(this.is_me){
            this.add_listening_events();
        }else{
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
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
        let speed = this.speed * 2;
        let move_length = this.playground.height * 1;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, this.playground.height * 0.01); // 每个玩家的半径是height * 0.05, 伤害是0.01--每次会打掉玩家20%的血量
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

    is_attacked(angle, damage){
        // 被撞击时的火花粒子效果
        for(let i = 1; i < 10 + Math.random() * 5; i++){
            let x = this.x;
            let y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 3 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 11;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed);
        }

        this.radius -= damage;
        if(this.radius < 10){ // 半径小于10像素——玩家死亡
            this.destory();
            return false;
        }else{
            this.damage_x = Math.cos(angle);
            this.damage_y = Math.sin(angle);
            this.damage_speed = damage * 2; // 2是自己定的参数
        }

    }

    update(){
        this.spent_time += this.timedelta / 1000;
        if(!this.is_me){
            if(this.spent_time > 5 && Math.random() < 1 / 180.0){ //前5s不攻击 and 概率每3s发射一次
                let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
                let tx = player.x + player.speed * player.vx * player.timedelta / 1000 * 0.3; // 向目标0.3s后的位置开炮
                let ty = player.y + player.speed * player.vy * player.timedelta / 1000 * 0.3;
                this.shot_fireball(tx, ty);
            }
        }

        if(this.damage_speed > this.eps){ // 玩家处于被攻击状态，无法操作
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.speed * this.timedelta / 1000; // 角度*速度*时间
            this.y += this.damage_y * this.speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        }else{
            if(this.move_length < this.eps){
                this.move_length = 0;
                this.vx = this.vy = 0;
                if(!this.is_me){ // AI敌人到达终点后需要再指定一个目标点
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            }else{
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved; // 角度*距离 == x,y的移动距离
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
        this.render(); // 每一帧都要画一次玩家
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();

    }

    on_destory(){ // 玩家死亡后将其移除
        for(let i = 0; i < this.playground.players.length; i++){
            if(this.playground.players[i] === this){
                this.playground.players.splice(i,1);
            }
        }
    }
}
