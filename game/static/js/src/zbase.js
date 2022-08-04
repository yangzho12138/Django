class AcGame{
    constructor(id){
        this.id = id;
        this.$ac_game = $('#' + id); // 获取对应id的div标签
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);

        this.start();
    }

    start(){
    }
}
