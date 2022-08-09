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

    show(){
        this.resize();
        this.width = this.$playground.width();
        this.height = this.$playground.height();

        this.game_map = new GameMap(this);
        this.players = [];
        // 初始化时需要/this.scale
        this.players.push(new Player(this, this.width/2/this.scale, this.height/2/this.scale, this.height * 0.05 / this.scale, "white", this.height * 0.15 / this.scale, true));

        // 敌人
        for(let i=0; i<5;i++){
              this.players.push(new Player(this, this.width/2/this.scale, this.height/2/this.scale, this.height * 0.05/this.scale, this.get_random_color(), this.height * 0.15/this.scale, false));
        }

        this.$playground.show();
    }

    hide(){
        this.$playground.hide();
    }
}
