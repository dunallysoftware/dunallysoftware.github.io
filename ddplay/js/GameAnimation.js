import Constants from "./Constants.js";


export default class GameAnimation {

    frameDuration;
    frames = [];
    frameCount;
    x_size;
    y_size;

    constructor(x_size, y_size, frameResources, framesPerSecond, tiltAngle, flip)
    {
//window.alert("DIR:" + Constants.IMAGE_PATH + frameResources[0]);
        // Frame duration is milliseconds
        this.frameDuration = 1000.0/framesPerSecond;

        this.frameCount = frameResources.length;
	this.x_size = x_size;
	this.y_size = y_size;
        for (let f=0; f < this.frameCount; f++)
        {
		let image = new Image();
		image.src=Constants.IMAGE_PATH + frameResources[f];
		this.frames.push(image);       
//		if (tiltAngle == 0 && !fip) {     }
//	        else
//            	{ }
        }
    }


}
