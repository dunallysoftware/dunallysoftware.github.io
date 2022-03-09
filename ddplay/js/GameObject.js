import SharedData from "./SharedData.js";
import {getSharedData} from "./SharedData.js";

export default class GameObject {

	x=0;
	y=0;


    // Speed of movement (in pixels)
    x_speed=0;
    y_speed=0;

    // Size (in pixels)
    x_size=0;
    y_size=0;

    // Target for movement; -1 = do not move
    targetX = -1;
    targetY = -1;

	sharedData;

    // Variables for applying an effect on the bitmap image over time (change of angle or of size)
    displayImage;
		displayCanvas;
		displayContext;
    effectTimeGap;  // Number of milliseconds between each change in size or scale.
    nextEffectTurnTime;  // When to update the image again.
    scaleMultiplier;  // A value that the size is multiplied by each time.  Zero means no size change
    currentScale;  // Scale we have reached.
    //currentWidth;  // Actual width of displayImage - allow for the fact that it may be a tilted square!
    //currentHeight;   // Actual height of displayImage etc
    targetScale;  // Min or max scale, after which effect is over
    tiltIncrement; // Number of additional degrees to tilt the image by each time.  Zero means no angle change.
    currentTilt;  // Cumulative tilt.



    constructor(x_size_unscaled, y_size_unscaled, x_speed_unscaled, y_speed_unscaled, x, y)
    {
        this.sharedData = getSharedData();
        this.x_size=this.sharedData.scaledSize(x_size_unscaled);
        this.y_size=this.sharedData.scaledSize(y_size_unscaled);
        this.x_speed=this.sharedData.scaledSize(x_speed_unscaled);
        this.y_speed=this.sharedData.scaledSize(y_speed_unscaled);
        this.x=x;
        this.y=y;
    }


    drawImage = function(context, bitmap)    {
        context.drawImage(bitmap, (this.x-(bitmap.width/2)), (this.y-(bitmap.height/2)));
    }




    setPosition = function(x, y) {
        this.x=x;
        this.y=y;
    }

    setVelocity = function(x_speed, y_speed)
    {
        this.x_speed=x_speed;
        this.y_speed=y_speed;
    }

    setVelocityUnscaled = function(x_speed_unscaled, y_speed_unscaled)
    {
        this.x_speed=this.sharedData.scaledSize(x_speed_unscaled);
        this.y_speed=this.sharedData.scaledSize(y_speed_unscaled);
    }

    // Move the object towards the target position on the x or y axis
    moveOnAxis = function(position, target, speed)
    {

        // Get the difference between current and target position, and if
        // necessary move by "speed".  Use min/max checks to avoid moving past target
        let difference = target-position;
        let newPosition = position;
        if (difference > 0)
        {
            newPosition+=Math.min(speed, difference);
        }
        else if (difference < 0)
        {
            newPosition+=Math.max(-speed, difference);
        }
        return newPosition;
    }

    angleToObject = function(object)
    {

        /*
        let ownCentreX = this.x + (this.x_size/2);
        let ownCentreY = this.y + (this.y_size/2);
        let objectCentreX = object1.x + (object.x_size/2);
        let objectCentreY = object1.y + (object.y_size/2);
*/


        let vx = object.x - this.x; // objectCentreX - ownCentreX;
        let vy = object.y - this.y; //objectCentreY - ownCentreY;

        let angle =this.radiansToDegrees(Math.atan2(vx, vy));
        if (angle < 0) angle += 360;
        return angle;

    }

		radiansToDegrees = function(radians)
		{
			return radians*(180/Math.PI);
		}

    /*
    // Position this object so it's centre matches the centre of another.
    centrePositionOnObject = function(object)
    {
        this.x = object.x + (object.x_size/2) - (this.x_size/2);
        this.y = object.y + (object.y_size/2) - (this.y_size/2);
    }

     */
/*
    // For movement, give this object a target such that it should end up centred on another.
    targetObjectCentre = function(object)
    {
        this.targetX = object.x + (object.x_size/2) - (this.x_size/2);
        this.targetY = object.y + (object.y_size/2) - (this.y_size/2);
    }*/

    // Start an effect (change in size, angle or both)
    startImageEffect = function(image, effectTimeGap, scaleMultiplier, targetScale, tiltIncrement)
    {
        this.displayImage = image;
				this.displayCanvas = document.createElement("canvas");
				this.displayCanvas.height = image.height*2;
				this.displayCanvas.width = image.width*2;
				this.displayContext = this.displayCanvas.getContext("2d");
				this.displayContext.drawImage(image, 0, 0);
        this.effectTimeGap = effectTimeGap;
        this.scaleMultiplier = scaleMultiplier;
        this.targetScale = targetScale;
        this.tiltIncrement = tiltIncrement;
//        this.currentWidth = displayImage.width;
//        this.currentHeight = displayImage.height;
        this.nextEffectTurnTime = Date.now() + effectTimeGap;
        this.currentScale=1;
        this.currentTilt=0;
    }

    // Update effect bitmap if needed.  Return false if effect is over.
    updateEffectBitmap = function()
    {
        let now = Date.now();
        if (now > this.nextEffectTurnTime)
        {
            // Scale multiplier?
            if (this.scaleMultiplier != 0) {
                this.currentScale *= this.scaleMultiplier;
                // Did we hit target?
                if (this.scaleMultiplier > 1 && this.currentScale >= this.targetScale) return false;
                if (this.scaleMultiplier < 1 && this.currentScale <= this.targetScale) return false;
            }
            // Tilt?
            if (this.tiltIncrement != 0)
            {
                this.currentTilt += this.tiltIncrement;
                if (this.currentTilt >= 360) this.currentTilt -= 360;
								this.displayContext.clearRect(0, 0, this.displayCanvas.width, this.displayCanvas.height);
								this.displayContext.translate(this.displayCanvas.width/2, this.displayCanvas.height/2);
                this.displayContext.rotate(this.currentTilt);
								this.displayContext.drawImage(this.displayImage, -this.displayCanvas.width/2, -this.displayCanvas.height/2);
								this.displayContext.rotate(-this.currentTilt);
								this.displayContext.translate(0,0);
            }

            // Actual bitmap sizes, may vary due to width OR height!
            //this.currentWidth = displayBitmap.getWidth();
            //this.currentHeight = displayBitmap.getHeight();

            // Apply.
            //displayBitmap = Bitmap.createBitmap(inputBitmap, 0, 0, x_size, y_size, matrix, false);
        }

        return true;
    }

    // Draw bitmap with effect, adjusting position to centre if needed.
    drawWithEffect = function(context)
    {

        let xOut = this.x;
        let yOut = this.y;
				let currentWidth = this.x_size*this.currentScale;
				let currentHeight = this.y_size*this.currentScale;
        if (this.scaleMultiplier != 0)
        {
            //xOut = this.x + (this.x_size/2) - (currentWidth/2);
            //yOut = this.y + (this.y_size/2) - (currentHeight/2);
						xOut = this.x  - (currentWidth/2);
            yOut = this.y  - (currentHeight/2);
        }
				context.drawImage(this.displayCanvas,
					xOut, yOut, currentWidth, currentHeight);
    }
}
