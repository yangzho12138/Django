let AC_GAME_OBJECTS = [] // 全局变量，一个物体创建后将其加入数组

class AcGameObject{
    constructor(){
        AC_GAME_OBJECTS.push(this);
        this.has_called_start = false; //是否执行过start函数
        this.timedelta = 0; //当前帧距离上一帧的时间间隔——防止不同浏览器在1s内渲染的帧数不同，因此用时间来衡量刷新的速度
        this.uuid = this.create_uuid(); // 为每个对象创建一个唯一的id
    }

    create_uuid(){
        let res = "";
        for(let i=0; i<8; i++){
            let x = parseInt(Math.floor(Math.random() * 10));
            res += x;
        }
        return res;
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
