const player = document.getElementById("player");
const playerHeight = player.offsetHeight;
const playerWidth = player.offsetWidth;

let playerState = "idle";

//amount of enemies player has killed
let numOfKilledEnemies = 0;

//audios
let gameBgM = new Audio("assets/audio/gameplay bgm.mp3");
gameBgM.loop = true;
gameBgM.play();

//add enemy elements to an array
const enemiesEl = document.getElementsByClassName("enemy");
const enemyWidth = enemiesEl[0].offsetWidth;
const enemyHeight = enemiesEl[0].offsetHeight;
//boss
//boss is the last item of enemies
const boss = document.getElementById("boss");
const bossLog = document.getElementsByClassName("boss-log-img")[0];
const bossHeight = boss.offsetHeight;
const bossWidth = boss.offsetWidth;
let bossLogPos = boss.getBoundingClientRect();

//add log cordinates to an array
const logs = document.getElementsByClassName("log-img");
const logLength = logs[0].offsetWidth;
const logHeight = logs[0].offsetHeight;

let logsPoses = [];
for (let i = 0; i < logs.length; i++) {
  let logPos = logs[i].getBoundingClientRect();
  logsPoses.push([logPos.left, logPos.top, parseInt(logs[i].name)]);
}

//collision handle
let leftMoveCollision = false;
let rightMoveCollision = false;
//player is not on top of a log
let onLog = false;

// SET PLAYER INITIAL POSITION

const ground = document.getElementById("ground");
//ground position
let groundPos = ground.getBoundingClientRect();

//set player on the ground
let playerOnGroundPos = `${groundPos.top - playerHeight - 2}px`;
player.style.top = playerOnGroundPos;

//SCORE BOARD
//score board properties
let score = 0;
let scoreEl = document.getElementById("player-score");

function updateScore() {
  scoreEl.innerHTML = score;
}

//score board html elements
let healthBarEl = document.getElementById("healthbar-inner");
let healthBarMax = 340;
let playerCurrentHealth = 340;
let ghostHitStrength = 0.01 * healthBarMax;
let bossHitStrength = 0.02 * healthBarMax;

// health bar changer
function decreaseHealth() {
  if (playerCurrentHealth <= 0) {
    //player dies
    playerCurrentHealth = 0;
    playerDeath();
  }
  healthBarEl.style.width = `${playerCurrentHealth}px`;
}

//player death handle
function playerDeath() {
  playerState = "death";
  let playerDeadImgNo = 0;
  let playerDeadWorkerId = 0;
  playerDeadWorkerId = setInterval(() => {
    playerDeadImgNo++;
    if (playerDeadImgNo === 6) {
      clearInterval(playerDeadWorkerId);
    }

    player.src = `assets/Cropped/samurai/Death/Death${playerDeadImgNo}.png`;
  }, 200);
  document.getElementById("player-place").innerText = "You Lose!";
  document.getElementById("end-score").innerText = score;
  setTimeout(() => {
    let gameWonMenuEl = document.getElementById("game-won-menu-wrap");
    gameWonMenuEl.style.display = "flex";
    let opacity = 0;
    function fade() {
      if (opacity >= 1) {
        cancelAnimationFrame(fade);
        return;
      }
      opacity += 0.1;
      gameWonMenuEl.style.opacity = opacity;
      requestAnimationFrame(fade);
    }

    requestAnimationFrame(fade);
  }, 2000);
}

class Player {
  constructor(
    domPlayer,
    xPos,
    yPos,
    moveLeft = false,
    moveRight = false,
    onGround = true,
    xVelocity = 5, //1px per second
    yVelocity = 150, //150px per second
    playerStage = [groundPos.left, groundPos.top, 0],
    playerLife = 100,
    activeEnemy = 0
  ) {
    this.domPlayer = domPlayer;
    this.xPos = xPos;
    this.yPos = yPos;
    this.moveLeft = moveLeft;
    this.moveRight = moveRight;
    this.onGround = onGround;
    this.xVelocity = xVelocity;
    this.yVelocity = yVelocity;
    this.playerStage = playerStage;
    this.playerLife = playerLife;
    this.activeEnemy = activeEnemy;
  }

  moveX(distanceToMove, playerCurrentPosX) {
    //if player is on log and walks off of the log player starts to fall down
    if (onLog) {
      if (
        this.moveLeft &&
        playerCurrentPosX + playerWidth < this.playerStage[0]
      ) {
        this.onGround = false;
      } else if (
        this.moveRight &&
        playerCurrentPosX > this.playerStage[0] + logLength
      ) {
        this.onGround = false;
      }
    }
    if (this.moveLeft) {
      //move left
      logsPoses.map((logPos) => {
        if (
          this.xPos > logPos[0] + logLength &&
          this.xPos - distanceToMove <= logPos[0] + logLength &&
          this.yPos + playerHeight >= logPos[1] &&
          this.yPos <= logPos[1] + logHeight
        ) {
          leftMoveCollision = true;
        }
      });
      if (!leftMoveCollision) {
        //move upper layer to the right
        if (!upperLayerMarginLeft <= 0) {
          this.xVelocity = 9;
          upperLayerMarginLeft += upperLayerVelocityX;
          upperLayer.style.marginLeft = `${upperLayerMarginLeft}px`;
        } else {
          this.xVelocity = 5;
        }

        //move player to the left
        // restrict player from going off the screen
        if (playerCurrentPosX - distanceToMove >= 0) {
          //move background layer to the right
          backgroundLayerMarginLeft += backgroundLayerVelocityX;
          backgroundLayer.style.marginLeft = `${backgroundLayerMarginLeft}px`;
          //move player
          this.domPlayer.style.left = `${playerCurrentPosX - distanceToMove}px`;
          this.xPos = playerCurrentPosX - distanceToMove;
        }
      }
    } else if (this.moveRight) {
      //move right
      // for (let i = 0; i < logs.length; i++) {
      // }
      logsPoses.map((logPos) => {
        if (
          this.xPos + playerWidth < logPos[0] &&
          this.xPos + playerWidth + distanceToMove >= logPos[0] &&
          this.yPos + playerHeight >= logPos[1] &&
          this.yPos <= logPos[1] + logHeight
        ) {
          rightMoveCollision = true;
        }
      });
      if (!rightMoveCollision) {
        //move upper layer to the right
        if (upperLayerMarginLeft >= window.innerWidth - 2600) {
          this.xVelocity = 9;
          upperLayerMarginLeft -= upperLayerVelocityX;
          upperLayer.style.marginLeft = `${upperLayerMarginLeft}px`;
        } else {
          this.xVelocity = 5;
        }

        // restrict player from going off the screen
        if (parseInt(this.domPlayer.style.left) <= 2600 - playerWidth) {
          //move background layer to the right
          backgroundLayerMarginLeft -= backgroundLayerVelocityX;
          backgroundLayer.style.marginLeft = `${backgroundLayerMarginLeft}px`;
          //move player
          this.domPlayer.style.left = `${playerCurrentPosX + distanceToMove}px`;
          this.xPos = playerCurrentPosX + distanceToMove;
        }
      }
    }
  }

  moveY(currentPosY) {
    //where the player should be on
    this.playerStage = [groundPos.left, groundPos.top, 0];

    logsPoses.map((logPos) => {
      if (this.yPos + playerHeight <= logPos[1]) {
        if (
          this.xPos + playerWidth >= logPos[0] &&
          this.xPos < logPos[0] + logLength &&
          this.playerStage[1] - (this.yPos + playerHeight) >
            logPos[1] - (this.yPos + playerHeight)
        ) {
          //if player is above a log set player to land on top of that log
          this.playerStage = [logPos[0], logPos[1], logPos[2]];
        }
      }
    });

    if (
      this.yVelocity < 0 &&
      currentPosY + playerHeight + Math.abs(distanceToMoveY) >=
        this.playerStage[1]
    ) {
      //end fall
      if (this.playerStage[1] !== groundPos.top) {
        onLog = true;
      } else {
        onLog = false;
      }
      this.yVelocity = 0;
      this.xVelocity = 5;
      this.yPos = this.playerStage[1] - playerHeight - 2;
      this.domPlayer.style.top = `${this.playerStage[1] - playerHeight - 2}px`;
      this.onGround = true;
      playerState = "idle";
    } else {
      //when player jumps while collided with a log player ables to move X
      logsPoses.map((logPos) => {
        if (this.moveRight) {
          if (logPos[1] > this.yPos + playerHeight && rightMoveCollision) {
            rightMoveCollision = false;
          }
        } else {
          if (logPos[1] > this.yPos + playerHeight && leftMoveCollision) {
            leftMoveCollision = false;
          }
        }
      });
      //change player animtion to jump
      playerState = "jump";
      if (this.yVelocity < 0) {
        //fall
        this.domPlayer.src = "assets/Cropped/samurai/Jump/Fall 1.png";
      } else {
        //jump
        this.domPlayer.src = "assets/Cropped/samurai/Jump/Jump 1.png";
      }
      distanceToMoveY =
        this.yVelocity * TIME_SLOT - 0.5 * GinPx * TIME_SLOT ** 2;
      this.yVelocity -= GinPx * TIME_SLOT;
      this.domPlayer.style.top = `${currentPosY - distanceToMoveY}px`;
      this.yPos = currentPosY - distanceToMoveY;
    }
  }
}

//ENEMY
let enemyState = "idle";
let attackAnimateIdEnemy = 0;
let attackImgNoEnemy = 0;
let attackAnimationFrameRateEnemy = 7;
let attackAnimationIndexEnemy = 0;

//boss
let attackTypeBoss = 1; //randomly choose 1 or 2 attack

class Enemy {
  constructor(
    enemyId,
    logId,
    enemyState = "idle",
    domElement,
    initialPos = [],
    currentPos = [],
    eyeRange = logLength - playerWidth,
    playerOnEye = false,
    enemyLife = 100,
    enemyType = 0
  ) {
    this.enemyId = enemyId;
    this.logId = logId;
    this.enemyState = enemyState;
    this.domElement = domElement;
    this.initialPos = initialPos;
    this.currentPos = currentPos;
    this.eyeRange = eyeRange;
    this.playerOnEye = playerOnEye;
    this.enemyLife = enemyLife;
    this.enemyType = enemyType;
  }

  //ANIMATION

  //ACTIONS
  scanPlayer(playerX) {
    if (
      this.currentPos[0] - this.eyeRange <=
      playerX + playerWidth <=
      this.currentPos[0] + enemyWidth
    ) {
      //relavant enemy sees the player
      if (this.playerOnEye) {
        //enemy has seen the player already
        //attack
        if (this.enemyLife > 0) {
          this.attack(this.currentPos[0] - playerX + playerWidth);
        }
      } else {
        //first time seeing the player
        this.playerOnEye = true;
        this.enemyState = "attack";
        attackTypeBoss = 1 || Math.floor(Math.random() * 2) + 1;
        newPlayer.activeEnemy = parseInt(this.enemyId);
        // enemyState = "attack";
      }
    }
  }

  attack(distance) {
    //cancel idle state
    this.enemyState = "attack";
    //only attacks when the player's health is higher than 0
    if (attackAnimateIdEnemy === 0 && playerCurrentHealth > 0) {
      if (distance > 270 && this.enemyType === 0) {
        //long attack
        attackAnimateIdEnemy = setInterval(() => {
          attackImgNoEnemy++;
          if (attackImgNoEnemy >= 8) {
            attackImgNoEnemy = 1;
            let chargeShootImgNo = 0;
            let chargeElClass = document.getElementsByName(`${this.logId}`)[1];

            let newCharge = document.createElement("img");
            newCharge.src = "assets/Cropped/ghost/Attack3/Charge_1 1.png";
            newCharge.classList.add("charge");
            newCharge.name = `${this.enemyId}`;
            newCharge.style.width = "70px";
            newCharge.style.height = "50px";
            newCharge.style.display = "block";

            chargeElClass.appendChild(newCharge);

            let newChargeElCurrentPosX = newCharge.getBoundingClientRect().left;
            let chargeShoot = setInterval(() => {
              chargeShootImgNo++;
              if (chargeShootImgNo >= 20) {
                chargeShootImgNo = 0;
                clearInterval(chargeShoot);
              } else {
                //if colide or hit then dissapear, else move
                if (parseInt(newChargeElCurrentPosX) <= 0) {
                  //dodge
                  newCharge.remove();
                } else if (
                  newPlayer.yPos + playerHeight >
                    logsPoses[this.enemyId - 1][1] - enemyHeight + 30 &&
                  newPlayer.yPos <
                    logsPoses[this.enemyId - 1][1] - enemyHeight + 30 + 50 &&
                  player.x + playerWidth > parseInt(newCharge.x) - 10 &&
                  player.x < parseInt(newCharge.x) + 70
                ) {
                  //player hit
                  newPlayer.playerLife -= 1;
                  playerCurrentHealth -= ghostHitStrength;
                  decreaseHealth();
                  newCharge.remove();
                } else {
                  //shoot charge
                  newChargeElCurrentPosX -= 50;

                  newCharge.style.left = `${newChargeElCurrentPosX}px`;
                }
              }
            }, 130);
            clearInterval(attackAnimateIdEnemy);
            attackAnimateIdEnemy = 0;
          }
          this.domElement.src = `assets/Cropped/ghost/Attack3/Attack_3 ${attackImgNoEnemy}.png`;
        }, 200);
      } else {
        if (this.enemyType === 0) {
          //short attack ghost
          attackAnimateIdEnemy = setInterval(() => {
            attackImgNoEnemy++;
            if (attackImgNoEnemy >= 5) {
              attackImgNoEnemy = 1;
              clearInterval(attackAnimateIdEnemy);
              attackAnimateIdEnemy = 0;
            }
            if (
              newPlayer.yPos + playerHeight >
                logsPoses[this.enemyId - 1][1] - enemyHeight + 30 &&
              newPlayer.yPos < logsPoses[this.enemyId - 1][1] + 30 + 50 &&
              attackImgNoEnemy === 4
            ) {
              newPlayer.playerLife -= 1;
              playerCurrentHealth -= ghostHitStrength;
              decreaseHealth();
            }
            this.domElement.src = `assets/Cropped/ghost/Attack1/Attack_1 ${attackImgNoEnemy}.png`;
          }, 200);
        } else if (this.enemyType === 1 && distance <= 270) {
          //handle both boss attacks
          //BOSS
          playerState === "attack";
          attackAnimateIdEnemy = setInterval(() => {
            attackImgNoEnemy++;
            if (attackImgNoEnemy >= 9) {
              attackImgNoEnemy = 1;
              clearInterval(attackAnimateIdEnemy);
              attackAnimateIdEnemy = 0;
              if (attackTypeBoss === 1) {
                attackTypeBoss = 2;
              } else {
                attackTypeBoss = 1;
              }
            }

            if (
              newPlayer.yPos + playerHeight > boss.y &&
              newPlayer.yPos < boss.y + bossHeight &&
              attackImgNoEnemy === 5
            ) {
              playerState === "attack";

              //player got hit by boss
              newPlayer.playerLife -= 5;
              playerCurrentHealth -= bossHitStrength;
              decreaseHealth();
            }

            this.domElement.src = `assets/Cropped/wizard/Attacks/Attack${attackTypeBoss} ${attackImgNoEnemy}.png`;
          }, 80);
        }
      }
    }
  }

  //attrack this enemy to player location
  attract(playerPos = []) {
    this.domElement.addEventListener("click", () => {});
  }
}

let Enemies = new Array();

//create new enemies
for (let i = 0; i < enemiesEl.length; i++) {
  let currentEn = enemiesEl[i];
  let currentEnPosX =
    parseInt(currentEn.style.left) || currentEn.getBoundingClientRect().left;
  let currentEnPosY =
    parseInt(currentEn.style.top) || currentEn.getBoundingClientRect().top;
  //make new enemies
  if (i === enemiesEl.length - 1) {
    //boss
    Enemies[i] = new Enemy(
      currentEn.name,
      logs[i].name,
      "idle",
      currentEn,
      [currentEnPosX, currentEnPosY],
      [currentEnPosX, currentEnPosY],
      logLength - playerWidth,
      false,
      500,
      1
    );
  } else {
    Enemies[i] = new Enemy(
      currentEn.name,
      logs[i].name,
      "idle",
      currentEn,
      [currentEnPosX, currentEnPosY],
      [currentEnPosX, currentEnPosY]
    );
  }
}

//INIT MOVE X
//player current cordinats
let playerCurrentPos = player.getBoundingClientRect();
let moveXInterval;

//...............//
//...............//
//...............//
//...............//
//MOVE UPPER LAYER

const upperLayer = document.getElementById("upper-layer");
let upperLayerVelocityX = 4;
let moveUpperLayerLeft = false;
let moveUpperLayerRight = false;
let upperLayerMarginLeft = 0;

//...............//
//...............//
//...............//
//MOVE BACKGROUND LAYER
const backgroundLayer = document.getElementById("background-layer-1");
let backgroundLayerMoveLeft = false;
let backgroundLayerMoveRight = false;
let backgroundLayerVelocityX = 1;
let backgroundLayerMarginLeft = 0;

const newPlayer = new Player(
  player,
  playerCurrentPos.left,
  playerCurrentPos.top
);

let activeStage = 0;

//handle movement on X plane
function run() {
  let playerCurrentPosX =
    player.style.left || player.getBoundingClientRect().left;
  if (playerState === "run" || playerState === "jump") {
    newPlayer.moveX(newPlayer.xVelocity, parseInt(playerCurrentPosX));
  }

  //activate the player scan function of enemy on the specific log
  if (Enemies[newPlayer.playerStage[2] - 1] != null) {
    //enemy is not dead yet
    if (newPlayer.playerStage[2] > 0) {
      activeStage = newPlayer.playerStage[2];

      Enemies[newPlayer.playerStage[2] - 1].scanPlayer(
        parseInt(playerCurrentPosX)
      );
    } else if (activeStage > 0) {
      //player got away from enemy, set idle enemy
      if (newPlayer.activeEnemy - 1 === enemiesEl[-1]) {
        //boss
        Enemies[
          activeStage - 1
        ].domElement.src = `assets/Cropped/wizard/Idle/Idle1.png`;
      } else {
        //ghost
        Enemies[
          activeStage - 1
        ].domElement.src = `assets/Cropped/ghost/Idle/Idle1.png`;
      }
    }
    Enemies[activeStage - 1].enemyState = "idle";
  }

  requestAnimationFrame(run);
}

run();

//HANDLE JUMP
const HEIGHT = 200; //in meters
const GinPx = 10 / (HEIGHT / window.innerHeight);
const TIME_SLOT = 0.05; //in seconds
let distanceToMoveY;
let moveYInterval;

moveYInterval = setInterval(() => {
  if (!newPlayer.onGround) {
    let playerCurrentPosY =
      player.style.top || player.getBoundingClientRect().top;
    newPlayer.moveY(parseInt(playerCurrentPosY));
  }
}, 5);

// ................... //
// ................... //
// ................... //
// ................... //
// ................... //
// ................... //
// ................... //
// ................... //
// ................... //
// ................... //

//IDLE

//SAMURAI
let idleAnimationId = 0;
let idleImgNo = 0;
let idleAnimationFrameRate = 7;
let idleAnimationIndex = 0;

function playerIdleAnimationChange() {
  if (playerState === "idle") {
    idleAnimationIndex++;
    if (idleAnimationIndex % idleAnimationFrameRate === 0) {
      idleImgNo++;
      if (idleImgNo === 9) {
        idleImgNo = 1;
      }
      player.src = `assets/Cropped/samurai/Idle/Idle${idleImgNo}.png`;
    }
  }
  idleAnimationId = requestAnimationFrame(playerIdleAnimationChange);
}

playerIdleAnimationChange();

//RUN
let runAnimationId = 0;
let runImgNo = 0;
let runAnimationFrameRate = 5;
let runAnimationIndex = 0;
let runDirection = 1;

function playerRunAnimationChange() {
  if (playerState === "run" && newPlayer.onGround) {
    runAnimationIndex++;
    if (runAnimationIndex % runAnimationFrameRate === 0) {
      runImgNo++;
      if (runImgNo === 9) {
        runImgNo = 1;
      }
      if (runDirection === 0) {
        player.style.transform = "scaleX(-1)";
      } else if (runDirection === 1) {
        player.style.transform = "scaleX(1)";
      }
      player.src = `assets/Cropped/samurai/Run/Run${runImgNo}.png`;
    }
  }

  runAnimationId = requestAnimationFrame(playerRunAnimationChange);
}

//ATTACK
let attackAnimationId = 0;
let attackImgNo = 0;
let attackAnimationFrameRate = 10;
let attackAnimationIndex = 0;
let attackType = 1 || Math.floor(Math.random() * 2) + 1; //randomly 1 or 2 // change this addevent

function playerattackAnimationChange() {
  if (playerState === "attack") {
    attackAnimationIndex++;

    if (attackImgNo <= 4) {
      attackAnimationFrameRate = 5;
    } else {
      attackAnimationFrameRate = 15;
      //sword swing
      //check if an enemy touches the swrod
      let checkEnemy = enemiesEl[newPlayer.activeEnemy - 1];
      if (
        newPlayer.activeEnemy - 1 >= 0 &&
        player.y + playerHeight >= checkEnemy.y &&
        player.y <= checkEnemy.y + enemyHeight &&
        player.x + playerWidth >= checkEnemy.x &&
        player.x <= checkEnemy.x + enemyWidth &&
        Enemies[newPlayer.activeEnemy - 1].enemyLife >= 0
      ) {
        //one attack goes as 20
        score += 1;
        scoreEl.innerHTML = `${score}`;
        Enemies[newPlayer.activeEnemy - 1].enemyLife -= 1;
        if (Enemies[newPlayer.activeEnemy - 1].enemyLife <= 0) {
          //active enemy die
          let ghostDieImgNo = 0;
          let ghostDieWorkerId = 0;
          ghostDieWorkerId = setInterval(() => {
            ghostDieImgNo++;
            if (ghostDieImgNo >= 5) {
              //remove enemy when dead
              numOfKilledEnemies += 1;
              ghostDieImgNo = 0;

              Enemies[newPlayer.activeEnemy - 1] = null;

              enemiesEl[newPlayer.activeEnemy - 1] = 0;

              checkEnemy.style.display = "none";
              //check if the game is finished
              if (numOfKilledEnemies === Enemies.length) {
                //player won the game
                document.getElementById("player-place").innerText = "You Win!";

                document.getElementById("end-score").innerText = score;
                setTimeout(() => {
                  let gameWonMenuEl =
                    document.getElementById("game-won-menu-wrap");
                  // gameWonMenuEl.style.opacity = 1;
                  gameWonMenuEl.style.display = "flex";
                  let opacity = 0;
                  function fade() {
                    if (opacity >= 1) {
                      cancelAnimationFrame(fade);
                      return;
                    }
                    opacity += 0.1;
                    gameWonMenuEl.style.opacity = opacity;
                    requestAnimationFrame(fade);
                  }

                  requestAnimationFrame(fade);
                }, 1000);
              }

              clearInterval(ghostDieWorkerId);
            } else {
              //dead enemy animation play
              if (checkEnemy.id !== "boss") {
                checkEnemy.src = `assets/Cropped/ghost/Dead/Dead ${ghostDieImgNo}.png`;
              } else {
                checkEnemy.src = `assets/Cropped/wizard/Death/Death ${ghostDieImgNo}.png`;
              }
            }
          }, 300);
        }
      }
    }

    if (attackAnimationIndex % attackAnimationFrameRate === 0) {
      attackImgNo++;
      if (attackImgNo === 7) {
        //end attack
        cancelAnimationFrame(attackAnimationId);
        attackAnimationId = 0;
        attackImgNo = 0;
        playerState = "idle";
        player.src = `assets/Cropped/samurai/Idle/Idle1.png`;
        attackAnimationIndex = 0;
      } else {
        player.src = `assets/Cropped/samurai/attacks/Attack${attackType} - ${attackImgNo}.png`;
      }
    }
  }

  attackAnimationId = requestAnimationFrame(playerattackAnimationChange);
}

//TAKE HIT
let takeHitAnimationId = 0;
let takeHitImgNo = 0;
let takeHitAnimationFrameRate = 10;
let takeHitAnimationIndex = 0;

function playerTakeHitAnimationChange() {
  if (playerState === "take hit") {
    takeHitAnimationIndex++;
    if (takeHitAnimationIndex % takeHitAnimationFrameRate === 0) {
      takeHitImgNo++;
      if (takeHitImgNo >= 5) {
        cancelAnimationFrame(takeHitAnimationId);
      } else {
        player.src = `assets/Cropped/samurai/take Hit/take Hit${takeHitImgNo}.png`;
      }
    }
  }

  takeHitAnimationId = requestAnimationFrame(playerTakeHitAnimationChange);
}

//START LISTENING

document.addEventListener("keydown", (e) => {
  if (playerCurrentHealth > 0) {
    if (e.key === "a") {
      attackImgNo = 0;
      playerState = "run";
      runDirection = 0;

      if (runAnimationId === 0) {
        // cancelAnimationFrame(idleAnimationId);
        playerRunAnimationChange();
      }
    } else if (e.key === "d") {
      attackImgNo = 0;
      playerState = "run";
      runDirection = 1;

      if (runAnimationId === 0) {
        // cancelAnimationFrame(idleAnimationId);
        playerRunAnimationChange();
      }
    } else if (e.key === "k") {
      if (attackImgNo === 0) {
        // cancelAnimationFrame(idleAnimationId);
        cancelAnimationFrame(runAnimationId);
        playerState = "attack";
        attackType = Math.floor(Math.random() * 2) + 1;
        playerattackAnimationChange();
      }
    } else if (e.key === "t") {
      takeHitImgNo = 0;

      if (takeHitAnimationId === 0) {
        attackImgNo = 0;
        playerState = "take hit";
        cancelAnimationFrame(runAnimationId);
        // cancelAnimationFrame(idleAnimationId);
        cancelAnimationFrame(attackAnimationId);
        playerTakeHitAnimationChange();
      }
    }
  }
});

document.addEventListener("keyup", (e) => {
  if (playerCurrentHealth > 0) {
    if (e.key === "q") {
      // cancelAnimationFrame(idleAnimationId);
      idleAnimationId = 0;
    } else if (e.key === "d") {
      playerState = "idle";
      cancelAnimationFrame(runAnimationId);
      runAnimationId = 0;
    } else if (e.key === "a") {
      playerState = "idle";
      cancelAnimationFrame(runAnimationId);
      runAnimationId = 0;
    }
  }
});

//START MOVE PLAYER
document.addEventListener("keydown", (e) => {
  if (playerCurrentHealth > 0) {
    if (e.key === "d") {
      //reset left collisions so the player is able to move if he was collided already
      leftMoveCollision = false;
      //move right
      newPlayer.moveRight = true;
    } else if (e.key === "a") {
      rightMoveCollision = false;
      //move left
      newPlayer.moveLeft = true;
    }
  }
});

//STOP MOVE
document.addEventListener("keyup", (e) => {
  if (playerCurrentHealth > 0) {
    if (e.key === "d") {
      newPlayer.moveRight = false;
    } else if (e.key === "a") {
      newPlayer.moveLeft = false;
    }
  }
});

//START JUMP
document.addEventListener("keydown", (e) => {
  if (playerCurrentHealth > 0) {
    if (e.key === "w" && newPlayer.onGround) {
      newPlayer.yVelocity = 150;
      newPlayer.xVelocity = 8;
      newPlayer.onGround = false;
    }
  }
});

document.addEventListener("keydown", (e) => {
  if (playerCurrentHealth > 0) {
    if (e.key === "d") {
      backgroundLayerMoveRight = true;
      moveUpperLayerRight = true;
    } else if (e.key === "a") {
      backgroundLayerMoveLeft = true;
      moveUpperLayerLeft = true;
    }
  }
});

document.addEventListener("keyup", (e) => {
  if (playerCurrentHealth > 0) {
    if (e.key === "d" || e.key === "a") {
      backgroundLayerMoveRight = false;
      backgroundLayerMoveLeft = false;
      moveUpperLayerRight = false;
      moveUpperLayerLeft = false;
    }
  }
});

//game restart listner
document.getElementById("end-game-restart").addEventListener("click", () => {
  //restart the game
  location.reload();
});
