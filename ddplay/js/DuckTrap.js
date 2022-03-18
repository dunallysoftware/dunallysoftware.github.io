import Constants from "./Constants.js";
import GameObject from "./GameObject.js";
import SharedData from "./SharedData.js";
import {getSharedData} from "./SharedData.js";
import GameAnimation from "./GameAnimation.js";
import ObjectAnimation from "./ObjectAnimation.js";

var classInitialised=false;
const X_SIZE_UNSCALED = 197;
const Y_SIZE_UNSCALED = 197;
var animationEmpty;
var animationFull;
var imageDuckFalling;
const FALLING_DUCK_VOLUME_MULTIPLIER = 0.8;
const FALLING_DUCK_VOLUME_DELAY = 200;
const X_SPEED_UNSCALED = 1;
const Y_SPEED_UNSCALED = 1;

export default class DuckTrap extends GameObject {

    soundEffectPlayer;
    sharedData;
    objectAnimationEmpty;
    objectAnimationFull;
    displayPhase;
    running = false;
    angle;
    lastImage;
    adjustedImage;
    adjustedImageContext;
    fallingDuckVolume;
    nextFallingDuckVolumeDrop = 0;

    constructor(soundEffectPlayer)
    {
        super(X_SIZE_UNSCALED, Y_SIZE_UNSCALED, 0, 0, 0, 0);
				this.sharedData = getSharedData();
        this.soundEffectPlayer = soundEffectPlayer;
        this.setVelocityUnscaled(X_SPEED_UNSCALED, Y_SPEED_UNSCALED);
        if (!classInitialised) {
            initialiseAnimation(this.sharedData);
            classInitialised=true;
        }
        this.objectAnimationEmpty = new ObjectAnimation(animationEmpty);
        this.objectAnimationFull = new ObjectAnimation(animationFull);
    }

    draw = function(context) {
        if (this.running)
        {
            let image;
            // If running, run "empty" to end, then run "full" to end, then done.
            if (this.displayPhase == 0)
            {
                image = this.objectAnimationEmpty.getFrameImage(context);
                if (!image)
                {
                    this.displayPhase = 1;
                    this.objectAnimationFull.startAnimation(false);
                }
            }
            if (this.displayPhase == 1)
            {
                image = this.objectAnimationFull.getFrameImage(context);
                // After second type, create an animation of the cage spinning.
                // Need to create each time as could be starting from a different angle.
                if (!image)
                {
                    this.startImageEffect(this.adjustedImage, 75, .98, .2, 5);
                    this.displayPhase =2;
                    this.soundEffectPlayer.pauseSoundEffect("duck_panic");
                    // todo: doesn't sound quite right?
                    this.soundEffectPlayer.playSoundEffect("duck_long");
                    this.fallingDuckVolume = this.soundEffectPlayer.volume;
                }
            }
            if (this.displayPhase < 2)
            {
                // Adjust bitmap for angle
                if (!image)
                {
                    this.lastImage = false;
                    this.adjustedImage = false;
                }
                else if (image === this.lastImage) {
                    //bitmap = lastBitmap;
                } else {
                    this.lastImage = image;
                    if (!this.adjustedImage)
                    {
                      this.adjustedImage = document.createElement("canvas");
                      this.adjustedImageContext = this.adjustedImage.getContext("2d");
                    }
                    else {
                      {
                        this.adjustedImageContext.clearRect(0, 0, this.adjustedImage.width, this.adjustedImage.height);
                      }
                    }
                    this.adjustedImage.width = image.width;
                    this.adjustedImage.height = image.height;
                    this.adjustedImageContext.translate(image.width/2, image.height/2);
                    this.adjustedImageContext.rotate(this.angle);
                    this.adjustedImageContext.drawImage(image, -image.width/2, -image.height/2);
                    this.adjustedImageContext.rotate(-this.angle);
                    this.adjustedImageContext.translate(-image.width/2, -image.height/2);
                    //Matrix matrix = new Matrix();
                    //matrix.preRotate(angle);
                    //System.out.println("ANGLE????? "+ angle);
                    //matrix.postScale(-1, 1, x_size, y_size);
                    //adjustedBitmap = Bitmap.createBitmap(bitmap, 0, 0, x_size, y_size, matrix, false);
                }
                if (this.adjustedImage)
                context.drawImage(this.adjustedImage,
                  this.x-(this.x_size/2), this.y-(this.y_size/2), this.x_size, this.y_size);
                  //this.adjustedImage.width*.01,this.adjustedImage.height*.01,
                  //this.adjustedImage.width*.5,this.adjustedImage.height*.5,
                  //this.x, this.y,
                  //this.adjustedImage.width*.5,this.adjustedImage.height*.5);
            }
            else
            {

                // Display image with effect applied
                this.drawWithEffect(context);
            }

        }

    }


    update = function() {

        if (this.running)
        {
            this.x= this.moveOnAxis(this.x, this.targetX, this.x_speed);
            this.y= this.moveOnAxis(this.y, this.targetY, this.y_speed);

        }

        // Are we in spin phase?
        if (this.displayPhase == 2)
        {
            // Move bitmap on, and finish up if done.
            if (!this.updateEffectBitmap())
            {
                this.running=false;
                this.soundEffectPlayer.pauseSoundEffect("duck_long");
            }
            else
            {
                // Still running, reduce falling duck volume
                let now = Date.now();
                if (this.nextFallingDuckVolumeDrop <= now)
                {
                    this.fallingDuckVolume *= FALLING_DUCK_VOLUME_MULTIPLIER;
                    this.soundEffectPlayer.setEffectVolume("duck_long", this.fallingDuckVolume);
                    this.nextFallingDuckVolumeDrop = now+FALLING_DUCK_VOLUME_DELAY;
                }
            }
        }

    }

    //public void borderTouched(PlayArea.BORDER border) {
//
  //  }

    // Return true if this object is drawing the duck image, so the duck object should not.
    isDrawingDuck = function()
    {
        return (this.running && this.displayPhase >0);
    }

    start = function(balloon, duck)
    {
        this.running=true;
        this.x=balloon.x;
        this.y=balloon.y;
        //centrePositionOnObject(balloon);
        this.angle = this.angleToObject(duck);
        this.targetX =duck.x;
        this.targetY =duck.y;
        //targetObjectCentre(duck);  // move towards duck
        this.objectAnimationEmpty.startAnimation(false);
        this.displayPhase =0;
        this.soundEffectPlayer.playSoundEffect("duck_panic");
    }



    gameOver = function()
    {
        this.running=false;
        this.displayPhase=0;
        //this.soundEffectPlayer.stopLongSoundEffect(R.raw.duck_long);
        //soundEffectPlayer.stopLongSoundEffect(R.raw.duck_panic);
    }

}


function initialiseAnimation(sharedData) {
    let xSize = sharedData.scaledSize(X_SIZE_UNSCALED);
    let ySize = sharedData.scaledSize(Y_SIZE_UNSCALED);

    animationEmpty = new GameAnimation(xSize, ySize,
                ["cage_empty_0.png",
                        "cage_empty_1.png",
                        "cage_empty_2.png",
                        "cage_empty_3.png",
                        "cage_empty_4.png",
                        "cage_empty_5.png"],
                4,
                0,
                false);
        animationFull = new GameAnimation(xSize, ySize,
                ["cage_full_0.png",
                        "cage_full_1.png",
                        "cage_full_2.png",
                        "cage_full_3.png",
                        "cage_full_4.png",
                        "cage_full_5.png"],
                4,
                0,
                false);
    }
