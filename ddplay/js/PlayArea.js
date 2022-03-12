import SharedData from "./SharedData.js";
import {getSharedData} from "./SharedData.js";

export const BORDER =
  {
      "NONE":0,
      "LEFT":1,
      "RIGHT":2,
      "TOP":3,
      "BOTTOM":4,
      "OUTSIDE_BOTTOM":5
  };

export default class PlayArea {

    left = 0;
    right;
    top = 0;
    bottom;
    outside_bottom;

    constructor() {
      let sharedData = getSharedData();
      this.right = sharedData.gameWidth;
      this.bottom = sharedData.gameHeight;
      this.outside_bottom = this.bottom * 1.2;      
    }


    checkBorderCollision = function(gameObject)
    {
        let border = BORDER.NONE;
        if (gameObject.x - (gameObject.x_size/2) <= this.left) border = BORDER.LEFT;
        else if (gameObject.x+(gameObject.x_size/2) >= this.right) border = BORDER.RIGHT;
        else if (gameObject.y-(gameObject.y_size/2) <= this.top) border = BORDER.TOP;
        else if (gameObject.y >= this.outside_bottom) border = BORDER.OUTSIDE_BOTTOM;
        else if (gameObject.y + (gameObject.y_size/2) >= this.bottom) border = BORDER.BOTTOM;

        if (border != BORDER.NONE) gameObject.borderTouched(border);

    }

}
