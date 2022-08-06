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
            type: "GET",
            data:{
                platform: outer.platform,
            },
            success: function(resp){
                if(resp.result === "success"){
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    console.log(outer.username, outer.photo);
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
