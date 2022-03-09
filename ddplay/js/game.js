"use strict";
import Duck from "./Duck.js";
import LetterBall from "./LetterBall.js";
import SharedData from "./SharedData.js";
import {getSharedData} from "./SharedData.js";
import Balloon from "./Balloon.js";
import * as BalloonNS from "./Balloon.js";
import Word from "./Word.js";
import WordDB from "./WordDB.js";
import DuckTrap from "./DuckTrap.js";
import PlayArea from "./PlayArea.js";
import GameView from "./GameView.js";

let counter=0;
let lastDate=new Date(0);
var duck;
var sharedData;
var wordDB = new WordDB;
var playArea;
var word;
var duckTrap;

var imgCanvas;
var balloons = [];
var dummyBalloon;
var gameView = new GameView();



export function handleEvent(evt)
{
	duck.fingerDown(evt.offsetX, evt.offsetY);
}

export function doPlay()
{
	gameView.newGame();
	requestAnimationFrame(runLoop);
}

/*
function doPlay1()
{
//	window.alert("Hey Play " );
//	try {
		document.getElementById("playButton").textContent="DONE";
		sharedData = getSharedData();
		sharedData.gameWidth=300;
		sharedData.gameHeight=600;
		duckTrap = new DuckTrap();
		duck = new Duck(duckTrap);
		word = new Word(wordDB);
		playArea = new PlayArea();
		dummyBalloon = new Balloon("x",false,false);
		document.getElementById("englishWord").textContent = word.englishWord;
		document.getElementById("maskedWord").textContent = word.maskedSpanishWord;

	//duck.fingerDown(5, 6);
//		window.alert("GO: " + duck.x);
		const letterBall = new LetterBall("x",0,5);
//		window.alert("LB: " + letterBall.x_size);
	duck.newDuck();
		duck.draw(document.getElementById("gameCanvas").getContext("2d"));

var myJsonResponse;
fetch("./raw/spanish_words")
	.then(response => response.json())
	.then(jsonResponse =>		{
		//myJsonResponse = jsonResponse;
		let ky = Object.keys(jsonResponse);
		let o1 = jsonResponse[ky[0]][0];
		let ky1 = Object.keys(o1);
		//window.alert("YYY: " + o1[ky1[0]]);
	}
);
//window.alert("ZZZ: " + myJsonResponse.l03);
//	}
//	catch(err)
//	{
//		window.alert(err);
//	}

	//update();

}
*/
function runLoop()
{
	if (!gameView.loopRunning) return;
	gameView.runLoop();
	requestAnimationFrame(runLoop);
}

function update()
{
	if (counter > 20000) return;
	let now = Date.now();
	let diff = now - lastDate;
//	if (diff > 1000)
	//{
//	}
	if (diff > 2)
	{
		counter++;
		lastDate=now;
		duck.update();
		let canvas = document.getElementById("gameCanvas");
		let context = canvas.getContext("2d");
		context.clearRect(0, 0, canvas.width, canvas.height);
		document.getElementById("playButton").textContent="COUNT: " + counter + "  " + duck.x;
		duck.draw(context);
		if (BalloonNS.checkSpawn(1, 1))
		{
			balloons.push(BalloonNS.spawn(word, 0));
		}

		for (let b=0; b<balloons.length;b++)
			{
				playArea.checkBorderCollision(balloons[b]);
				balloons[b].update(context);
			}
			for (let b=0; b<balloons.length;b++)
				{
					balloons[b].draw(context);
				}
			duckTrap.update();
			duckTrap.draw(context);
			if (!duck.isCapturedOrDead()) {
					duck.checkBalloonCollisions(balloons, word);
			}
			document.getElementById("maskedWord").textContent=word.maskedSpanishWord;
			document.getElementById("score").textContent=word.turnScore;
	}
	requestAnimationFrame(update);

}
