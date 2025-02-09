// The Colombe character class file
(function() {
    var Colombe = function(x, y) {
        this.name  = 'colombe';
        this.x     = x || 0;
        this.y     = y || 0;
        this.realX = this.x + Game.map.scrollX;
        this.realY = this.y + Game.map.scrollY;
        this.speed = {
            x: 15,
            y: 60
        };
        this.maxSpeed = {
            x: 20,
            y: 60
        }
        this.controllable = true;

        this.body = new Game.Body(this, 1, 1);

        this.physics               = new Game.Physics(this);
        this.physics.jumpHeight    = 90;

        this.state         = 'IDLE_R';
        this.previousState = this.state;
        this.frame         = 0;
        this.doesJump      = true;
    };

    /**
     * Called on each frame
     */
    Colombe.prototype.update = function() {
        if (this == Game.player && this.controllable) {
            this.realX = this.x + Game.map.scrollX;
            this.realY = this.y + Game.map.scrollY;
        }

        var realX0 = this.realX,
            realY0 = this.realY;

        this.physics.update();

        var dX = this.realX - realX0,
            dY = this.realY - realY0;

        this.x = this.realX - Game.map.scrollX;
        this.y = this.realY - Game.map.scrollY;

        // Preventing from getting out of the canvas
        if (Game.player == this) {
            if (this.x <= 0) {
                this.x = 1;
                this.physics.v.x = 0;
            } else if (this.x >= Game.CANVAS_WIDTH - this.body.t_width * Game.map.TS) {
                this.x = Game.CANVAS_WIDTH - this.body.t_width * Game.map.TS - 1;
                this.physics.v.x = 0;
            }

            if (this.y <= 0) {
                this.y = 1;
                this.physics.v.y = 0;
            } else if (this.y >= Game.CANVAS_HEIGHT - this.body.t_height * Game.map.TS + 20) {
                this.y = Game.CANVAS_HEIGHT - this.body.t_height * Game.map.TS + 20 - 1;
                this.physics.v.y = 0;
            }
        }

        // Update the state
        this.previousState = this.state;
        if (this.realX < realX0 && this.physics.onFloor) {
            this.state = 'IDLE_L';
        } else if (this.realX > realX0 && this.previousState != 'IDLE_R' && this.physics.onFloor) {
            this.state = 'IDLE_R';
            this.frame = 1;
        } else if (this.realX > realX0 && this.previousState != 'WALK_L' && !this.physics.onFloor && this.previousState == 'IDLE_L') {
            this.state = 'WALK_L';
            //this.frame = 4;

        } else if (this.realX > realX0 && this.previousState != 'WALK_R' && !this.physics.onFloor && this.previousState == 'IDLE_R') {
            this.state = 'WALK_R';
            this.frame = 4;

        } else {
            this.state = this.previousState;
        }


        // Update the scrolling if the character is controlled by the player
        if (this != Game.player || !this.controllable || !Game.map.scrollable) {
            return;
        }
        Game.map.scroll(dX, dY);
    };

    /**
     * Renders the special effect on the map
     */
    /*Colombe.prototype.renderFX = function() {
        if (Game.player == this) {
             Game.lighting1.light.position = new Game.Vec2(Game.player.x + Game.player.body.width / 2, Game.player.y + Game.player.body.height / 2);
             Game.darkmask.compute(Game.canvas.width, Game.canvas.height);
             Game.darkmask.render(Game.context);
         }
    };*/

    /**
     * Renders the character
     * @param  {Canvas2DContext} context The 2D context of the canvas to render in
     */
    Colombe.prototype.render = function(context) {
        switch (this.state){
            case 'IDLE_R':
                context.drawImage(Game.images[this.name].idlerImage, 30 * (this.frame),0, 30,30,this.x,this.y,30,30);
                if (Game.frameCount % 15  == 0) {
                    this.frame--;
                }
                if (this.frame < 0) {
                    this.frame = 1;
                }
                break;

            case 'IDLE_L':
                context.drawImage(Game.images[this.name].idlelImage, 30 * (this.frame),0, 30,30,this.x,this.y,30,30);
                if (Game.frameCount % 15  == 0) {
                    this.frame++;
                }
                if (this.frame > 1) {
                    this.frame = 0;
                }
                break;
            case 'WALK_R':
                context.drawImage(Game.images[this.name].walkrImage, 30 * (this.frame),0, 30,33,this.x,this.y,30,33);
                if (Game.frameCount % 8  == 0) {
                    this.frame--;
                }
                if (this.frame < 0) {
                    this.frame = 4;
                }
                break;

            case 'WALK_L':
                context.drawImage(Game.images[this.name].walklImage, 30 * (this.frame),0, 30,33,this.x,this.y,30,33);
                if (Game.frameCount % 8  == 0) {
                    this.frame++;
                }
                if (this.frame >= 4) {
                    this.frame = 0;
                }
                break;
        }
    };

    /**
     * Applies the player's controls on the character
     */
    Colombe.prototype.control = function() {
        if (this.controllable && Keyboard.isDown(Keyboard.SPACE) && this.doesJump == true) {
            this.doesJump = false;
            this.physics.addJumpForce(-this.speed.y)
            if(this.previousState == 'IDLE_R')
            this.state = 'WALK_R';
            if(this.previousState == 'IDLE_L')
            this.state = 'WALK_L';
        }

        if(this.controllable && Keyboard.isUp(Keyboard.SPACE))
        {
            this.doesJump = true;
        }

        if(this.physics.onFloor && this.previousState == 'WALK_R')
        {
            this.state = 'IDLE_R';
        }

        if(this.physics.onFloor && this.previousState == 'WALK_L')
        {
            this.state = 'IDLE_L';
        }

        if (this.controllable && Keyboard.isDown(Keyboard.LEFT_ARROW)) {
            this.physics.addForce(-this.speed.x, 0);
            this.state = 'WALK_L';
        }

        if (this.controllable && Keyboard.isDown(Keyboard.RIGHT_ARROW)) {
            this.physics.addForce(this.speed.x, 0);
            this.state = 'WALK_R';
        }

        if (Keyboard.isDown(Keyboard.ESCAPE)) {
            Game.Npc.leaveNpc(this);
        }
    };

    /**
     * Triggered when the character is being possessed
     */
    Colombe.prototype.onPossess = function() {
        var self = this;
        setTimeout(function() {
            self.controllable = true;
        }, Game.Npc.STUN_TIME);
        Game.map.autoScroll();
    };

    /**
     * Triggered when the character is being left
     */
    Colombe.prototype.onLeave = function() {
        if (this.state == 'WALK_L' || this.state == 'WALK_L') {
            this.state = 'WALK_L';
        } else{
            this.state = 'WALK_R';
        }
    };

    Game.Colombe = Colombe;
})();