class AcGameMenu {
    constructor(root){ // 传入的root是总对象，即AcGame对象
        this.root = root;
        // jquery中html对象前面加$符号
        this.$menu = $(`
            <div class="ac-game-menu">
                <div class="ac-game-menu-field">
                    <div class="ac-game-menu-field-item ac-game-field-item-single">
                        Single-Player
                    </div>
                    <div class="ac-game-menu-field-item ac-game-field-item-multi">
                        Multi-Players
                    </div>
                    <div class="ac-game-menu-field-item ac-game-field-item-settings">
                        Settings
                    </div>
                </div>
                <div class="ac-game-menu-intro">
                    <div class="ac-game-menu-intro-title">
                        Welcome to Warlock Battle
                    </div>
                    <div class="ac-game-menu-intro-description">
                        This is a xxx game, users need to manipulate the role to defeat others
                    </div>
                </div>
            </div>
        `);
        this.$menu.hide(); // 用户在登陆状态下才显示菜单页面
        this.root.$ac_game.append(this.$menu);
        // 在$menu中找到特定class的对象,将其定义为button
        this.$single = this.$menu.find('.ac-game-field-item-single');
        this.$multi = this.$menu.find('.ac-game-field-item-multi');
        this.$settings = this.$menu.find('ac-game-field-item-settings');

        this.start();
    }
    start(){
        this.add_listening_events();
    }

    add_listening_events(){
        let outer = this; // 进入到内部函数this会改变
        this.$single.click(function(){
           outer.hide();
           outer.root.playground.show();
        });
        this.$multi.click(function(){

        });
        this.$settings.click(function(){

        });
    }

    show(){ //显示页面
        this.$menu.show();
    }

    hide(){ // 关闭页面
        this.$menu.hide();
    }
}
let AC_GAME_OBJECTS = [] // 全局变量，一个物体创建后将其加入数组

class AcGameObject{
    constructor(){
        AC_GAME_OBJECTS.push(this);
        this.has_called_start = false; //是否执行过start函数
        this.timedelta = 0; //当前帧距离上一帧的时间间隔——防止不同浏览器在1s内渲染的帧数不同，因此用时间来衡量刷新的速度
    }

    // 只会在第一帧执行
    start(){
    }

    // 每一帧会执行一次
    update(){
    }

    // 在被删除前执行一次
    on_destory(){
    }

    // 删掉该物体
    destory(){
        this.on_destory();
        for(let i = 0; i < AC_GAME_OBJECTS.length; i++){
            if(AC_GAME_OBJECTS[i] === this){
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }


}

let last_timestamp;
let AC_GAME_ANIMATION = function(timestamp){
    for(let i = 0; i < AC_GAME_OBJECTS.length; i++){
        let obj = AC_GAME_OBJECTS[i];
        if(!obj.has_called_start){
            obj.start();
            obj.has_called_start = true;
        }else{
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }

    last_timestamp = timestamp;

    requestAnimationFrame(AC_GAME_ANIMATION)
}

requestAnimationFrame(AC_GAME_ANIMATION);
class GameMap extends AcGameObject{
    constructor(playground){ // 传入AcGamePlayground对象
        super();

        this.playground = playground;
        // 渲染画面：canvas
        this.$canvas = $(`<canvas> </canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);

    }

    start(){
    }

    update(){
        this.render();
    }

    render(){
        this.ctx.fillStyle = "rgba(0,0,0,0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    }
}
class Particle extends AcGameObject{
    constructor(playground, x, y, radius, vx, vy, color, speed){
        super();

        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.frication = 0.9;
        this.eps = 1;
    }

    start(){
    }

    update(){
        if(this.speed < this.eps){
            this.destory();
            return false;
        }

        this.x += this.vx * this.speed * this.timedelta / 1000;
        this.y += this.vy * this.speed * this.timedelta / 1000;
        this.speed *= this.frication;
        this.render();
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0 ,Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
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

        if(this.is_me){
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
            console.log(this.img.src);
        }
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
        // 用户画头像
        if(this.is_me){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2); 
            this.ctx.restore();
        }else{
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }

    }

    on_destory(){ // 玩家死亡后将其移除
        for(let i = 0; i < this.playground.players.length; i++){
            if(this.playground.players[i] === this){
                this.playground.players.splice(i,1);
            }
        }
    }
}
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
        this.eps = 0.1;

    }

    start(){
    }

    update(){
        if(this.move_length < this.eps){
            this.destory();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        for(let i=0; i<this.playground.players.length; i++){
            let player = this.playground.players[i];
            if(this.player !== player && this.is_collision(player)){
                this.attack(player);
            }
        }

        this.render();
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
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class AcGamePlayground {
    constructor(root){
        this.root = root;
        this.$playground = $(`
            <div class="ac-game-playground"> </div>
        `);
        this.hide();
        this.root.$ac_game.append(this.$playground);

        this.width = this.$playground.width();
        this.height = this.$playground.height();

        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width/2, this.height/2, this.height * 0.05, "white", this.height * 0.15, true));
       // 敌人
        for(let i=0; i<5;i++){
            this.players.push(new Player(this, this.width/2, this.height/2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false));
        }
        this.start();
    }

    get_random_color(){
        let colors = ["blue", "red", "pink", "green", "grey"];
        return colors[Math.floor(Math.random() * 5)];
    }

    start(){
    }

    update(){
    }

    show(){
        this.$playground.show();
    }

    hide(){
        this.$playground.hide();
    }
}
class Settings{
    constructor(root){
        this.root = root;
        this.platform = "WEB";
        // 一个后端对应不同的前端平台
        //if(this.root.CloudOs)
            //this.platform = "ACAPP";
        this.username="";
        this.photo="";
        this.start();
    }
    start(){
        this.getinfo();
    }

    register(){ // 打开注册页面
    }

    login(){ // 打开登录页面

    }

    getinfo(){
        let outer = this;

        $.ajax({
            url: "http://121.5.68.237:8000/settings/getinfo/",
            //async: false,
            type: "GET",
            data:{
                platform: outer.platform,
            },
            success: function(resp){
                if(resp.result === "success"){
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    console.log(outer.username, outer.photo);
                    outer.root.playground = new AcGamePlayground(outer.root);
                    outer.hide(); // 隐藏当前页面
                    outer.root.menu.show(); // 展示菜单页面
                }else{
                    outer.login(); //打开登录页面
                }
            }
        })
    }

    hide(){
    }

    show(){
    }
}
export class AcGame{
    constructor(id, CloudOs){
        this.id = id;
        this.$ac_game = $('#' + id); // 获取对应id的div标签
        this.CloudOs = CloudOs; // web端没有此参数，云端app此参数提供一系列接口

        this.menu = new AcGameMenu(this);
        this.settings = new Settings(this);
        //this.playground = new AcGamePlayground(this);
        this.playground = null;

        this.start();
    }

    start(){
    }
}
