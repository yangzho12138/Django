class Settings{
    constructor(root){
        this.root = root;
        this.platform = "WEB";
        // 一个后端对应不同的前端平台
        //if(this.root.CloudOs)
        //this.platform = "ACAPP";
        this.username="";
        this.photo="";

        this.$settings = $(`
        <div class="ac-game-settings">
            <div class="ac-game-settings-login">
                <div class="ac-game-settings-title">
                    Login
                </div>
                <div class="ac-game-settings-username">
                    <div class="ac-game-settings-item">
                        <input type="text" placeholder="username">
                    </div>
                </div>
                <div class="ac-game-settings-password">
                    <div class="ac-game-settings-item">
                        <input type="password" placeholder="password">
                    </div>
                </div>
                <div class="ac-game-settings-submit">
                    <div class="ac-game-settings-item">
                        <button>Login</button>
                    </div>
                </div>
                <div class="ac-game-settings-error-message">
                    error-message
                </div>
                <div class="ac-game-settings-option">
                    Register
                </div>
                <!-- 前两行是inline格式，会影响到后面的格式，所以加一个回车 -->
                <br>
                <div class="ac-game-settings-github">
                    <img width="30" src="http://121.5.68.237:8000/static/image/settings/github.jpeg">
                </div>
                <div class="ac-game-settings-github-hint">
                    using your github account to login
                </div>
            </div>
            <div class="ac-game-settings-register">
                <div class="ac-game-settings-title">
                      Register
                </div>
                <div class="ac-game-settings-username">
                    <div class="ac-game-settings-item">
                        <input type="text" placeholder="username">
                    </div>
                </div>
                <div class="ac-game-settings-password">
                    <div class="ac-game-settings-item">
                        <input type="password" placeholder="password">
                    </div>
                </div>
                <div class="ac-game-settings-password">
                    <div class="ac-game-settings-item">
                         <input type="password" placeholder="confirmed-password">
                    </div>
                </div>
                <div class="ac-game-settings-submit">
                    <div class="ac-game-settings-item">
                        <button>Register</button>
                    </div>
                </div>
                <div class="ac-game-settings-error-message">
                    error-message
                </div>
                <div class="ac-game-settings-option">
                    Login
                </div>
                <br>
                <div class="ac-game-settings-github">
                    <img width="30" src="http://121.5.68.237:8000/static/image/settings/github.jpeg">
                </div>
                <div class="ac-game-settings-github-hint">
                    using your github account to login
                </div>
            </div>
        </div>
        `);

        this.$login = this.$settings.find(".ac-game-settings-login");
        this.$login.hide();
        this.$register = this.$settings.find(".ac-game-settings-register");
        this.$register.hide();
        this.root.$ac_game.append(this.$settings);

        this.start();
    }
    start(){
        this.getinfo();
    }

    register(){ // 打开注册页面
        this.$login.hide();
        this.$register.show();
    }

    login(){ // 打开登录页面
        this.$register.hide();
        this.$login.show();
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
                    outer.root.playground = new AcGamePlayground(outer.root);
                    outer.hide(); // 隐藏当前页面
                    outer.root.menu.show(); // 展示菜单页面
                }else{
                    outer.login(); //未登录默认打开登录页面
                }
            }
        })
    }

    hide(){
        this.$settings.hide();
    }

    show(){
        this.$settings.show();
    }
}
