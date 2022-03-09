import SharedData from "./SharedData.js";
import {getSharedData} from "./SharedData.js";

export default class ObjectAnimation {

    animation;
    sharedData;
    nextFrameTime = 0;
    currentFrame = 0;
    frameDuration;
    frameCount;
    loop;

    constructor(animation)
    {
	     this.sharedData = getSharedData();
       this.animation=animation;
       this.frameDuration = animation.frameDuration;
       this.frameCount = animation.frameCount;
    }


    startAnimation = function(loop)
    {
        this.nextFrameTime=Date.now()+this.frameDuration;
        this.currentFrame=0;
        this.loop=loop;
    }

    // Note, at end of frames, returns empty if we aren't to loop.
    displayFrame(context, x, y, scale)
    {
//window.alert("DP:" + x + ", " + y + "    " + scale);
      let image = this.getFrameImage(context);
      if (!image) return false;
	    let myScale=scale;
	    if (myScale==0) myScale=1;
	    let x_size = this.animation.x_size*myScale;
	    let y_size = this.animation.y_size*myScale;
	    context.drawImage(image,x-(x_size/2), y-(y_size/2), x_size, y_size);
      return true;
    }


    // Note, at end of frames, returns empty if we aren't to loop.
    getFrameImage(context)
    {

    	if (!this.sharedData.paused)
    	{
      	let now = Date.now();
        if (this.nextFrameTime <= now)
        {
          this.nextFrameTime=now+this.frameDuration;
          this.currentFrame += 1;
          if (this.currentFrame >= this.frameCount)
          {
            if (this.loop)
            {
              this.currentFrame = 0;
            }
            else
            {
              return false;
            }
          }
        }
    	}
    	return this.animation.frames[this.currentFrame];
    }


    overrideFramesPerSecond = function(framesPerSecond)
    {
        this.frameDuration = (1000.0/framesPerSecond);
    }

    resetFramesPerSecond = function()
    {
        this.frameDuration = this.animation.frameDuration;
    }

}
