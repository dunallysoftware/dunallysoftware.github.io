import GameObject from "./GameObject.js";
import Constants from "./Constants.js";
import SharedData from "./SharedData.js";
import {getSharedData} from "./SharedData.js";
import GameAnimation from "./GameAnimation.js";
import ObjectAnimation from "./ObjectAnimation.js";
import CollisionCircle from "./CollisionCircle.js";
import PlayArea from "./PlayArea.js";
import {BORDER} from "./PlayArea.js";
import Word from "./Word.js";
import Hud from "./Hud.js";

export const DIMENSION = {
        "X":1,
        "Y":2
};


const letterDefaultBitmaps = new Map();

var INITIAL_Y;  // Initial y position of balloons
const INITIAL_Y_SPEED_UNSCALED = 500/Constants.MAX_UPS; //GameLoop.speedToPerUpdate(300);
var MAX_INITIAL_X;
const MAX_INITIAL_X_SPEED_UNSCALED = 250/Constants.MAX_UPS; //5; //GameLoop.speedToPerUpdate(150.0);
var maxInitialXSpeed;
var maxCurrentXSpeed;
const X_SPEED_INITIAL_MULTIPLIER = 0.25;
const X_SPEED_INCREMENT_REDUCER = .9;
var maxXSpeedMultiplier;

const HINT_TURN_MIN = 10;
const HINT_TURN_MAX = 30;
var hintCountDown = HINT_TURN_MAX-HINT_TURN_MIN;

const spawnMilliseconds = 450; // How often should we spawn balloons?
var nextSpawn = 0;  // At what time should we spawn another?

const IMAGE_RESOURCE = Constants.IMAGE_PATH +"lettercircle.png";
const IMAGE_RESOURCE_HELP_STAR = Constants.IMAGE_PATH +"help_star.png";
const IMAGE_RESOURCE_FREE_LIFE = Constants.IMAGE_PATH +"free_life.png";

var burstAnimation;
const X_SIZE_UNSCALED = 59;
const Y_SIZE_UNSCALED = 59;

// Collision circle centred on centre of balloon
var collisionCircle;

// Values around expanding balloon when we catch a duck
var X_SIZE_MAX = 120;
var Y_SIZE_MAX = 120;
const GROWTH_PER_FRAME = 1.05;

var classInitialised=false;
// Initialise static scaled sizes/dimensions that depend on screen size.
// Accepts object to get scaled sizes
function initialiseSizes(balloon, sharedData)
{

    // Spawning values.
    INITIAL_Y = sharedData.gameHeight*.15;  // Initial y position of balloons
    maxInitialXSpeed = sharedData.scaledSize(MAX_INITIAL_X_SPEED_UNSCALED);
    maxCurrentXSpeed = maxInitialXSpeed;

    // Collision Circle
    collisionCircle = new CollisionCircle(balloon.x_size/2, 0, 0) ;

    // Values around expanding balloon when we catch a duck
    X_SIZE_MAX = sharedData.scaledSize(120);
    Y_SIZE_MAX = sharedData.scaledSize(120);

    MAX_INITIAL_X = sharedData.gameWidth-X_SIZE_MAX;
}

export default class Balloon extends GameObject {

    isFreeLife=false;
    isHint=false;

    burstObjectAnimation;
    defaultImage;

    letter;

    // Fields used in identifying whether balloon is in collision with other balloons in a given direction and dimension
    negativeDirectionBalloon;
    positiveDirectionBalloon;
    size_1d = 0;
    position_1d = 0;
    speed_1d=0;
    startOfChain;

    lives; // Only needed for "free life" balloons

    x_size_growing = this.x_size;
    y_size_growing = this.y_size;

    // Used to prevent balloon passing through a shielded duck;
    blockedLeft = false;
    blockedRight = false;
    blockedUp = false;
    blockedDown = false;



    growing = false;
    dying = false;
    dead = false;
    lost = false;  // Lost out the bottom - if letter matches the one we want, word score reduces.
    zapped = false; // WE zap balloons to make them disappear out of the game - should not interact with anything.

    birdWaiting = false;


    constructor(letter, isFreeLife, isHint)
    {
        // Need to take copy of bitmap because each object needs its own, for when we add the letter
        super(X_SIZE_UNSCALED, Y_SIZE_UNSCALED, 0, 0, 0, 0); // No-argument constructor because we cannot calculate x position before calling super constructor
        this.sharedData = getSharedData();
        // Initialise static values that depend on screen size
        initialiseSizes(this, this.sharedData);
        if (!classInitialised)
        {
          initialiseImages(this.sharedData);
          classInitialised=true;
        }

        let x = Math.random()*MAX_INITIAL_X; // Get screen size in here.
        this.setPosition(x, INITIAL_Y);
        let x_speed = (Math.random()*(maxCurrentXSpeed*2))-maxCurrentXSpeed;
        this.setVelocityUnscaled(x_speed, INITIAL_Y_SPEED_UNSCALED);
        this.isFreeLife=isFreeLife;
        this.isHint=isHint;
        if (!isFreeLife && !isHint)
        {
          this.letter = letter;
        }
        this.newLetterImage(letter);
    }

    newLetterImage = function( letter)
    {
      if (this.isFreeLife)
      {
        this.defaultImage = new Image();
        this.defaultImage.src=IMAGE_RESOURCE_FREE_LIFE;
      }
      else if (this.isHint)
      {
        this.defaultImage = new Image();
        this.defaultImage.src=IMAGE_RESOURCE_HELP_STAR;
      }
      else {
        if (letter in letterDefaultBitmaps)
        {
            defaultImage=letterDefaultBitmaps.get(letter);
        }
        else
        {
            let image = new Image();
            image.src=IMAGE_RESOURCE;
            var thisBalloon = this;
            image.onload = function() {
            thisBalloon.defaultImage = document.createElement('canvas');
            thisBalloon.defaultImage.height = image.height;
            thisBalloon.defaultImage.width = image.width;
        		let imgContext = thisBalloon.defaultImage.getContext("2d");
        		imgContext.drawImage(image, 0,0);
        		imgContext.font="100px Arial";
            imgContext.fillStyle="#DDDD00";
        		imgContext.fillText(letter,25,70);

            letterDefaultBitmaps.set(letter, thisBalloon.defaultImage);
};
        }
      }
    }

    draw = function(context) {
        // If dying, do "burst" animation once; when it ends we die.  Only real balloons should get dying status
        //if (this.dead) window.alert("GONE");
if (!this.defaultImage)
{
  //window.alert("FAIL? " +  "  " + this.isFreeLife + "  " + this.isHint);
  return;
}
        if (this.dying)
        {
            if (!this.burstObjectAnimation.displayFrame(context, this.x, this.y, 0))
            {
                this.dying=false;
                this.dead=true;
            }
        }
        else {
          let xDisplaySize=this.x_size;
          let yDisplaySize=this.y_size;
            if (this.growing)
            {
                if (this.x_size_growing < X_SIZE_MAX) {
                    this.x_size_growing *= GROWTH_PER_FRAME;
                    this.y_size_growing *= GROWTH_PER_FRAME;
                    xDisplaySize = this.x_size_growing;
                    yDisplaySize = this.y_size_growing;
                }
                else
                {
                    this.growing = false;
                }
            }
try {
            context.drawImage(
              this.defaultImage,
              this.x-(xDisplaySize/2),
              this.y-(yDisplaySize/2),
              xDisplaySize, yDisplaySize);

} catch(e) {window.alert("ERR: " + this.dying + "  " + this.dead + " " + this.zapped + " " + this.lost + " " + this.isFreeLife + "  " +  this.isHint + " " + this.x + ", " + this.y);
console.log(e);}
        }
    }

    update = function() {


        // If blocked by shielded duck, don't move.
        //System.out.println("BALLLL: "+ x + ", " + y);
        //System.out.println("LETTER: " + letter + " : " + blockedLeft + "  " + blockedRight + "  " + x + " : " + y + "  "+ x_speed);
        if (!((this.blockedLeft && this.x_speed<0) ||
          (this.blockedRight && this.x_speed>0))) {
            this.x += this.x_speed;
        }
        if (!((this.blockedUp && this.y_speed<0)||
          (this.blockedDown && this.y_speed >0 ))) {
            this.y += this.y_speed;
        }

        this.clearBlocks();
    }

    getCollisionCircle = function() { return collisionCircle;}


    borderTouched = function(border)
    {
        if (border == BORDER.LEFT || border == BORDER.RIGHT)
        {
            this.x_speed *= -1;
            if (border == BORDER.LEFT) this.blockLeft();
                else this.blockRight();
        }
        else if (border == BORDER.TOP)
        {
            this.y_speed *= -1;
            this.blockUp();
        }
        else if (border == BORDER.OUTSIDE_BOTTOM)
        {
         //   y_speed *= -1;
            this.dead = true;
            if (!this.zapped) this.lost=true;  // Don't want to register as lost, might update letterscore in next life.
        }
    }


    blockLeft = function() { this.blockedLeft = true;   }

    blockRight = function() { this.blockedRight = true;  }

    blockUp = function() { this.blockedUp = true; }

    blockDown = function() { this.blockedDown = true; }


    clearBlocks = function()
    {
        this.blockedUp=false;
        this.blockedDown=false;
        this.blockedLeft=false;
        this.blockedRight=false;
    }

    canCollide = function() {
      return !this.dead && !this.dying && !this.growing
            && !this.zapped;
          }

    collidedWithOtherBalloon = function(balloon1)
    {
        if (!this.canCollide() || !balloon1.canCollide()) return false;
        return collisionCircle.collidedWithCircle(this, balloon1, collisionCircle);
    }



/*
    public void bounceBalloon(Balloon balloon1)
    PUT IN FROM JAVA AGAIN IF NEEDED.
*/
    letterMatches = function(letter)
    {
        return this.letter==letter;
    }

    gotLetter = function()
    {
        this.birdWaiting=true;
        this.burst();
    }

    burst = function()
    {
        this.dying=true;
        this.burstObjectAnimation = new ObjectAnimation(burstAnimation);
        this.burstObjectAnimation.startAnimation(false);
    }

    claimSpecialBalloon = function(word)
    {

      if (this.isHint)
      {
        word.giveHint(true);
        this.dead=true;
        return true;
      }
      else if (this.isFreeLife)
      {
        this.lives.addLife();
        this.dead=true;
        return true;
      }
      else return false;
    }


    caughtDuck(duck)
    {
        this.growing=true;

        // Move balloon away from duck.
        let new_x_speedUnscaled = Math.floor((Math.random()*4)+2);
        let new_y_speedUnscaled = Math.floor((Math.random()*4)+2);
        if (duck.x > this.x) new_x_speedUnscaled *= -1;
        if (duck.y > this.y) new_y_speedUnscaled *= -1;
        this.setVelocityUnscaled(new_x_speedUnscaled,
          new_y_speedUnscaled);
    }

}

// "STATIC" FUNCTIONS

export function checkSpawn()
{
    let currentTime = Date.now();
    if (nextSpawn == 0) {
      nextSpawn = currentTime + spawnMilliseconds;
      return false;
    }
    else if (nextSpawn < currentTime)
    {
        nextSpawn = currentTime + spawnMilliseconds;
        return true;
    }
    return false;
}

export function hintBalloonDue()
{
    if (--hintCountDown <= 0)
    {
        hintCountDown =
        Math.floor((Math.random()*(HINT_TURN_MAX-HINT_TURN_MIN+1))+HINT_TURN_MIN);
        return true;
    }
    return false;
}

export function spawn(word, hud)
{
  if (word.wordDB.words.length == 0) return;

  if (hintBalloonDue())
      return new Balloon("*", false, true);
  else if (hud.isFreeLifeDue()) {
      let lifeBalloon = new Balloon(true, false);
      lifeBalloon.lives = hud.lives;
      return lifeBalloon;
  }
    else return new Balloon(word.getRandomSpanishLetter(), false, false);
}

export function delaySpawn(delayTime)
{
  nextSpawn = Date.now() + delayTime;
}

function initialiseImages(sharedData)
{
  let xSize = sharedData.scaledSize(X_SIZE_UNSCALED);
  let ySize = sharedData.scaledSize(Y_SIZE_UNSCALED);

  // Balloon bursting animation
  burstAnimation = new GameAnimation(xSize, ySize,
                ['lettercircle.png',
                        'lettercircle.png',
                        'lettercircle.png',
                        'balloon_burst_0.png',
                        'balloon_burst_1.png',
                        'balloon_burst_2.png',
                        'balloon_burst_3.png',
                        'balloon_burst_4.png',
                        'balloon_burst_5.png'], 5, 0, false);
    }



    // Make old balloons drop out
    export function zapOldBalloons(balloons)
    {
        for (let b=0; b<balloons.length;b++)
        {
            balloons[b].y_speed = 20;
            balloons[b].zapped=true;
        }
    }


    // Initialise max x speed on spawning at start of game.
    export function resetXSpeedRange()
    {
        maxCurrentXSpeed = maxInitialXSpeed;
        maxXSpeedMultiplier = X_SPEED_INITIAL_MULTIPLIER;
    }

    export function increaseDifficulty()
    {
        maxCurrentXSpeed += (maxCurrentXSpeed*maxXSpeedMultiplier);
        maxXSpeedMultiplier *= X_SPEED_INCREMENT_REDUCER;
    }

    // todo: Can still see some overlaps happening.
    export function checkCollisionsInDimension(dimension, balloons)
    {
        let found = false;
        // Clear existing collisions, and set dimensions to X or Y
        for (let b=0;b<balloons.length;b++)
        {
            let balloon = balloons[b];
            balloon.negativeDirectionBalloon=null;
            balloon.positiveDirectionBalloon=null;
            balloon.startOfChain=null;
            if (dimension == DIMENSION.X) {
                balloon.size_1d = balloon.x_size;
                balloon.position_1d = balloon.x;
                balloon.speed_1d = balloon.x_speed;
            }
            else {
                balloon.size_1d = balloon.y_size;
                balloon.position_1d = balloon.y;
                balloon.speed_1d = balloon.y_speed;
            }
        }
        for (let idx = 0; idx < balloons.length; idx++)
        {
            let b1 = balloons[idx];

            for (let idx1=idx+1; idx1 < balloons.length; idx1++)
            {
                let b2 = balloons[idx1];
                if (b1.collidedWithOtherBalloon(b2)) {
                    //System.out.println("COLLIDE: " + dimension + "  " + b1.letter + " " + b2.letter);
                    if (b1.position_1d < b2.position_1d && b1.position_1d + b1.size_1d >= b2.position_1d) {
                        b1.positiveDirectionBalloon = b2;
                        b2.negativeDirectionBalloon = b1;
                        found = true;
                        if (b1.startOfChain == null) {
                            propogateNewStartOfChain(b1, b1);
                        } else {
                            propogateNewStartOfChain(b2, b1.startOfChain);
                        }
                    } else if (b2.position_1d < b1.position_1d && b2.position_1d + b2.size_1d >= b1.position_1d) {
                        b2.positiveDirectionBalloon = b1;
                        b1.negativeDirectionBalloon = b2;
                        found = true;
                        if (b2.startOfChain == null) {
                            propogateNewStartOfChain(b2, b2);
                        } else {
                            propogateNewStartOfChain(b1, b2.startOfChain);
                        }
                    }
                }
            }
        }
        // Stop now if we didn't find any collisions
        if (!found) return;

        // Get each start of chain
        for (let b=0;b<balloons.length;b++)
        {
            let balloon = balloons[b];
            if (balloon.startOfChain == balloon)
            {
                bounceChainOfCollisions(dimension, balloon);
            }
        }
    }

    export function propogateNewStartOfChain(balloon, startOfChain)
        {
            let balloon1 = balloon;
            while (balloon1)
            {
                balloon1.startOfChain = startOfChain;
                balloon1 = balloon1.positiveDirectionBalloon;
            }
        }


    export function bounceChainOfCollisions(dimension, startOfChain)
    {
    // Go forward, then back, until no swaps
        let direction = 1;
        let thisBalloon = startOfChain;
        while (true)
        {
          let swaps = false;
          let nextBalloon;
          if (direction > 0)
          {
            nextBalloon = thisBalloon.positiveDirectionBalloon;
          }
          else
          {
              nextBalloon = thisBalloon.negativeDirectionBalloon;
          }
          while (nextBalloon != null)
          {
              if ((direction > 0 && thisBalloon.speed_1d > nextBalloon.speed_1d)
                  ||(direction < 0 && thisBalloon.speed_1d < nextBalloon.speed_1d))
              {
                  let speedA = nextBalloon.speed_1d;
                  nextBalloon.speed_1d = thisBalloon.speed_1d;
                  thisBalloon.speed_1d = speedA;
                  swaps=true;
              }
                  thisBalloon=nextBalloon;
                  if (direction > 0)
                  {
                      nextBalloon = thisBalloon.positiveDirectionBalloon;
                  }
                  else
                  {
                      nextBalloon = thisBalloon.negativeDirectionBalloon;
                  }
              }
              if (!swaps) break;
              direction *= -1;
          }
          // Update speeds for dimension
          thisBalloon = startOfChain;
          while (thisBalloon)
          {
              if (dimension == DIMENSION.X)
              {
                  thisBalloon.x_speed = thisBalloon.speed_1d;
              }
              else
              {
                  thisBalloon.y_speed = thisBalloon.speed_1d;
              }
              thisBalloon = thisBalloon.positiveDirectionBalloon;
          }


      }
