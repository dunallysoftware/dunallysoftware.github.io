import WordDB from "./WordDB.js";
import {WordPair} from "./WordDB.js";

// For populating masked field
const QUESTION_MARKS = "??????????????????????????????";

const LETTER_SCORE_FULL_START = 19;  // The initial score for getting a letter first time.
const LETTER_SCORE_INCREMENT_INIT = 1;
const LETTER_SCORE_INCREMENT_REDUCER = .9;
var letterScoreMultiplier = LETTER_SCORE_INCREMENT_INIT;
var letterScoreDifficultyAddon = 0;


export default class Word {


    wordDB;
    //private final TextToSpeechHandler tts;
    //private final SoundEffectPlayer soundEffectPlayer;

    spanishWord;
    englishWord;
    maskedSpanishWord;

    // String containing randomised Spanish word for output, plus index to show next to pick
    randomisedSpanish;
    nextSpanishLetterIndex=0;

    // Words that we have displayed, for info at end of game.
    usedWords = [];

    speakSpanish;
    //private final GamePreferences gamePreferences;



    lettersFound;
    nextLetterRequired;
    nextLetterHint;

    wordScore = 0;
    letterScore = LETTER_SCORE_FULL_START;


    // Information about current turn, reset every update.
    turnScore = 0;
    gotWord = false;

    constructor( wordDB)
    {
        this.wordDB = wordDB;

        //this.tts = tts;
        //this.soundEffectPlayer = soundEffectPlayer;
        //this.gamePreferences = gamePreferences;
        //gamePreferences.addListener(this);
        this.speakSpanish = true; //speakSpanish = this.gamePreferences.getBoolean(R.string.preferences_speak_spanish, true);
        this.newWord(false);
        this.initialiseLetterScore();
    }

    initialiseLetterScore = function()
    {
        this.letterScore = LETTER_SCORE_FULL_START+
            Math.floor(letterScoreDifficultyAddon);
    }


/*
    public void optionsUpdates()
    {
        speakSpanish = this.gamePreferences.getBoolean(R.string.preferences_speak_spanish, true);
    }
*/
    // Select a new word for user to guess
    newWord = function(reuse)
    {
        if (!reuse || !this.spanishWord || this.spanishWord.length==0) {
            let wordPair = this.wordDB.nextWordPair();
            this.spanishWord = wordPair.spanishWord;
            //this.spanishWord = "abcdefghijklmnopqrstuvwxyzñúíáéó";
            this.englishWord = wordPair.englishWord;
            if (!(wordPair in this.usedWords)) this.usedWords.push(wordPair);
        }
        this.setRandomOrderSpanishWord();
        this.lettersFound=0;
        this.nextLetterRequired=this.spanishWord.charAt(this.lettersFound);
        this.nextLetterHint = this.nextLetterRequired;
        this.initialiseLetterScore();
        this.maskedSpanishWord = QUESTION_MARKS.substring(0, this.spanishWord.length);
        this.wordScore=0;
        //if (this.speakSpanish) tts.speak(spanishWord);

    }



    increaseDifficultyReward = function()
    {
        letterScoreMultiplier *= LETTER_SCORE_INCREMENT_REDUCER;
        letterScoreDifficultyAddon += letterScoreMultiplier;
    }



    revealLetterFound = function(position)
    {
        this.maskedSpanishWord =
         this.maskedSpanishWord.slice(0, position) +
         this.spanishWord.charAt(position) +
         this.maskedSpanishWord.slice(position+1);
    }

    // Check the letter that the duck has hit.
    // Return false if checking should stop (dead duck or completed word)
    checkSelectedLetter = function(duck, balloon)
    {
        if (balloon.letterMatches(this.nextLetterRequired))
        {
            balloon.gotLetter();
            this.revealLetterFound(this.lettersFound);
            this.lettersFound += 1;
            this.turnScore += this.letterScore;
            this.wordScore += this.letterScore;
            this.initialiseLetterScore();
            if (this.lettersFound < this.spanishWord.length)
            {
                this.nextLetterRequired = this.spanishWord.charAt(this.lettersFound);
                this.nextLetterHint = '?';
                //soundEffectPlayer.playSoundEffect(R.raw.birdie);
            }
            else
            {
                this.gotWord=true;
                this.turnScore += this.wordScore;
                //soundEffectPlayer.playSoundEffect(R.raw.word_found);
                this.newWord(false);

                return false;
            }
        }
        else
        {
            balloon.caughtDuck(duck);
            duck.capture(balloon);
            return false;
        }

        return true;
    }

    // Get the next random letter from the word
    getRandomSpanishLetter = function()
    {
        // If none left to pick, re-randomise
        if (!this.randomisedSpanish || this.nextSpanishLetterIndex >= this.randomisedSpanish.length)
        {
            this.setRandomOrderSpanishWord();
        }
        return this.randomisedSpanish.charAt(this.nextSpanishLetterIndex++);
    }

    // Populate the Spanish word in a mixed-up letter order
    setRandomOrderSpanishWord = function()
    {
        let input = this.spanishWord;
        let result = "";
        while (input.length > 0)
        {
            let idx = Math.floor(Math.random()*input.length);
            result += input.charAt(idx);
            input = input.slice(0,idx) + input.slice(idx+1);
        }
        this.randomisedSpanish = result;
        this.nextSpanishLetterIndex=0;
    }

    giveHint = function(freeHint)
    {
        if (this.nextLetterHint == '?')
        {        
            this.nextLetterHint=this.nextLetterRequired;
            if (!this.freeHint) this.letterScore=1;  // Hinting costs!
        }
    }

    // Called when a balloon disappears.
    letterLost = function(letter)
    {
        if (letter == this.nextLetterRequired && this.letterScore > 1)
        {
            this.letterScore--;
        }
    }


    endTurn = function()
    {
        this.turnScore=0;
        this.gotWord=false;
    }

/*
    // Demo method to seed the word list with specific words
    public void insertWords(String[] spanishWords, String[] englishWords)
    {
        wordDB.insertWords(spanishWords, englishWords);
    }
*/

  newGame = function()
  {
    letterScoreDifficultyAddon = 0;
    letterScoreMultiplier = LETTER_SCORE_INCREMENT_INIT;
  }

}
