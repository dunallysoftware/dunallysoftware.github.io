import Word from "./Word.js";

// Different sizes for score and high score depending on the score size
const standardScoreMultiplier = .75;
const smallScoreMultiplier = .6;

// Attributes for tracking if score requires game to increase difficulty by speeding up.
const SPEEDUP_POINTS_INTERVAL = 500;  // Speed up balloons every n points
const SPEEDUP_POINTS_MAX = 15000;   // Stop speeding up after n points.


const FREE_LIFE_SCORE_FREQUENCY_INIT=5000;
const FREE_LIFE_SCORE_FREQUENCY_INCREMENT=2000;
const FREE_LIFE_SCORE_MISSED_INTERVAL=50;


export default class HUD {

    score=0;
    highScore=0;
    //private final Rect scoreBand;
    //private boolean scoreBandHighlighted=false;
    //private HighLighter scoreBandHighlighter =null;
    //private final int scoreBandLeft;
    //private final int scoreBandRight;
    //private final int scoreBandTop;
    //private final int scoreBandBottom;
    //private final int scoreBandHeight;
    //private final int scoreBandWidth;
    lives;
    word;

    nextSpeedupScore = SPEEDUP_POINTS_INTERVAL;  // Next score to speed up at.
    //private final GamePreferences gamePreferences;

    currentScoreTextItem;
    highScoreTextItem;
//    private final TextItem currentScoreLabelTextItem;
//    private final TextItem highScoreLabelTextItem;
    letterScoreTextItem;
//    private final TextItem letterScoreLabelTextItem;
    nextLetterTextItem;
//    private final TextItem nextLetterLabelTextItem;
    nativeWordTextItem;
    guessWordTextItem;
    //private final TextItem messageTextItem;
    showMessage=false;

    //private int[] messageResources;
    //private int[] messageColorResources;
    //private String messageText;
    //private final int defaultMessageColor = Color.WHITE;
    //private long messageDuration;
    //private long messageDisplayEnd;
    //private int messageIndex;


    // Attributes for recognising when a free life is due.
    freeLifeScoreNext;
    freeLifeScoreFrequency;

    gameOn;


    constructor(lives, word)
    {
        //let sharedData = getSharedData();
        //this.gamePreferences = gamePreferences;
        //this.highScore = gamePreferences.getInt(R.string.preferences_high_score, 0);

        //scoreBandLeft = 0;
        //scoreBandRight = sharedData.gameWidth;
        //scoreBandTop = (int)(sharedData.gameHeight*.05);
        //scoreBandBottom = scoreBandTop + (int)(sharedData.gameHeight*.1);
        //scoreBand = new Rect(scoreBandLeft, scoreBandTop, scoreBandRight, scoreBandBottom);
        //scoreBandHeight = scoreBandBottom-scoreBandTop;
        //scoreBandWidth = scoreBandRight - scoreBandLeft;

        //scoreBandFlashPaint.setColor(resources.getColor(R.color.score_bar_flash));


        //textItemPaint.setTypeface(ResourcesCompat.getFont(context, R.font.xoloniumregular) );


        this.score = 0;
        this.lives=lives;
        this.word=word;

        this.nativeWordTextItem = document.getElementById("englishWord");
        this.guessWordTextItem = document.getElementById("maskedWord");
        this.currentScoreTextItem = document.getElementById("score");
        //scoreRect = new Rect(scoreBandLeft, scoreBandTop, scoreBandRight, scoreBandBottom);

        //currentScoreTextItem = new TextItem(false, Paint.Align.LEFT,.01, .05, Color.WHITE, standardScoreMultiplier);
        this.highScoreTextItem = document.getElementById("highScore");
        //if (highScore > 99999) highScoreTextItem.setTextSize(smallScoreMultiplier);

        this.letterScoreTextItem = document.getElementById("wordScore");
        this.nextLetterTextItem = document.getElementById("hint");
//        messageTextItem = new TextItem(false, Paint.Align.CENTER, 0, -.6, Color.WHITE, .8);
//        messageTextItem.overrideY_Position((int)(sharedData.gameHeight*.45));


        //this.lives.setPosition((int)(scoreBandRight - (scoreBandWidth*.01)), (int)(scoreBandTop - (scoreBandHeight*.01)));

    }

/*
    // Check if a position is within the score band
    public boolean inScoreBand(int x, int y)
    {
        return scoreBand.contains(x, y);
    }
*/

    clearScore = function()
    {
        this.score=0;
        //highScoreTextItem.setTextColor(Color.WHITE);
        this.nextSpeedupScore=SPEEDUP_POINTS_INTERVAL;
        this.freeLifeScoreFrequency=FREE_LIFE_SCORE_FREQUENCY_INIT;
        this.freeLifeScoreNext=this.freeLifeScoreFrequency;
    }

    increaseScore = function(points)
    {
        if (points==0) return;  // Can get called from GameView update when we didn't score points - nothing should happen then.
        this.score += points;
        //if (score > 99999 && score-points < 99999)
        //{
        //    currentScoreTextItem.setTextSize(smallScoreMultiplier);
        //    highScoreTextItem.setTextSize(smallScoreMultiplier);
        //}
        if (this.score > this.highScore)
        {
            this.highScore = this.score;
            //if (this.score-this.points <= highScore) highScoreTextItem.setTextColor(Color.YELLOW);
        }
    }

    // Called at end of game - if high score matches score, save it.
    checkHighScore = function()
    {
        if (this.score == this.highScore)
        {
alert("NEED TO SAVE HIGH SCORE IN PREF");
            //SharedPreferences.Editor editor = gamePreferences.getEditor();
            //editor.putInt(context.getString(R.string.preferences_high_score), highScore);
            //editor.commit();
        }
    }

    isDifficultyIncreaseDue = function()
    {
        if (this.score >= this.nextSpeedupScore && this.score < SPEEDUP_POINTS_MAX)
        {
            this.nextSpeedupScore += SPEEDUP_POINTS_INTERVAL;
            if (this.nextSpeedupScore > SPEEDUP_POINTS_MAX) this.nextSpeedupScore = 10000000; // Potential trivial performance improvement.
            return true;
        }
        return false;
    }

    draw = function(context)
    {

return;

        this.currentScoreTextItem.textContent=this.score;
        this.highScoreTextItem.textContent=this.highScore;
        if (this.gameOn)
        {
          this.letterScoreTextItem.textContent=this.word.letterScore;
          this.nextLetterTextItem.textContent = this.word.nextLetterHint;
        }
        else {
          this.letterScoreTextItem.textContent="";
          this.nextLetterTextItem.textContent="";
        }
      //letterScoreLabelTextItem.draw(canvas, "Letter score");
      //  if (gameOn) nextLetterTextItem.draw(canvas, String.valueOf(word.getNextLetterHint()));
      //  nextLetterLabelTextItem.draw(canvas, "Next");
        if (this.showMessage) {
        //    updateMessageText();
        }
        if (this.showMessage)
        {
            //messageTextItem.draw(canvas, messageText);
        }
        //else {
        if (this.gameOn) {
            this.nativeWordTextItem.textContent = this.word.englishWord;
            this.guessWordTextItem.textContent = this.word.maskedSpanishWord;
        }
        //}
        //drawScoreBand(canvas);
    //    this.lives.drawLives(context);
    }

/*
    private void drawScoreBand(Canvas canvas)
    {
        if (scoreBandHighlighted)
        {
            canvas.drawRect(scoreBand, scoreBandHighlighter.getPaint());
        }
        else {
            canvas.drawRect(scoreBand, paint);
        }
    }
*/
/*
    public void showMessages(int[] messageResources, int[] messageColorResources, long messageDuration)
    {
        showMessage=true;
        this.messageResources = messageResources;
        this.messageColorResources = messageColorResources;
        this.messageDuration = messageDuration;
        this.messageIndex = -1;
        this.messageDisplayEnd = 0;
    }
*/
/*
    private boolean updateMessageText()
    {
        if (!showMessage) return false;
        long now = System.currentTimeMillis();
        if (now >= messageDisplayEnd)
        {
            messageIndex++;
            if (messageResources==null || messageIndex >= messageResources.length)
            {
                showMessage=false;
                return false;
            }
            messageText=context.getString(messageResources[messageIndex]);
            if (messageColorResources.length > messageIndex)
            {
                messageTextItem.textColor =
                        ContextCompat.getColor(context, messageColorResources[messageIndex]);
            }
            else
            {
                messageTextItem.textColor = defaultMessageColor;
            }
            messageDisplayEnd = now + messageDuration;
        }
        return true;
    }
*/
    isFreeLifeDue = function()
    {
        if (this.score < this.freeLifeScoreNext) return false;
        // If too many lives already, don't allow another - but notice we missed one so we can give it
        // when a life is lost.
        if (this.lives.getLivesLeft() > 3)
        {
            this.freeLifeScoreNext = this.score + FREE_LIFE_SCORE_MISSED_INTERVAL;
            return false;
        }
        // Due now.  Move next free-life score on to the correct next value.
        while (this.score >= this.freeLifeScoreNext)
        {
            this.freeLifeScoreNext += this.freeLifeScoreFrequency;
            this.freeLifeScoreFrequency += FREE_LIFE_SCORE_FREQUENCY_INCREMENT;
        }
        return true;

    }

/*
    public void debugMessage(String messageText)
    {
        messageDisplayEnd = System.currentTimeMillis()+2000;
        this.messageText=messageText;
        messageTextItem.textColor=defaultMessageColor;
        showMessage=true;
    }
*/

}
