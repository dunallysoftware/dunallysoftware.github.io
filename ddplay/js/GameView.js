import SharedData from "./SharedData.js";
import Constants from "./Constants.js";
import Duck from "./Duck.js";
import LetterBall from "./LetterBall.js";
import {getSharedData} from "./SharedData.js";
import Balloon from "./Balloon.js";
import * as BalloonNS from "./Balloon.js";
import Word from "./Word.js";
import WordDB from "./WordDB.js";
import DuckTrap from "./DuckTrap.js";
import PlayArea from "./PlayArea.js";
import Lives from "./Lives.js";
import {initialiseImages} from "./Lives.js";
import HUD from "./Hud.js";
import SoundEffectPlayer from "./SoundEffectPlayer.js";
import {doPlay} from "./game.js";

const SPAWN_PAUSE=2000;

export const BUTTON_PRESSED = {
        "OPTIONS":1,
        "RESUME":2 ,
        "START":3,
        //DONE,
        "QUIT":4,
        "DEMO":5,
        "EXIT":6
    };


const UPS_PERIOD = 1000.0/Constants.MAX_UPS;
var lastUpdated = 0;
var counter=0;
//    private double averageUPS;
//    private double averageFPS;
//    private double averageFPSSum;
//    private int averageFPSCount;


export default class GameView  {

    sharedData;


    //private final TextToSpeechHandler tts;
    gamePreferences;
    soundEffectPlayer;
    hud;
    //private final Background background;
    duck;
    //private final TouchHandler touchHandler;
    duckTrap;
    lives;
    //private final ScreenCaller thisCaller = this;

    newGameCountingDown=false;

    word;
    wordDB = new WordDB();
    playArea;

    balloons = [];
    weeBirds = [];
    weeBirdsLive = [];
    nextWeeBirdIndex = 0;

    allowSpawn=true;
    gameOn=false;
    loopStopping;
    loopRunning=false;
    firstTime=false;

// Do not think we need this?
    buttonHandler = function(buttonPressed) {
        switch(buttonPressed)
        {
          case BUTTON_PRESSED.RESUME:
          {
            this.startGame();
            return;
          }
          /*case BUTTON_PRESSED.OPTIONS:
          {
            buttonsLayout.setButtonsForGameStatus(GAME_STATUS.OPTIONS_SHOWN);
                        gamePreferences.showOptionsScreen(thisCaller);
                        return;
                    }  */
          case BUTTON_PRESSED.QUIT:
          {
            this.gameOver();
            return;
          }
          /*          case DEMO:
                    {
                        startDemo();
                        return;
                    }*/
          case BUTTON_PRESSED.START:
          {
            this.newGame();
          }
        };
      }

/*
    // Listener for "no" answer on Amazon "download Spanish locale" dialog - disable speech and do new game again.
    public OnClickListener noDownloadLocaleTTSlistener = new OnClickListener() {
        @Override
        public void onClick(View v) {
            Object dialog = v.getTag();
            if (dialog instanceof Dialog)
            {
                ((Dialog) dialog).dismiss();
            }
            SharedPreferences.Editor editor = gamePreferences.getEditor();
            editor.putBoolean(activity.getString(R.string.preferences_speak_spanish), false);
            editor.commit();
            newGame();
        }
    };


    static {
        scorePaint.setTextSize(40);
        scorePaint.setColor(Color.YELLOW);
    }
*/
    constructor(gamePreferences)
    {
      //super(context);

      this.sharedData=getSharedData();
      this.gamePreferences = gamePreferences;
      let gameCanvas = document.getElementById("gameCanvas");
//alert("W,H:" + gameCanvas.width + ", " +  gameCanvas.height
// + " :a " + screen.width + ", " + screen.height
//+ " :b " + gameCanvas.getBoundingClientRect().width + ", " + gameCanvas.getBoundingClientRect().height
//+ " :c " + gameCanvas.scrollWidth + ", " + gameCanvas.scrollHeight);

    let boundingClientRect = gameCanvas.getBoundingClientRect();
    this.sharedData.gameWidth = boundingClientRect.width;
    this.sharedData.gameHeight = boundingClientRect.height;
    this.sharedData.gameLeft = boundingClientRect.left;
    this.sharedData.gameRight = boundingClientRect.right;
    if (!this.playArea) this.playArea = new PlayArea();

    //if (this.sharedData.gameWidth > screen.width)
  //  {
    //  this.sharedData.gameWidth = gameCanvas.width;
    //  this.sharedData.gameHeight = gameCanvas.height;
    //}
    gameCanvas.width=this.sharedData.gameWidth;
    gameCanvas.height=this.sharedData.gameHeight;
//gameCanvas.width=screen.width;
//gameCanvas.height=screen.height;
//this.sharedData.gameWidth=gameCanvas.width; //creen.width; //300;
//this.sharedData.gameHeight=gameCanvas.height; //creen.height*.85;//600;
//alert("W,H:" + this.sharedData.gameWidth + ", " +  this.sharedData.gameHeight);

      //this.gamePreferences = new GamePreferences(context, sharedPreferences);
/*
      // If there is no high score preference, then we never played before, so do demo.
      if (gamePreferences.getInt(R.string.preferences_high_score, -1) < 0)
        {
            firstTime=true;
        }
*/
        // Initialise sound effects
      this.soundEffectPlayer = new SoundEffectPlayer(this.gamePreferences);
        // Initialise text to speech
      // tts = new TextToSpeechHandler(activity, gamePreferences);

        // Load class static variables that need context/resources
      initialiseImages();

      // Create the GameLoop object
      //gameLoop = new GameLoop(this, surfaceHolder);


      // Initialise
      this.lives = new Lives();


      // Populate the Words database, initialise first word
      //this.word = new Word(this.wordDB);

        // Create the heads-up display
      //hud = new HUD(context, gamePreferences, lives, word);


        // Initialise background
      //background = new Background(context, gamePreferences);

        // Make wee birds - preload them to avoid latency.
        /*
        for (int w=0; w<10;w++)
        {
            weeBirds.add(new WeeBird(context));
        }
*/
        // Make the Duck
        this.duckTrap = new DuckTrap(this.soundEffectPlayer);
    		this.duck = new Duck(this.duckTrap);

        // Register touches.
        this.registerTouches(this.duck, this.word);
        this.registerButtons();

        let thisGameView=this;
        document.addEventListener(
        	"visibilitychange",
            function(evt)
            {
              if (thisGameView.gameOn && !thisGameView.paused)
              {
                thisGameView.pauseGame();
              }
            }
            ,false);


        // Make the touch handler
//        touchHandler = new TouchHandler(this, gamePreferences, hud, duck, word);
        this.chooseButtons();
    }

    // Initialisations that should happen in background after initial screen is displayed.
//    public void finalSetup()
    //{
    //    tts.setupTextToSpeech2("es", "ES");
    //}

    //public void cleanup()
    //{
    //    soundEffectPlayer.cleanup();
    //    tts.fullShutDown();
    //}

    //public void returnedControl(Class screenClass)
    /*
    public void returnedControl()
    {
        // Only caller is preferences for now, so no need to check class.
        if (gameOn || newGameCountingDown) {
            buttonsLayout.setButtonsForGameStatus(GAME_STATUS.PAUSED);
        }
        else
        {
            buttonsLayout.setButtonsForGameStatus(GAME_STATUS.NOT_STARTED);
            buttonsLayout.startWordDisplay(word.getUsedWords());
        }
    }
*/

    checkSpeechRequired = function()
    {
      if (this.word && this.word.waitingToSpeak) this.word.speakSpanishWord();
    }

    newGame = function()
    {

        // Don't want to build Word in constructor,
        // need to give wordDB time to initialise.
        //if (!this.soundEffectPlayer) this.soundEffectPlayer = new SoundEffectPlayer(this.gamePreferences);
        if (!this.word) this.word = new Word(this.wordDB, this.gamePreferences, this.soundEffectPlayer);
        if (!this.hud) this.hud = new HUD(this.lives, this.word);



        //if (gamePreferences.getBoolean(R.string.preferences_speak_spanish, true) && !tts.localeDownloadCheck(noDownloadLocaleTTSlistener))
        //{
        //    // If we need to do the "download voice" dialog, hide the buttons and skip the rest.
        //    buttonsLayout.setButtonsForGameStatus(GAME_STATUS.HIDE_ALL);
        //    return;
        //}


        this.newGameCountingDown = true;
        //hud.showMessages(
        //            new int[]{R.string.message_get_ready, R.string.message_get_ready, R.string.message_get_ready},
        //            new int[]{R.color.white, R.color.red, R.color.black},
        //
        this.lives.initialiseLives();
        //soundEffectPlayer.clearSuspended();
        this.duck.newDuck();
        this.lives.useLife();
        BalloonNS.delaySpawn(SPAWN_PAUSE);
        this.allowSpawn = true;
        this.hud.clearScore();
        this.word.newGame();
        BalloonNS.resetXSpeedRange();
        // Clear old balloons
        //Balloon.zapOldBalloons(balloons);
        this.balloons = [];


        //this.tempCircleWord(this.balloons);
        //weeBirdsLive.clear();

        this.startGame();


    }

    newGameStart = function()
    {
        this.newGameCountingDown=false;
        this.word.newWord(true); // Reset the word if there already is one
        this.gameOn=true;
        this.hud.gameOn=true;
        this.chooseButtons();
    }

    gameOver = function()
    {
        this.gameOn=false;
        this.hud.gameOn = false;
        //gameLoop.stopLoop();
        this.loopStopping=5;  // Catch the fact that loop is stopping - allow final time for drawing.
        //if (!demoMode)
        this.hud.checkHighScore();
        //    else hud.restoreHighScore();
        this.duckTrap.gameOver();
        // Must request the button update on the UI thread, not the game thread, because it was created on UI thread.
        //this.post(() -> buttonsLayout.setButtonsForGameStatus(GAME_STATUS.NOT_STARTED));
        //if (!demoMode) this.post(() -> buttonsLayout.endOfGame(word.getUsedWords()));
        this.soundEffectPlayer.pauseAll(false);
    }

    draw = function(canvas, context) {

        context.clearRect(0, 0, canvas.width, canvas.height);
        // If game loop stopping, it can stop after this.
        //if (loopStopping > 0) loopStopping = 0;

        //background.draw(canvas);


        this.duck.draw(context);


        // Draw wee birds before balloons because we want them to be underneath
        //for (WeeBird weeBird : weeBirdsLive)
        //{
        //    weeBird.draw(canvas);
        //}

        // Want cage to appear under balloon it belongs to.
        this.duckTrap.draw(context);

        for (let b=0; b < this.balloons.length; b++)
        {
            this.balloons[b].draw(context);
        }

        this.hud.draw(context);
    }

/*
    public boolean onTouchEvent(MotionEvent event) {

        boolean touchResult;

        // Bypass screen controls in demo mode.
        if (demoMode)
        {
            touchResult = demoController.handleTouchEvent(touchHandler, event);
        }
        else {
            touchResult = touchHandler.handleTouchEvent(event);
        }
        if (touchResult)
        {
            return true;
        }
        else
        {
            return super.onTouchEvent(event);
        }
    }
*/


    //public GamePreferences.OptionsLayout getOptionsLayout() {return  gamePreferences.getLayout();}

    pauseGame = function()
    {
        this.soundEffectPlayer.pauseAll(true);
        //tiltControl.unRegister();

        this.sharedData.paused=true;
        //buttonsLayout.setButtonsForGameStatus(GAME_STATUS.PAUSED);
        //this.showOptions();
        this.duck.fingerIsDown=false;
        this.chooseButtons();
    }

    startGame = function()
    {
        //mainActivity.hideFlashScreen();
        //buttonsLayout.setButtonsForGameStatus(GAME_STATUS.RUNNING);
        if (!this.soundEffectPlayer.soundEffectIsPaused("music")) this.soundEffectPlayer.playSoundEffect("music");
        //soundEffectPlayer.startLongSoundEffect(R.raw.tritsch_tratsch_polka);
        this.soundEffectPlayer.resumeAll();
        //if (!gameLoop.isAlive())
        //{
        //    gameLoop = new GameLoop(this, getHolder());
        //}
        //if (surfaceReady) {
        //    gameLoop.startLoop();
        //}
        //else
        //{
        //    awaitingSurface=true;
        //}
        this.sharedData.paused=false;
        this.loopStopping=-1;
        this.loopRunning=true;
        this.stopLoop=false;
        this.chooseButtons();
        //this.runLoop()
    }

    runLoop = function()
    {
      let now = Date.now();
      let wait = now-lastUpdated;
      if (wait >= UPS_PERIOD)
      {
      	  counter++;
      		lastUpdated=now;
      		let canvas = document.getElementById("gameCanvas");
      		let context = canvas.getContext("2d");

          this.draw(canvas, context);
          this.update();
      	}
    }

/*
    public void drawUPS(Canvas canvas) {
        String averageUPS = Double.toString(gameLoop.getAverageUPS());
        int color = ContextCompat.getColor(getContext(), R.color.teal_200);
        Paint paint = new Paint();
        paint.setColor(color);
        paint.setTextSize(40);
        canvas.drawText("UPS: " + averageUPS, 100, 120, paint);
    }

    public void drawFPS(Canvas canvas) {
        String averageFPS = Double.toString(gameLoop.getAverageFPS());
        int color = ContextCompat.getColor(getContext(), R.color.teal_200);
        Paint paint = new Paint();
        paint.setColor(color);
        paint.setTextSize(40);
        canvas.drawText("FPS: " + averageFPS + "  " + gameLoop.getAverageAverageFPS(), 100, 150, paint);
    }
*/
    update = function() {
        // Handle stop in progress
        if (this.loopStopping >= 0)
        {
            this.loopStopping--;
            if (this.loopStopping == -1)
            {
                this.loopRunning=false;
                this.chooseButtons();
                //this.gameLoop.stopLoop();
            }
            return;
        }

        if (this.sharedData.paused) return;
        if (this.newGameCountingDown)
        {
            //background.update();
            //if (!hud.showMessage)
            //{
                this.newGameCountingDown=false;
                this.newGameStart();
            //}
            return;
        }

        //background.update();
        this.duck.update();

        if (!this.duck.isCapturedOrDead()) {
            this.duck.checkBalloonCollisions(this.balloons, this.word);
        }
        if (this.duck.isCaptured && this.allowSpawn)
        {
            this.allowSpawn=false;
        }

        if (this.duck.dead)
        {
            let moreLives = this.lives.useLife();
            if (moreLives) {
                this.duck.newDuck();
                this.word.giveHint(true);
                this.word.initialiseLetterScore();
                BalloonNS.zapOldBalloons(this.balloons);
                BalloonNS.delaySpawn(SPAWN_PAUSE);
                this.allowSpawn = true;
            }
            else
            {
                //gameLoop.stopLoop();
                this.gameOver();
            }
        }
        // If word completed, clear balloons
        if (this.word.gotWord)
        {
            for (let b=0; b<this.balloons.length;b++)
            {
                this.balloons[b].burst();
            }
        }

        //List<WeeBird> weeBirdDeletions = new ArrayList<>();
        //for (WeeBird weeBird: weeBirdsLive)
        //{
        //    weeBird.update();
        //    if (weeBird.isDead()) weeBirdDeletions.add(weeBird);
        //}

        //for  (WeeBird weeBird: weeBirdDeletions) weeBirdsLive.remove(weeBird);

        this.duckTrap.update();

        // Spawn a balloon if it is time.
        if (this.allowSpawn && BalloonNS.checkSpawn()) this.balloons.push(BalloonNS.spawn(this.word, this.hud));
        BalloonNS.checkCollisionsInDimension(BalloonNS.DIMENSION.X, this.balloons);
        BalloonNS.checkCollisionsInDimension(BalloonNS.DIMENSION.Y, this.balloons);
        for (let idx = 0; idx < this.balloons.length; idx++) {
            let balloon = this.balloons[idx];
            this.playArea.checkBorderCollision(balloon);

            //if (balloon.isBirdWaiting())
            //{
            //    activateWeeBird(balloon);
            //    balloon.setBirdWaiting(false);
            //}

            balloon.update();
            if (balloon.dead)
            {
                if (balloon.lost) this.word.letterLost(balloon.letter);
            }
        }

        for (let b=this.balloons.length-1;b >= 0; b--)
          {
            if (this.balloons[b].dead)
            {
              let oldlen=this.balloons.length;
              this.balloons.splice(b,1);
            }
          }


        this.hud.increaseScore(this.word.turnScore);
        if (this.hud.isDifficultyIncreaseDue())
        {
            BalloonNS.increaseDifficulty();
            this.word.increaseDifficultyReward();
        }
        this.word.endTurn();
    }

    registerButtons = function()
    {
        let gameViewObject=this;
        document.getElementById("playButton").addEventListener(
          "click", function(evt) {
              doPlay();
        });
        document.getElementById("pauseButton").addEventListener(
          "click", function(evt) {
              gameViewObject.pauseGame();
        });
        document.getElementById("optionsButton").addEventListener(
          "click", function(evt) {
              gameViewObject.showOptions();
        });

        document.getElementById("quitButton").addEventListener(
          "click", function(evt) {
              gameViewObject.gameOver();
        });
        document.getElementById("resumeButton").addEventListener(
          "click", function(evt) {
              gameViewObject.startGame();
        });
    }

    registerTouches = function(duck, word) {
      //document.getElementById("gameCanvas").addEventListener("mousedown", function(evt) {
  		//  duck.fingerDown(evt.offsetX, evt.offsetY);});
        var thisObject = this;
//let isMouse=false;
  	     //document.getElementById("gameCanvas").
         document.addEventListener("mousemove", function(evt) {
           thisObject.checkSpeechRequired(); //if (word && word.waitingToSpeak) word.speakSpanishWord();
           //duck.fingerMove(true,evt.offsetX, evt.offsetY);
           duck.fingerMove(true,evt.clientX-thisObject.sharedData.gameLeft, evt.clientY);
//alert("C:"+evt.clientX + "  M:" + evt.movementX + "  O:" + evt.offsetX + "  P:" +evt.pageX + "  S:" + evt.sreenX);
});
  	//document.getElementById("gameCanvas").addEventListener("mouseup", function(evt) {
  	//	  duck.fingerUp(evt.offsetX, evt.offsetY);});
        document.getElementById("gameCanvas").addEventListener("touchstart",function(evt) {
          thisObject.checkSpeechRequired();
          thisObject.touchStart(evt.touches);});
        document.getElementById("gameCanvas").addEventListener("touchmove",function(evt) {
            thisObject.checkSpeechRequired();
            thisObject.touchMove(evt.touches);});
    }

    touchMove = function(touches)
    {
//alert("MOVE: " +touches.length + "  " + this.duck.fingerIsDown);

      if (touches.length == 0) return;
      if (this.gameOn)
      {
        let touch = touches[touches.length-1];
//alert("TOUCH: " + touch.screenX + " " + touch.clientX + " " + touch.pageX );
        this.duck.fingerMove(false, touch.clientX, touch.clientY); //touch.screenX, touch.screenY);
      }
    }

    touchStart = function(touches)
    {
//alert("gameOn:"+gameOn);
//if (this.gameOn && duck) alert("START: " + touches.length + " " +duck.fingerIsDown);
      if (touches.length == 0) return;
//alert("FD1?" + touches.length + "  "+touches[0].screenX + "  " + touches[0].screenY + "  " + this.gameOn);
      if (this.gameOn)
      {
        let touch = touches[touches.length-1];
  //alert("FD?" + touches[0].screenX + "  " + touches[0].screenY);// + touches[0].screenX + "  " + touches[1].screenY);// + "  " + this.duck);
        this.duck.fingerDown(touch.clientX, touch.clientY); //touch.screenX, touch.screenY);
      }
    }

/*
    private void activateWeeBird(Balloon balloon)
    {
        boolean found=false;
        for (int w=0; w<weeBirds.length && !found;w++)
        {
            if (nextWeeBirdIndex >= weeBirds.length)
            {
                nextWeeBirdIndex=0;
            }
            if (!weeBirdsLive.contains(weeBirds.get(nextWeeBirdIndex)))
            {
                weeBirds.get(nextWeeBirdIndex).activate(balloon);
                weeBirdsLive.add(weeBirds.get(nextWeeBirdIndex));

                found=true;
            }
            nextWeeBirdIndex++;
        }

    }
*/
/*
    public void suspend()
    {
        soundEffectPlayer.pauseAll();
        gameLoop.stopLoop();
    }
*/
    resume = function()
    {
        if (this.gameOn)
        {
            //reEntering=true;
            this.startGame();
        }
    }


    showOptions=function()
    {
      document.getElementById("gamePanel").style.display = "none";
      document.getElementById("optionsList").style.display = "block";
    }


    chooseButtons=function()
    {
      let pauseButton=document.getElementById("pauseButton");
      let resumeButton=document.getElementById("resumeButton");
      let optionsButton=document.getElementById("optionsButton");
      let quitButton=document.getElementById("quitButton");
      let playButton=document.getElementById("playButton");
      if (this.gameOn)
      {
        if (this.sharedData.paused)
        {
          pauseButton.style.display="none";
          resumeButton.style.display="block";
          optionsButton.style.display="block";
          quitButton.style.display="block";
          playButton.style.display="none";
        }
        else
        {
          pauseButton.style.display="block";
          resumeButton.style.display="none";
          optionsButton.style.display="none";
          quitButton.style.display="none";
          playButton.style.display="none";
        }
      }
      else if (this.newGameCountingDown)
      {
        pauseButton.style.display="none";
        resumeButton.style.display="none";
        optionsButton.style.display="none";
        quitButton.style.display="none";
        playButton.style.display="none";
      }
      else {
        pauseButton.style.display="none";
        resumeButton.style.display="none";
        optionsButton.style.display="none";
        quitButton.style.display="none";
        playButton.style.display="block";
      }
    }


    tempCircleWord = function(balloons)
    {
      const allLetters = "qwertyuioplkjhgfdsazxcvbnm";
      let context = document.getElementById("gameCanvas").getContext("2d");
      let x = 10;
      let y = 100;

      let wordPair = this.wordDB.nextWordPair();
      while (wordPair.englishWord.length != 5 ||
        !this.allUniqueLetters(wordPair.englishWord))
        wordPair = this.wordDB.nextWordPair();
      console.log("WORD: " + wordPair.englishWord);
      let myWord = wordPair.englishWord;
      var jumbledLetters =
        allLetters.split('').sort(function(){
          return 0.5-Math.random()
        }).join('');

      let lettersPos=0;
      let outWord = "";

      for (let p=0; p<myWord.length;p++)
      {
        let nextLettersPos =
          Math.floor(Math.random()*(26-p-lettersPos)) + lettersPos;
        for (let lp=lettersPos; lp < nextLettersPos; lp++)
        {
          var letter = jumbledLetters.charAt(lp);
          if (!myWord.includes(letter)) outWord+=letter;
        }
        outWord+=myWord.charAt(p);
        lettersPos = nextLettersPos;
      }
      for (let lp=lettersPos; lp < jumbledLetters.length; lp++)
      {
        var letter = jumbledLetters.charAt(lp);
        if (!myWord.includes(letter)) outWord+=letter;
      }


      for (let l = 0; l < outWord.length; l++)
      {
        let balloon = new Balloon(outWord.charAt(l), false, false);

        balloon.setPosition(x,y);
        x += balloon.x_size;
        if (x > 300 - balloon.x_size)
        {
          x=10;
          y+=balloon.y_size;
        }
        balloon.setVelocityUnscaled(0,0);
        balloons.push(balloon);

      }

    }
    allUniqueLetters = function(testWord)
    {
      let sortedWord = testWord.split('').sort().join('');
      for (let p = 0; p < sortedWord.length; p++)
      {
        if (sortedWord.charAt(p) == sortedWord.charAt(p-1)) return false;
      }
      return true;
    }


}
