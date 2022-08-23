class AcGamePlayground {
    constructor(root){
        this.root = root;
        this.$playground = $(`
            <div class="ac-game-playground"></div>
        `);
        this.hide();
        this.root.$ac_game.append(this.$playground);

        this.start();
    }

    get_random_color(){
        let colors = ["blue", "red", "pink", "green", "grey"];
        return colors[Math.floor(Math.random() * 5)];
    }

    start(){
        let outer = this;
        $(window).resize(function(){
            outer.resize();
        });
    }

    // 联机对战时统一长宽
    resize(){
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9); // 16:9的长宽比例
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;

        if(this.game_map)
            this.game_map.resize();
    }

    update(){
    }

    show(mode){
        let outer = this;

        this.width = this.$playground.width();
        this.height = this.$playground.height();

        this.game_map = new GameMap(this);
        this.mode = mode; // 记录下模式，在player中调用
        this.state = "waiting"; // 玩家进入游戏后处于waiting状态，无法移动，房间人满后进入fighting状态，死亡后进入over状态，此时无法再发射炮弹

        this.notice_board = new NoticeBoard(this);
        this.player_count = 0;

        this.resize(); // resize的位置非常重要，在gamemap后resize game_map，在players前使player渲染头像时，this.scale已经被赋值了
        this.players = [];
        // 初始化时需要/this.scale
        this.players.push(new Player(this, this.width/2/this.scale, this.height/2/this.scale, this.height * 0.05 / this.scale, "white", this.height * 0.15 / this.scale, "me", this.root.settings.username, this.root.settings.photo));

        if(mode === "single mode"){
        // 敌人
            for(let i=0; i<5;i++){
                this.players.push(new Player(this, this.width/2/this.scale, this.height/2/this.scale, this.height * 0.05/this.scale, this.get_random_color(), this.height * 0.15/this.scale, "robot"));
            }
        }else if(mode === "multi mode"){
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid; // 玩家自身一定是第一个被加到players数组中的

            // 连接建立后向后端发送消息（uuid以创建该玩家的后端生成的uuid为准）
            this.mps.ws.onopen = function(){
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            }
        }

        this.$playground.show();
    }

    hide(){
        this.$playground.hide();
    }
}
