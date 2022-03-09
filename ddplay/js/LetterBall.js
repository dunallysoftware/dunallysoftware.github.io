export default class LetterBall {

	x;
	y;
	x_size;
	y_size;
	firstX;
	firstY;
	homeX;
	homeY;
	letterCount;
	ballsPerRow;
	isPlaceHolder;
	INITIAL_Y;  // Initial y position of ball
	INITIAL_Y_SPEED_UNSCALED = 10;  //GameLoop.speedToPerUpdate(300);
	MAX_INITIAL_X;
	X_SPEED_INCREMENT_REDUCER = .9;




    constructor(letter, index, letterCount)
    {
        // Need to take copy of bitmap because each object needs its own, for when we add the letter
	this.x_size=50;
	this.y_size=50;
        this.letterCount=letterCount;
        // Initialise static values that depend on screen size
        //initialiseSizes(this);
        let ballsPerRow = (200/ (this.x_size * 1.2));
        this.numberOfBallRows = (Math.ceil((letterCount*2) / ballsPerRow));

        //double x = (sharedData.gameWidth*.5)-3+(random.nextInt(6));//random.nextInt(MAX_INITIAL_X); // Get screen size in here.


//        double firstX, firstY;
/*
//        if (isPlaceHolder)
//        {
//            this.firstX=FIRST_SELECTED_X;
//            this.firstY=FIRST_SELECTED_Y;
//            this.ballsPerRow = maxBallsPerRow;
//        }
//        else
//        {
            this.ballsPerRow = letterCount;
            this.firstX = (200*.5)-(ballsPerRow*.5*x_size*1.2); //(sharedData.gameWidth*.5)-(ballsPerRow*.5*x_size*1.2);
            if (ballsPerRow%2 != 0) firstX += (x_size*.6);
            this.firstX=FIRST_X;
            this.firstY=FIRST_Y;
        }
//
 */
        this.setHomePosition(index);
        this.setPosition(this.homeX,this.homeY);


        let x_speed = 0;
        let y_speed=0;  //setVelocityUnscaled(x_speed, 0); //INITIAL_Y_SPEED_UNSCALED);
        this.letter = letter;
        //newLetterImage(letter);
    }



    setHomePosition(index)
    {

        // Get number of balls in THIS row.  Depends on
        let ballsThisRow = this.ballsPerRow;

        let numberOfBlanks = (this.ballsPerRow*this.numberOfBallRows)-(this.letterCount*2);
        let thisIndex=index;
        // If there are 3 rows, and not the same amount of balls per row,
        // make the middle row the short one, instead of the last row.
        if (this.numberOfBallRows==3 && numberOfBlanks > 0)
        {
            if (index >= (ballsPerRow*2)-numberOfBlanks) // One of the extras on the second
            {
                thisIndex+=numberOfBlanks;
            }
        }
        // Get rowNumber based on adjusted index
        let rowNumber = (thisIndex/this.ballsPerRow);

        if ((rowNumber==1 && numberOfBallRows>1)
            || (rowNumber == 0 && numberOfBallRows==1))
        {
            ballsThisRow = ballsPerRow-numberOfBlanks;
        }

        let firstX =  ((200 * .5) - (this.ballsThisRow * .5 * this.x_size * 1.2)) + (this.x_size*.2);

        if (ballsThisRow % 2 != 0)
            firstX += (this.x_size * .5);
        else
            firstX += (this.x_size *.2);

        this.homeX = this.firstX + (this.x_size*1.2)*(thisIndex%ballsThisRow);
        this.homeY = this.firstY + (this.y_size*1.2 * rowNumber);
        this.availableBallRow = (thisIndex/this.ballsPerRow);
/*
        if (!isPlaceHolder)
        {
            if (index < letterCount)
                availableBallRow=0;
            else
                availableBallRow=1;
        }
        */

    }

    setPosition(x, y) {
        this.x=x;
        this.y=y;
    }
}