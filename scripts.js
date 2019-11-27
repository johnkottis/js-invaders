/**
 * Invaders generator
 */
var Alien = function (aType, aLine, aCol) {
    this.type = aType;
    this.points = 40 - 10 * aType;
    this.line = aLine;
    this.column = aCol;
    this.alive = true;
    this.height = 20;
    this.width = 28;
    this.positionX = 100 + this.width * this.column;
    this.positionY = 100 + 30 * this.line;
    this.direction = 1;
    this.state = 0;

    // switch aliens' avatar happy/unhappy
    this.changeState = function () { //change the state (2 different images for each alien)
        this.state = !this.state ? 20 : 0;
    };

    //shift aliens a row closer to the tank
    this.down = function () { 
        this.positionY = this.positionY + 10;
    };

    //set new position after moving and draw the alien
    this.move = function () { 
        if (this.positionY >= Game.height - 50) {
            Game.over();
        }
        this.positionX = this.positionX + 5 * Game.direction;
        this.changeState();
        if (this.alive) this.draw();
    };

    //Check if the alien is killed by Tank's laser
    this.checkCollision = function () { 
        if (Tank.laser.active == true && this.alive == true) {
            if ((Tank.laser.positionX >= this.positionX && Tank.laser.positionX <= (this.positionX + this.width)) && (Tank.laser.positionY >= this.positionY && Tank.laser.positionY <= (this.positionY + this.height))) {
                this.kill();
                Tank.laser.destroy();
            }
        }
    };

    //draw the alien to his new position
    this.draw = function () { 
        //draw the alien
        if (this.alive) { 
            canvas.drawImage(
            pic,
            this.width * (this.type - 1),
            this.state,
            this.width,
            this.height,
            this.positionX,
            this.positionY,
            this.width,
            this.height);
        } 
        //draw the explosion
        else if (this.alive == null) { 
            canvas.drawImage(
            pic,
            85,
            20,
            28,
            20,
            this.positionX,
            this.positionY,
            this.width,
            this.height);
            this.alive = false; //alien won't be displayed any more
        }
    };

    //kill the alien
    this.kill = function () { 
        this.alive = null;
        canvas.clearRect(this.positionX, this.positionY, this.width, this.height);
        Game.refreshScore(this.points);
    }
};

/**
 * Tanks Class
 */
Tank = { 
    position: 220,
    toleft: false,
    toright: false,

    //initialize the tank and his move
    init: function () { 
        this.draw();
        this.toLeft();
        this.toRight();
        setInterval("Tank.toLeft()", 30);
        setInterval("Tank.toRight()", 30);
    },

    //draws the tank
    draw: function () { 
        canvas.drawImage(pic, 85, 0, 28, 20, this.position, 470, 28, 20);
    },

/**
 * Tank's controls.
 * Fire
 * Move to the left
 * Move to the right
 */
    fire: function () { 
        this.laser.create();
    },

    toLeft: function () { 
        if (this.toleft) {
            if (this.position - 5 > 0) {
                canvas.clearRect(0, 472, Game.width, 28);
                this.position -= 5;
                this.draw();
            }
        }
    },

    toRight: function () { 
        if (this.toright) {
            if (this.position + 30 < Game.width) {
                canvas.clearRect(0, 472, Game.width, 28);
                this.position += 5;
                this.draw();
            }
        }
    },

    laser: { 
        positionX: 0,
        positionY: 465,
        length: 5,
        speed: 15,
        animation: null,
        active: false,
        //created the laser if it does not exist
        create: function () { 
            if (!this.active) {
                this.positionX = Tank.position + 14;
                this.active = true;
                this.animation = setInterval("Tank.laser.animate()", this.speed);
            }

        },
        //animate the laser
        animate: function () { 
            this.positionY -= this.length;
            if (this.positionY <= 5) this.destroy();
            else {
                Game.drawAliens();
                this.draw();
            }
        },
        //draw the laser and check collision with aliens
        draw: function () { 
            if (this.active) {
                canvas.beginPath();
                canvas.strokeStyle = 'white';
                canvas.lineWidth = 2;
                canvas.moveTo(this.positionX, this.positionY);
                canvas.lineTo(this.positionX, this.positionY + this.length);
                canvas.stroke();

                for (i = 0; i < 5; i++) {
                    for (j = 0; j < 11; j++) {
                        Game.aliens[i][j].checkCollision();
                    }
                }
            }
        },
        //destroy the laser
        destroy: function () { 
            this.positionY = 465;
            this.active = false;
            clearInterval(this.animation);
            this.animation = null;
            Game.drawAliens();
        },
    }

};

/**
 * Game Engine
 */
Game = {
    //define kinds of aliens
    types: [1, 2, 2, 3, 3], 
    aliens: [
        [11],
        [11],
        [11],
        [11],
        [11]
    ],
    height: 0,
    width: 0,
    interval: 0,
    intervalDefault: 1000,
    direction: 1,
    animation: null,
    alives: 1,
    score: 0,
    level: 1,

    //initialize default position and behaviour
    init: function (aWidth, aHeight) { 
        for (i = 0; i < 5; i++) {
            for (j = 0; j < 11; j++) {
                this.aliens[i][j] = new Alien(this.types[i], i, j);
                this.alives++;
                this.aliens[i][j].draw();
            }
        }
        this.width = aWidth;
        this.height = aHeight;
        this.play();
        Tank.init();
        this.refreshScore(0);
        document.getElementById('level').innerHTML = this.level;
    },

    //change the direction (left or right)
    changeDirection: function () { 
        if (this.direction == 1) {
            this.direction = -1;
        } else {
            this.direction = 1;
        }
    },
    //clear the canvas (but not the tank)
    clearCanvas: function () { 
        canvas.clearRect(0, 0, this.width, this.height - 28);
    },
    //check if the aliens reach the left border
    closeToLeft: function () { 
        return (this.aliens[0][0].positionX - 10 < 0) ? true : false;
    },
    //check if the aliens reach the right border
    closeToRight: function () { 
        return (this.aliens[4][10].positionX + 35 > this.width) ? true : false;
    },
    //draw the aliens
    drawAliens: function () { 
        this.clearCanvas();
        for (i = 0; i < 5; i++) {
            for (j = 0; j < 11; j++) {
                this.aliens[i][j].draw();
            }
        }
    },
    //move the aliens
    animate: function () { 		
        this.clearCanvas();
        Tank.laser.draw();
        this.checkAliens();
        for (i = 0; i < 5; i++) {
            for (j = 0; j < 11; j++) {
                this.aliens[i][j].move();
            }
        }
        if (this.closeToLeft() || this.closeToRight()) {
            this.changeDirection();
            for (i = 0; i < 5; i++) {
                for (j = 0; j < 11; j++) {
                    this.aliens[i][j].down();
                }
            }
            this.increaseSpeed();
        }
    },
    //play the game	
    play: function () { 
        this.interval = this.intervalDefault;
        this.interval = this.interval - (this.level * 20);
        this.animation = setInterval("Game.animate()", this.interval);
    },
    //increase the speed
    increaseSpeed: function (newInterval) { 
        clearInterval(this.animation);
        if (newInterval === undefined) this.interval = this.interval - 10;
        else this.interval = newInterval;

        this.animation = setInterval("Game.animate()", this.interval);
    },
    //key down event
    onkeydown: function (ev) { 
        if (ev.keyCode == 37) Tank.toleft = true;
        else if (ev.keyCode == 39) Tank.toright = true;
        else if (ev.keyCode == 32) Tank.fire();
        else return;
    },
    //key up event
    onkeyup: function (ev) { 
        if (ev.keyCode == 37) Tank.toleft = false;
        else if (ev.keyCode == 39) Tank.toright = false;
        else return;
    },
    //ends the game
    over: function () { 
        clearInterval(this.animation);
        canvas.clearRect(0, 0, this.width, this.height);
        canvas.font = "40pt Calibri,Geneva,Arial";
        canvas.strokeStyle = "rgb(FF,0,0)";
        canvas.fillStyle = "rgb(0,20,180)";
        canvas.strokeText("Game Over", this.width / 2 - 150, this.height / 2 - 10);
    },
    //check number of aliens
    checkAliens: function () { 
        if (this.alives == 0) this.nextLevel();
        else if (this.alives == 1) this.increaseSpeed(150 - (this.level * 10));
        else if (this.alives <= 10) this.increaseSpeed(200 - (this.level * 10));
        else if (this.alives <= 10) this.increaseSpeed(300 - (this.level * 10));
        else if (this.alives <= 25) this.increaseSpeed(500 - (this.level * 10));
    },
    //display the score
    refreshScore: function (points) { 
        this.alives--;
        this.score += points;
        document.getElementById('score').innerHTML = this.score;
        document.getElementById('alives').innerHTML = this.alives;
    },
    nextLevel: function () {
        //redeploy aliens
        for (i = 0; i < 5; i++) {
            for (j = 0; j < 11; j++) {
                this.aliens[i][j].alive = true;
                this.alives++;
            }
        }
        clearInterval(this.animation);
        this.level++;
        document.getElementById('level').innerHTML = this.level;
        this.play();
        this.increaseSpeed(this.interval);
    }
};

//define the global context of the game
var element = document.getElementById('aliensCanvas');
if (element.getContext) {
    var canvas = element.getContext('2d');

    var pic = new Image();
    pic.src = 'sprite.png';

    Game.init(530, 500);

    document.body.onkeydown = function (ev) {
        Game.onkeydown(ev);
    };
    document.body.onkeyup = function (ev) {
        Game.onkeyup(ev);
    };
}
