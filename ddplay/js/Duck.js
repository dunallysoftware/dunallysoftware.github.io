import GameObject from "./GameObject.js";
import Constants from "./Constants.js";
import SharedData from "./SharedData.js";
import {getSharedData} from "./SharedData.js";
import GameAnimation from "./GameAnimation.js";
import ObjectAnimation from "./ObjectAnimation.js";
import Balloon from "./Balloon.js";
import CollisionCircle from "./CollisionCircle.js";
/* Duck is the object representing the duck that is moved around. */


	const X_SIZE_UNSCALED = 144;
	const Y_SIZE_UNSCALED =  135;

	const X_FLIGHT_SPEED_UNSCALED = 600/Constants.MAX_UPS;
	var X_Y_RELATIONSHIP;
	const DUCK_INTRO_STEPS=3;
	const DUCK_STEP_TIME = (2000/DUCK_INTRO_STEPS);
	var classInitialised=false;
	var animations = new Map();
	var initialX;
	var initialY;
	var duckCollisionCircles = [];

    function initialiseAnimations(duck)
    {
        let xSize = duck.sharedData.scaledSize(X_SIZE_UNSCALED);
        let ySize = duck.sharedData.scaledSize(Y_SIZE_UNSCALED);



	animations.set("default",
                new GameAnimation(xSize, ySize,
								['duck_default_0.png', 'duck_default_1.png', 'duck_default_2.png', 'duck_default_3.png'],
                        4,
                        0,
                        false));

        animations.set("left",
                new GameAnimation(xSize, ySize,
                        ['duck_bank_0.png', 'duck_bank_1.png','duck_bank_2.png'],
                        5,
                        345,
                        false));

        animations.set("right",
                new GameAnimation(xSize, ySize,
                        ['duck_bank_0.png', 'duck_bank_1.png','duck_bank_2.png'],
                        5,
                        345,
                        true));


    }



export default class Duck extends GameObject {

downs=0;

	sharedData;

    // When finger is placed on screen, where is finger relative to duck?
    fingerOffset_x;
    fingerOffset_y;


    x_flight_speed;
    y_flight_speed;

    // Variables relating to appearance of new duck
    duckReady = false;
    duckIntroCountdown;
    nextDuckIntroStep;

    defaultObjectAnimation;
    leftObjectAnimation;
    rightObjectAnimation;

    fingerIsDown = false;

    captured = false;
    duckTrapStarted = false;
    hideDuck=false;
    dead = false;
    killerBalloon;
    duckTrap;
    shield;



    // Target coordinates saved after finger up, in case we get a finger up and down so fast
    // that it must be a screen mistake.
    lastTargetX;
    lastTargetY;

    //private static final Paint paint = new Paint();

    objectAnimation;


    constructor(duckTrap) //Context context, DuckTrap duckTrap, SoundEffectPlayer soundEffectPlayer)
    {
        super(X_SIZE_UNSCALED, Y_SIZE_UNSCALED);
				this.sharedData = getSharedData();
        if (!classInitialised)
        {
            initialiseAnimations(this); //context.getResources());
         //   Paint shieldPaint = new Paint();
         //   shieldPaint.setColor(Color.YELLOW);
         //   shieldPaint.setStrokeWidth(10);
         //   shieldImage=collisionPolygon.createBitmap(shieldPaint);
            this.initialiseSizes(this);
            classInitialised=true;
        }
        //shield = new Shield(context.getResources(), this, soundEffectPlayer);
        initialX=this.sharedData.gameWidth*.5;
        initialY=this.sharedData.gameHeight*.6;
        this.setPosition(initialX, initialY);
        //setVelocityUnscaled(X_FLIGHT_SPEED_UNSCALED, X_FLIGHT_SPEED_UNSCALED *X_Y_RELATIONSHIP);
        this.x_flight_speed = this.sharedData.scaledSize(X_FLIGHT_SPEED_UNSCALED);
        this.y_flight_speed = this.x_flight_speed*X_Y_RELATIONSHIP;
        this.setVelocity(0,0);   // x_speed and y_speed are determined as we move.
        this.defaultObjectAnimation = new ObjectAnimation(animations.get("default"));
        this.leftObjectAnimation = new ObjectAnimation(animations.get("left"));
        this.rightObjectAnimation = new ObjectAnimation(animations.get("right"));
        this.objectAnimation = this.defaultObjectAnimation;
        this.objectAnimation.startAnimation(true);
        this.duckTrap = duckTrap;
    }

    draw = function(context) {
        if (this.duckReady) {
            // Don't draw the duck if the DuckTrap is painting it.
            if (this.hideDuck) return;
            //if (shield.isOn()) drawImage(canvas, shield.getImage(), paint);

            //drawImage(canvas, objectAnimation.getImage(), paint);
		this.objectAnimation.displayFrame(context, this.x, this.y, 0)

            // Uncomment to check where collision circles are
            //for (CollisionCircle collisionCircle: duckCollisionCircles) canvas.drawCircle((float) (x + collisionCircle.x_offset), (float) (y + collisionCircle.y_offset), (float) (collisionCircle.radius), paint);

        }
        else // Intro in progress, bigger duck!
        {
            let left = (this.x-(this.x_size*this.duckIntroCountdown*.5));
            let top = (this.y-(this.y_size*this.duckIntroCountdown*.5));
		this.objectAnimation.displayFrame(context, left, top, this.duckIntroCountdown);

        }
    }

    update = function() {

        // Update shield
        //shield.update();
        this.setVelocity(0,0);  // Reset, will be set again if still moving.
        // Go from Captured to Dead when balloon finished growing and lettertrap done.
        if (this.captured)
        {

            if (!this.duckTrapStarted) {
                if (this.killerBalloon) {
                    this.duckTrap.start(this.killerBalloon, this);
                    this.duckTrapStarted = true;
                    this.objectAnimation.overrideFramesPerSecond(60);
                } else {
                    // No balloon?  So straight to dead.
                    this.dead = true;
                    this.captured = false;
                }

            }
            else if (!this.hideDuck)
            {
                if (this.duckTrap.isDrawingDuck()) this.hideDuck=true;
            }
            else if (!this.duckTrap.running) {
                this.objectAnimation.resetFramesPerSecond();
                this.dead = true;
                this.captured = false;
                this.duckTrapStarted=false;
            }
        }

        // Check if we are still doing the intro for a new duck
        if (!this.duckReady) this.duckIntroCheck();

        // No movements if the duck is dead/captured or counting down
        if (this.dead || this.captured || !this.duckReady) return;

        // if targetX is not negative, there is a finger on the screen so movement is possible
        // Also check finger is down (and was lifted and dropped if new life)
        if (this.fingerIsDown && this.targetX >= 0)
        {

            let oldXPosition = this.x;
            let oldYPosition = this.y;
            // Move, also capture movement (the REAL speed, for balloon-bouncing later.)
            this.x = this.moveOnAxis(this.x, this.targetX, this.x_flight_speed);
            oldYPosition = this.y;
            this.y = this.moveOnAxis(this.y, this.targetY, this.y_flight_speed);

            // We need the velocity elsewhere
            this.setVelocity(this.x-oldXPosition, this.y-oldYPosition);

            // IF shielded, and the way is blocked, undo the movement.
            // We still record the speed (TurnMovement) because we need
            // that momentum later.
        //    if (shield.isOn())
        //    {
        //        if (!shieldAllowsXMovement(oldXPosition, targetX)) x=oldXPosition;
        //        if (!shieldAllowsYMovement(oldYPosition, targetY)) y=oldYPosition;
        //    }
        }


/*
        let newObjectAnimation;

        if (this.targetX > this.x)
        {
            this.newObjectAnimation=this.rightObjectAnimation;
        }
        else if (targetX >= 0 && targetX < x)
        {
            newObjectAnimation=leftObjectAnimation;
        }
        else newObjectAnimation=defaultObjectAnimation;
*/
let newObjectAnimation = this.defaultObjectAnimation;
        if (newObjectAnimation != this.objectAnimation)
        {
            this.objectAnimation=newObjectAnimation;
            this.objectAnimation.startAnimation(true);
        }

    }



    // When finger is placed on screen, set the position of the finger relative to the
    // duck; and initialise the target to current position.
    fingerDown = function(fingerX, fingerY) {
//alert("IN FINGERDOWN");
        this.fingerOffset_x = this.x - fingerX;
        this.fingerOffset_y = this.y - fingerY;

        this.targetX = this.x;
        this.targetY = this.y;
        this.fingerIsDown=true;
    }

    // When finger moves on the screen, move the target for the duck
    fingerMove = function(isMouse, fingerX, fingerY){
				if (isMouse && !this.fingerIsDown) this.fingerDown(fingerX, fingerY);
        if (!this.fingerIsDown) return;

        this.targetX =fingerX+ this.fingerOffset_x;
        this.targetY =fingerY+ this.fingerOffset_y;
        if (this.targetX < 0) this.targetX = 0;
        if (this.targetX > this.sharedData.gameWidth)
				{
					this.targetX = this.sharedData.gameWidth;
				}
        if (this.targetY < 0) this.targetY = 0;
        if (this.targetY > this.sharedData.gameHeight) this.targetY = this.sharedData.gameHeight;

		}

    // When finger is lifted (or life lost), reset target so we know no finger movement in progress
    fingerUp = function()
    {
        this.lastTargetX = this.targetX;
        this.lastTargetY = this.targetY;
        this.targetX =-1;
        this.targetY =-1;
        this.fingerIsDown=false;
    }

    // If a "finger up" was incorrectly registered, make it as if it didn't happen.
    cancelFingerUp = function()
    {
        targetX =lastTargetX;
        targetY =lastTargetY;
        fingerIsDown=true;
    }


    setShield = function(shielded)
    {
/*
        if (shielded)
        {
            shield.turnOn();
        }
        else {
            shield.turnOff();
        }
*/
    }


    checkBalloonCollisions = function(balloons, word)
    {

        // Only if ready.
        if (!this.duckReady) return;

        //shield.collisionPolygon.clearTouches();
        for (let b = 0; b < balloons.length;b++)
        {
						let balloon = balloons[b];
						//if (shield.isOn()) {
            //    shield.collisionPolygon.bounceBalloon(balloon);
          //  }
            //else
						if (balloon.canCollide())
            {
                let collided = false;
								for (let c=0; c<duckCollisionCircles.length;c++)
                {
									let collisionCircle = duckCollisionCircles[c];
                    if (!collided && collisionCircle.collidedWithCircle(this, balloon, balloon.getCollisionCircle()))
                        collided = true;
                }
                if (collided)
                {
                    if (!balloon.claimSpecialBalloon(word)) { // handle free life/hint cases
                        // Check selected letter returns false if we hit a condition where we shouldn't continue
                        if (!word.checkSelectedLetter(this, balloon)) return;
                    }
                }
            }
        }

    }


    // Accepts object to get scaled sizes
    initialiseSizes = function(duck)
    {

        // Need relationship of x & y sizes for fixing y speed.
        X_Y_RELATIONSHIP = duck.sharedData.gameHeight/duck.sharedData.gameWidth;

        duckCollisionCircles.push(
                new CollisionCircle(duck.sharedData.scaledSize(18), duck.sharedData.scaledSize(0), duck.sharedData.scaledSize(-25) )
        );
        duckCollisionCircles.push(
                new CollisionCircle(duck.sharedData.scaledSize(38), duck.sharedData.scaledSize(0), duck.sharedData.scaledSize(10) )
        );


    }


/*
    borderTouched = function(border)
    {
        // Doing nothing yet
    }
*/
    capture(balloon)
    {
        this.captured=true;
        this.killerBalloon=balloon;
    }

    isCapturedOrDead = function()
    {
        return this.captured || this.dead;
    }

    newDuck = function()
    {
        this.captured=false;
        this.duckTrapStarted=false;
        this.objectAnimation.resetFramesPerSecond();
        this.hideDuck=false;
        this.dead=false;
//        shield.reset();
        this.killerBalloon=null;
        this.x=initialX;
        this.y=initialY;

        // Force replacing of finger on respawn
        this.fingerUp();
        this.duckReady=false;
        this.duckIntroCountdown = DUCK_INTRO_STEPS;
        this.nextDuckIntroStep = Date.now() + DUCK_STEP_TIME;
    }

    duckIntroCheck = function()
    {
        let now = Date.now();
        if (this.nextDuckIntroStep <= now )
        {
            this.duckIntroCountdown--;
            if (this.duckIntroCountdown > 1)
            {
                this.nextDuckIntroStep = now + DUCK_STEP_TIME;
            }
            else
            {
                this.duckReady=true;
            }
        }
    }

    sendTo = function(sendToX, sendToY)
    {
        this.targetX=sendToX;
        this.targetY=sendToY;
        this.fingerIsDown=true;
    }


/*
    private boolean shieldAllowsXMovement(x, target_x)
    {
        if (x<target_x && shield.collisionPolygon.isTouchedRight()) return false;
        if (x>target_x && shield.collisionPolygon.isTouchedLeft()) return false;
        return true;
    }

    private boolean shieldAllowsYMovement(y, target_y)
    {
        if (y<target_y && shield.collisionPolygon.isTouchedDown()) return false;
        if (y>target_y && shield.collisionPolygon.isTouchedUp()) return false;
       return true;
    }
*/


}
