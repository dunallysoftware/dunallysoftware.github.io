import WordDB from "./WordDB.js";
import {WordPair} from "./WordDB.js";
import SoundEffectPlayer from "./SoundEffectPlayer.js";
import GamePreferences from "./GamePreferences.js";

// For populating masked field
const QUESTION_MARKS = "??????????????????????????????";

const LETTER_SCORE_FULL_START = 19;  // The initial score for getting a letter first time.
const LETTER_SCORE_INCREMENT_INIT = 1;
const LETTER_SCORE_INCREMENT_REDUCER = .9;
const BIRDIE_AUDIO = new Audio("./audio/birdie.wav");
var letterScoreMultiplier = LETTER_SCORE_INCREMENT_INIT;
var letterScoreDifficultyAddon = 0;


export default class Word {

    wordDB;
    //private final TextToSpeechHandler tts;
    soundEffectPlayer;

    spanishWord;
    englishWord;
    maskedSpanishWord;

    // String containing randomised Spanish word for output, plus index to show next to pick
    randomisedSpanish;
    nextSpanishLetterIndex=0;

    // Words that we have displayed, for info at end of game.
    usedWords = [];

    speakSpanish;
    gamePreferences;



    lettersFound;
    nextLetterRequired;
    nextLetterHint;

    wordScore = 0;
    letterScore = LETTER_SCORE_FULL_START;


    // Information about current turn, reset every update.
    turnScore = 0;
    gotWord = false;

    waitingToSpeak=false;
    utterance;

    constructor( wordDB, gamePreferences, soundEffectPlayer)
    {
        this.wordDB = wordDB;
        this.gamePreferences=gamePreferences;
        this.gamePreferences.addSubscriber(this, this.setupSpeech);
        //this.soundEffectPlayer = soundEffectPlayer;
        //this.gamePreferences = gamePreferences;
        //gamePreferences.addListener(this);
        //this.speakSpanish = true; //speakSpanish = this.gamePreferences.getBoolean(R.string.preferences_speak_spanish, true);
        this.setupSpeech(this);
        this.soundEffectPlayer = soundEffectPlayer;
        this.newWord(false);
        this.initialiseLetterScore();
    }

    // Accept object as parameter so can be called from GamePreferences update publish.
    setupSpeech = function(object)
    {

      let speechVolume = object.gamePreferences.getValue("SPEAK_SPANISH_VOLUME");
      object.speakSpanish = (speechVolume > 0 && 'speechSynthesis' in window);
      if (object.speakSpanish)
      {
        if (!object.utterance) object.utterance = new SpeechSynthesisUtterance();
        object.utterance.lang="es";
        object.utterance.volume=speechVolume/10.0;
      }
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
        // setTimeout(this.speakSpanishWord(),1000);
        this.waitingToSpeak=true;
//alert("WAITING:");
    }

speakSpanishWord = function()
{
  //alert("SSW: " + this.waitingToSpeak + "  " + this.speakSpanish);
  this.waitingToSpeak=false;
  if (this.speakSpanish)
  {
//alert("SPEAKING" + window.speechSynthesis.speaking);
    try {
      //let utterance = new SpeechSynthesisUtterance(this.spanishWord);

      //utterance.lang="es";
      //window.speechSynthesis.cancel();
      this.utterance.text=this.spanishWord;
    //  utterance.rate=-1.5;
      window.speechSynthesis.speak(this.utterance);
//alert("spoke");
    }
    catch (e) {alert(e);}
  }
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
                this.soundEffectPlayer.playSoundEffect("birdie");
            }
            else
            {
                this.gotWord=true;
                this.turnScore += this.wordScore;
                this.soundEffectPlayer.playSoundEffect("word_found");
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
