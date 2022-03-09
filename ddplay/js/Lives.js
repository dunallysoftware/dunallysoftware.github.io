import GameObject from "./GameObject.js";
import Constants from "./Constants.js";

const MAX_LIVES = 4;
const INITIAL_LIVES = 3;

const UNUSED_LIFE_IMAGE = Constants.IMAGE_PATH + "egg_alive.png";
const USED_LIFE_IMAGE = Constants.IMAGE_PATH + "egg_used.png";

var eggAliveImage;
var eggUsedImage;

const EGG_X_SIZE = 15;
const EGG_Y_SIZE = 30;


export default class Lives {

    livesLeft = 0;

    x_right_position;
    y_bottom_position;

    lifeObjects = [];


    setPosition = function(x, y)
    {
        this.x_right_position = x;
        this.y_bottom_position = y;
    }

    initialiseLives = function()  {
        // Add any missing lives; remove any extra ones that were added.
        for (let life=0; life < INITIAL_LIVES; life++)
        {
            this.addLife();
        }
        if (this.lifeObjects.length > INITIAL_LIVES) {
          this.lifeObjects = this.lifeObjects.slice(0, INITIAL_LIVES); //this.lifeObjects.subList(INITIAL_LIVES, lifeObjects.length).clear();
        }
        this.livesLeft=INITIAL_LIVES;
    }

    // Use a life; return false if none available
    useLife = function()
    {
        if (this.livesLeft > 0)
        {
            this.livesLeft--;
            this.lifeObjects[this.livesLeft].alive=false;
            return true;
        }
        else
        {
            return false;
        }
    }

    drawLives = function(context)
    {
        for (let l=0;l<this.lifeObjects.length;l++) this.lifeObjects[l].draw(context);
    }

    addLife = function(context)
    {
        // May want to add a life for the first time or reactivate a dead one.
        for (let lifeNumber=0; lifeNumber < MAX_LIVES; lifeNumber++)
        {
            if (lifeNumber < this.lifeObjects.length)
            {
                let life = this.lifeObjects[lifeNumber];
                if (!life.alive)
                {
                    life.alive=true;
                    this.livesLeft++;
                    return;
                }
            }
            else
            {
                let life = new Life();
                life.y = this.y_bottom_position-EGG_Y_SIZE;
                life.x = this.x_right_position-(EGG_X_SIZE*(lifeNumber+1));
                this.lifeObjects.push(life);
                this.livesLeft++;
                return;
            }
        }
    }

    getLivesLeft = function() { return this.livesLeft;}


}

export function initialiseImages() {

eggAliveImage = new Image();
eggAliveImage.src = UNUSED_LIFE_IMAGE;
   //eggAliveImage = Bitmap.createScaledBitmap(
  //         BitmapFactory.decodeResource(resources, UNUSED_LIFE_IMAGE),
  //         EGG_X_SIZE, EGG_Y_SIZE, false);
eggUsedImage = new Image();
eggUsedImage.src = USED_LIFE_IMAGE;
   //eggUsedImage = Bitmap.createScaledBitmap(
  //         BitmapFactory.decodeResource(resources, USED_LIFE_IMAGE),
  //         EGG_X_SIZE, EGG_Y_SIZE, false);


}


class Life extends GameObject {

    alive = true;

    constructor() {
        super(EGG_X_SIZE, EGG_Y_SIZE, 0, 0, 0, 0);
    }

    draw = function(context) {
        let eggImage;
        if (this.alive) {
            this.eggImage = eggAliveImage;
        } else {
            this.eggImage = eggUsedImage;
        }
        canvas.drawImage(eggImage, this.x, this.y, EGG_X_SIZE, EGG_Y_SIZE);
    }

    update = function() {
    }

    //public void borderTouched(PlayArea.BORDER border) {
    //}
}
