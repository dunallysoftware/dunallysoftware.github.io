

const PRELOAD_COUNT = 10;

export class WordPair {
    spanishWord;
    englishWord;

    constructor(spanishWord, englishWord)
    {
        this.spanishWord = spanishWord;
        this.englishWord = englishWord;
    }

}
export default class WordDB {



    // List of words, ordered by length of Spanish word
    words = [];

    // Preloaded set of words for picking
    nextWords = [];

    // On searching list, max index we should search to first time, and how much that should increase on each search
    max_search_range = 0;
    search_jump = 0;
    next_word_idx = 0;


    // Initialise wordsByLength Map from "spanish_words" raw file.
    // Resource file is in the format:
    // { "<length Key>" -> [{"sp"->"<spanish word>", "en"->"<english word>"},  ]
    // length key contains "l" followed by two-digit length of Spanish word.
    // We don't actually do anything with the length though, we want a list of all words,
    // but ORDERED by length.
    constructor() {
        // Read resource into string
//let stop = false;
        fetch("./raw/spanish_words")
        	.then(response => response.json())
        	.then(jsonResponse =>		{
              let wordLengths  = Object.keys(jsonResponse);
              for (let l = 0; l < wordLengths.length; l++) {
//if (!stop) alert("WL: " + jsonResponse[wordLengths[l]]);
                let lengthWords = jsonResponse[wordLengths[l]];
                for (let w = 0; w < lengthWords.length; w++)
                {
//if (!stop) alert("LW: " + lengthWords[w]);
                  let rawWord = lengthWords[w];
//let fx  = Object.keys(rawWord);
  //if (!stop) alert("RW: " + fx);
                  if ("sp" in rawWord && "en" in rawWord)
                  {
                    this.words.push(new WordPair(rawWord["sp"], rawWord["en"]));
//if (!stop) alert("HERE:" + rawWord["sp"] + "  " + rawWord["en"]);
                  }
//stop=true;
                }
              }
              // Set values for searching
              this.search_jump = this.words.length/30;
        	}
        );
//alert("AFTER: " + this.words.length);
    }

    // Get the next available word pair from preloaded set (preload if empty)
    nextWordPair = function()
    {
        if (this.next_word_idx >= this.nextWords.length)
        {
            this.loadNextWords();
        }
    //alert("IN NWP: " + this.nextWords[this.next_word_idx]
   //+ " " + this.words.length);
        return this.nextWords[this.next_word_idx++];
    }

    // Preload a number of words for selection
    loadNextWords = function()
    {
        this.next_word_idx = 0;
        this.nextWords = [];
        for (let w = 0; w < PRELOAD_COUNT; w++)
        {
            this.max_search_range += this.search_jump;
            if (this.max_search_range >= this.words.length) this.max_search_range = this.words.length-1;
            this.nextWords.push(this.words[Math.floor(Math.random()*this.max_search_range)]);
        }
    }

    // Method for demo purposes that inserts words at the start of the list,
    // and points next word to them
    insertWords = function(spanishWords, englishWords)
    {
        this.nextWords = [];
        // Add in reverse as inserting each one at 0.
        for (let w=spanishWords.length-1;w>=0;w--)
        {
            let wordPair = new WordPair(spanishWords[w], englishWords[w]);
            this.nextWords.push(0, wordPair);
        }
        this.next_word_idx=0;
    }


}
