class FireBall extends AcGameObject{
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage){
        super();

        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = vx; // 火球行进的方向是固定的
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length; //射程
        this.damage = damage; // 火球的伤害值
        this.eps = 0.01;

    }

    start(){
    }

    update(){
        if(this.move_length < this.eps){
            this.destory();
            return false;
        }
        this.update_move();
        if(this.player.character !== "enemy"){
            this.update_attack();
        }

        this.render();
    }

    update_move(){
         let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
         this.x += this.vx * moved;
         this.y += this.vy * moved;
         this.move_length -= moved;

    }

    update_attack(){
        for(let i=0; i<this.playground.players.length; i++){
             let player = this.playground.players[i];
             if(this.player !== player && this.is_collision(player)){
                 this.attack(player);
                 break;
             }
        }
    }

    get_dist(x1, y1, x2, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
    // 判断火球与玩家是否碰撞（两球体中心的距离是否小于两球体半径之和）
    is_collision(player){
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if(distance < this.radius + player.radius)
            return true;
        return false;
    }

    attack(player){
        this.destory(); // 火球消失
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage); //玩家被攻击，传入攻击来的方向（被击飞）和伤害值
    }

    render(){
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale,  this.radius * scale, 0, Math.PI*2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    // 在火球销毁前将其从player存储的火球数组中删除
    on_destory(){
        let fireballs = this.player.fireballs;
        for(let i = 0; i < fireballs.length; i++){
            if(fireballs[i] === this){
                fireballs.splice(i,1);
                break;
            }
        }
    }
}
