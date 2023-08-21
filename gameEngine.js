/**
 * All sprites are created in the Game class in the
 * resetGame() method. This method is first called
 * when the Game object is created and it creates all
 * the other sprites and adds them to the main sprites Array.
 *
 * Space pauses and unpauses Game.
 * Game resets automatically when player loses.
 * When player wins, pressing Enter resets game.
 *
 * There's no global variables, variable names that
 * appear global are local and used for readability.
 *
 *
 * Score is top left and increases 1 when breaking a brick.
 */

//Main Game Class
class Game {
  constructor() {
    this.canvas = document.getElementById("myCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.sprites = [];
    this.firstTime = true;
    this.gameOver = false;
    this.playerLost = false;
    this.paused = true;
    this.canvasWidth = 1200;
    this.canvasHeight = 700;
    this.resetGame();
  }
  update() {
    //game is over when player either wins or lose
    //Pressing Space pauses and unpauses game
    if (this.gameOver) {
      if (this.playerLost) {
        this.resetGame();
      } else if (this.gameOver) {
        window.onkeyup = (e) => {
          if (e.keyCode === 13) {
            this.resetGame();
          }
        };
      }
    } else if (this.paused) {
      //we press space to pause game or unpause
      window.onkeydown = (e) => {
        if (e.keyCode === 32) {
          this.paused = false;
          if (this.firstTime) {
            for (var i = 0; i < this.sprites.length; i++) {
              if (this.sprites[i] instanceof GameOver) {
                this.sprites[i].value2 = "";
                this.firstTime = false;
              }
            }
          }
        }
      };
    } else {
      document.onkeydown = (e) => {
        if (e.keyCode === 32) {
          if (this.paused) {
            this.paused = false;
          } else this.paused = true;
        }
      };
      var lDeletedArray = [];
      for (var i = 0; i < this.sprites.length; i++) {
        this.gameOver = this.sprites[i].update(
          this.sprites,
          this.canvasWidth,
          this.canvasHeight
        );
        this.playerLost = this.gameOver;
        if (
          this.sprites[i] instanceof Bullet ||
          this.sprites[i] instanceof Brick ||
          this.sprites[i] instanceof PowerUp
        ) {
          if (this.sprites[i].destroyed) {
            lDeletedArray.push(i);
            if (this.sprites[i] instanceof Brick) {
              if (this.sprites[i].hasPowerUp == true) {
                let powerUp = new PowerUp(
                  this.sprites[i].bX + this.sprites[i].width / 2,
                  this.sprites[i].bY + this.sprites[i].height,
                  20,
                  20,
                  "yellow",
                  false
                );
                myGame.addSprite(powerUp);
              }
            }
          }
        }
      }

      let c = 0;
      for (var i = 0; i < this.sprites.length; i++) {
        if (this.sprites[i] instanceof Brick && !this.sprites[i].destroyed) {
          c++;
        }
      }

      //Game is over, all Bricks are destroyed
      if (c === 0) {
        for (let index = 0; index < this.sprites.length; index++) {
          /**One brick will be still appear to be left on the screen
           * so we delete it at the end.
           */
          if (this.sprites[index] instanceof Brick) {
            this.sprites.splice(index, 1);
          }
          if (this.sprites[index] instanceof GameOver) {
            this.sprites[index].value = "You win!";
            this.sprites[index].value2 = "Press Enter to restart";
          }
        }
        this.gameOver = true;
      } else {
        for (let ind = 0; ind < this.sprites.length; ind++) {
          if (this.sprites[ind] instanceof Score) {
            this.sprites[ind].value = 31 - c;
          }
        }
      }

      if (lDeletedArray.length > 0) {
        this.sprites.splice(lDeletedArray[0], 1);
      }
    }
  }

  resetGame() {
    // properties for readability
    let paddleWidth = 220,
      paddleHeight = 30,
      brickWidth = 150,
      brickHeight = 30,
      brickRows = 6,
      brickColumns = 5,
      numberOfBricks = brickRows * brickColumns;

    this.sprites = [];
    this.paused = true;
    this.gameOver = false;
    this.firstTime = true;
    var myBall = new Ball(590, 619, 30, "up", 0);
    var paddle = new Paddle(
      480,
      650,
      paddleWidth,
      paddleHeight,
      "green",
      false
    );
    var score = new Score(10, 30, 0, "green");
    var gameOverSprite = new GameOver(
      this.canvasWidth / 5,
      this.canvasHeight / 2,
      this.canvasWidth / 5,
      this.canvasHeight - this.canvasHeight / 4,
      "",
      "Press Space to Start",
      "green"
    );

    //create bricks
    for (var i = 0; i < brickRows; i++) {
      for (var j = 1; j < brickColumns + 1; j++) {
        let hasPowerUp = false;
        let rnd = Math.floor(Math.random() * 6);
        if (rnd == 3) {
          hasPowerUp = true;
        }
        var brick = new Brick(
          i * 200 + 20,
          j * 70,
          brickWidth,
          brickHeight,
          "red",
          false,
          hasPowerUp
        );
        this.addSprite(brick);
      }
    }

    this.addSprite(brick);
    this.addSprite(paddle);
    this.addSprite(score);
    this.addSprite(gameOverSprite);
    this.addSprite(myBall);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight); //clear canvas to re-draw
    for (var i = 0; i < this.sprites.length; i++)
      this.sprites[i].draw(this.ctx);
  }
  addSprite(pSprite) {
    this.sprites.push(pSprite);
  }
}

//Sprite
class Sprite {
  constructor() {}
  update() {}
  draw(ctx) {}
}
class Ball extends Sprite {
  constructor(cX, cY, radius, trajectory, collisionAngle) {
    super();
    this.scoreLabel = document.getElementById("scoreLabel");
    this.score = 0;

    this.centerX = cX;
    this.centerY = cY;
    this.radius = radius;
    this.trajectory = trajectory;
    this.collisionAngle = collisionAngle; //based on distance from paddle center
  }
  update(spritesArray, canvasWidth, canvasHeight) {
    //check collision between ball and canvas edges
    let collisionCanvas = false,
      collisionBallPaddle = false,
      collisionBallBrick = false;
    var myPaddle;
    for (var i = 0; i < spritesArray.length; i++) {
      if (spritesArray[i] instanceof Paddle) {
        myPaddle = spritesArray[i];
      }
    }
    //check collision ball-canvas
    if (this.centerX - this.radius <= 0) {
      collisionCanvas = true;
      this.trajectory = "right";
    } else if (this.centerX + this.radius >= canvasWidth) {
      collisionCanvas = true;
      this.trajectory = "left";
    } else if (this.centerY - this.radius <= 0) {
      collisionCanvas = true;
      this.trajectory = "down";
    } else if (this.centerY + this.radius >= canvasHeight) {
      for (var i = 0; i < spritesArray.length; i++) {
        if (spritesArray[i] instanceof GameOver) {
          spritesArray[i].value = "You Lose";
          spritesArray[i].value2 = "Press Enter to restart";
        }
      }
      return true; //When Ball's update method returns true it means the player lost
    }
    if (!collisionCanvas) {
      //check collision ball-paddle
      let dx = myPaddle.rX - this.centerX;
      let dy = myPaddle.rY - this.centerY;
      let distanceBPLT = Math.sqrt(dx * dx + dy * dy);

      let dxRight = myPaddle.rX + myPaddle.width - this.centerX;
      let dyRight = myPaddle.rY - this.centerY;
      let distanceBPRT = Math.sqrt(dxRight * dxRight + dyRight * dyRight);

      if (distanceBPLT <= 30 || distanceBPRT <= 30) {
        collisionBallPaddle = true;
        this.collisionAngle = -1;
      } else if (
        this.centerX >= myPaddle.rX &&
        this.centerX <= myPaddle.rX + myPaddle.width &&
        this.centerY + 30 >= myPaddle.rY
      ) {
        let xCenter = myPaddle.rX + myPaddle.width / 2;
        let yCenter = myPaddle.rY + myPaddle.height / 2;

        let distanceFromCenter = Math.sqrt(
          this.centerX * xCenter + this.centerY * yCenter
        );
        if (this.centerX > xCenter) {
          this.collisionAngle = distanceFromCenter * 0.005;
        } else {
          this.collisionAngle = distanceFromCenter * -0.005;
        }

        collisionBallPaddle = true;
      }
    }

    if (collisionBallPaddle) {
      this.trajectory = "up";
    } else {
      //collision with bricks
      for (var i = 0; i < spritesArray.length; i++) {
        if (
          spritesArray[i] instanceof Brick &&
          spritesArray[i].destroyed == false
        ) {
          let dBBXL = spritesArray[i].bX - this.centerX;
          let DBBYL = spritesArray[i].bY - this.centerY;
          let distanceBallBrickLT = Math.sqrt(dBBXL * dBBXL + DBBYL * DBBYL);

          let DBBYLB =
            spritesArray[i].bY + spritesArray[i].height - this.centerY;
          let distanceBallBrickLB = Math.sqrt(dBBXL * dBBXL + DBBYLB * DBBYLB);

          let dBBXR = spritesArray[i].bX + spritesArray[i].width - this.centerX;
          let distanceBallBrickRT = Math.sqrt(dBBXR * dBBXR + DBBYL * DBBYL);
          let dBBXLb =
            spritesArray[i].bX + spritesArray[i].width - this.centerX;
          let dBBYLb =
            spritesArray[i].bY + spritesArray[i].height - this.centerY;
          let distanceBallBrickRB = Math.sqrt(
            dBBXLb * dBBXLb + dBBYLb * dBBYLb
          );
          if (
            distanceBallBrickLT <= this.radius ||
            distanceBallBrickLB <= this.radius ||
            distanceBallBrickRT <= this.radius ||
            distanceBallBrickRB <= this.radius
          ) {
            collisionBallBrick = true;
            spritesArray[i].destroyed = true;

            if (this.centerY <= spritesArray[i].bY) {
              this.trajectory = "up";
            } else {
              this.trajectory = "down";
            }
          } else {
            if (
              this.centerY >= spritesArray[i].bY - this.radius &&
              this.centerY <=
                spritesArray[i].bY + this.radius + spritesArray[i].height
            ) {
              if (
                this.centerX >= spritesArray[i].bX &&
                this.centerX <=
                  spritesArray[i].bX + spritesArray[i].width + this.radius
              ) {
                collisionBallBrick = true;
                spritesArray[i].destroyed = true;
                if (this.centerY <= spritesArray[i].bY) {
                  this.trajectory = "up";
                } else {
                  this.trajectory = "down";
                }
              }
            }
          }
        }
      }
    }

    //move ball according to trajectory
    if (this.trajectory == "up") {
      this.centerY -= 10;
      this.centerX += this.collisionAngle;
    } else if (this.trajectory == "down") {
      this.centerY += 10;
      this.centerX += this.collisionAngle;
    } else if (this.trajectory == "right") {
      this.centerX += 10;
      this.centerY += this.collisionAngle;
    } else if (this.trajectory == "left") {
      this.centerX -= 10;
      this.centerY += this.collisionAngle;
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius, 2 * Math.PI, false);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.stroke();
  }
}
class Paddle extends Sprite {
  constructor(rX, rY, width, height, fillStyle, poweredUp) {
    super();
    this.rX = rX;
    this.rY = rY;
    this.width = width;
    this.height = height;
    this.fillStyle = fillStyle;
    this.poweredUp = poweredUp;
  }
  update(spritesArray, canvasWidth, canvasHeight) {
    window.onkeydown = (e) => {
      switch (e.keyCode) {
        case 37:
          if (this.rX - 60 <= 0) {
            this.rX = 0;
          } else {
            this.rX -= 60;
          }
          break;
        case 39:
          if (this.rX + 60 + this.width >= canvasWidth) {
            this.rX = canvasWidth - this.width;
          } else {
            this.rX += 60;
          }
          break;
      }

      if (e.keyCode == 83) {
        //Create and add bullets to sprites Array when player presses S to shoot if poweredUp
        if (this.poweredUp) {
          let bulletWidth = 20,
            bulletHeight = 20;

          let bullet1 = new Bullet(
            this.rX,
            this.rY - bulletHeight,
            bulletWidth,
            bulletHeight,
            "purple",
            false
          );

          let bullet2 = new Bullet(
            this.rX + this.width - bulletWidth,
            this.rY - bulletHeight,
            bulletWidth,
            bulletHeight,
            "purple",
            false
          );
          myGame.addSprite(bullet1); //Add bullets to sprites array
          myGame.addSprite(bullet2);
        }
      }
    };
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.fillStyle;
    ctx.fillRect(this.rX, this.rY, this.width, this.height);
    ctx.stroke();
  }
}

class Brick extends Sprite {
  constructor(bX, bY, width, height, fillStyle, destroyed, hasPowerUp) {
    super();
    this.bX = bX;
    this.bY = bY;
    this.width = width;
    this.height = height;
    this.fillStyle = fillStyle;
    this.destroyed = destroyed;
    this.hasPowerUp = hasPowerUp;
  }

  update() {}
  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.fillStyle;
    ctx.fillRect(this.bX, this.bY, this.width, this.height);
    ctx.stroke();
  }
}

class PowerUp extends Sprite {
  constructor(x, y, width, height, fillStyle, destroyed) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.fillStyle = fillStyle;
    this.destroyed = destroyed;
  }
  update(spritesArray, canvasWidth, canvasHeight) {
    var myPaddle; //get paddle in variable so it's easier to read
    for (var i = 0; i < spritesArray.length; i++) {
      if (spritesArray[i] instanceof Paddle) {
        myPaddle = spritesArray[i];
      }
    }
    if (this.y + this.height >= canvasHeight) {
      this.destroyed = true;
    }
    if (
      this.y + this.height >= myPaddle.rY &&
      this.y <= myPaddle.rY + myPaddle.height
    ) {
      if (
        this.x >= myPaddle.rX - this.width &&
        this.x <= myPaddle.rX + myPaddle.width + this.width
      ) {
        myPaddle.poweredUp = true;
        myPaddle.fillStyle = "lightsalmon";
        this.destroyed = true;
      }
    }
    this.y += 10;
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.fillStyle;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.stroke();
  }
}

class Bullet extends Sprite {
  constructor(x, y, width, height, fillStyle, destroyed) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.fillStyle = fillStyle;
    this.destroyed = destroyed;
  }

  update(spritesArray) {
    //check collision with canvas
    if (this.y <= 0) {
      this.destroyed = true;
      return;
    }
    let s = 0;
    //check collision with bricks
    for (var i = 0; i < spritesArray.length; i++) {
      if (spritesArray[i] instanceof Brick) {
        if (
          this.y >= spritesArray[i].bY &&
          this.y <= spritesArray[i].bY + spritesArray[i].height
        ) {
          if (
            this.x >= spritesArray[i].bX - this.width &&
            this.x <= spritesArray[i].bX + spritesArray[i].width + this.width
          ) {
            if (spritesArray[i].destroyed == false) {
              spritesArray[i].destroyed = true;
              this.destroyed = true;
            }
          }
        }
      }
    }

    this.y -= 10;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.fillStyle;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.stroke();
  }
}

class Score extends Sprite {
  constructor(x, y, value, color) {
    super();
    this.x = x;
    this.y = y;
    this.value = value;
    this.color = color;
  }
  update() {}
  draw(ctx) {
    ctx.font = "30px Arial";
    ctx.fillStyle = this.color;
    ctx.fillText("Score is: " + this.value, this.x, this.y);
  }
}

class GameOver extends Sprite {
  constructor(x, y, x2, y2, value, value2, color) {
    super();
    this.x = x;
    this.y = y;
    this.x2 = x2;
    this.y2 = y2;
    this.value = value;
    this.value2 = value2;
    this.color = color;
  }
  update() {}
  draw(ctx) {
    ctx.font = "100px Arial";
    ctx.fillStyle = this.color;
    ctx.fillText(this.value, this.x, this.y);
    ctx.fillText(this.value2, this.x2, this.y2);
  }
}

var requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

var myGame = new Game();

function gameEngineLoop() {
  myGame.update();
  myGame.draw();
  requestAnimFrame(gameEngineLoop);
}

gameEngineLoop();
