var instr=null; // eslint-disable-line no-unused-vars
var AudioContextFunc = window.AudioContext || window.webkitAudioContext;

var player=new WebAudioFontPlayer();

function changeInstrument(context, p) {
	var info = player.loader.instrumentInfo(instruments[iPages[p].instrument].var);

	player.loader.startLoad(context, info.url, info.variable);
	player.loader.waitLoad(function () {
		instruments[iPages[p].instrument].loaded = info.variable;

		if(p === iPages.length-1) {
			play(context);
		} else {
			changeInstrument(context, p+1);
		}
		
	});	
}

function changeInstrumentQuick(context, p, bar, note) {
	var info = player.loader.instrumentInfo(instruments[iPages[p].instrument].var);

	player.loader.startLoad(context, info.url, info.variable);
	player.loader.waitLoad(function () {

		instr = window[name];
		playBack(context, bar, note, p);
	});
}



var c = document.getElementById("principal");
var ctx = c.getContext("2d");
ctx.translate(0.5, 0.5);
var lastPos = 180;
y=0;
var iPages = [];
var curIPage=0;
var colorI;
var bars = []; // eslint-disable-line no-unused-vars
var lines = []; // eslint-disable-line no-unused-vars
var savedBars = []; // eslint-disable-line no-unused-vars
var curBar = 0; // eslint-disable-line no-unused-vars
var curNote = 0; // eslint-disable-line no-unused-vars
var staffN = 1; // eslint-disable-line no-unused-vars
var curDuration = 0.5; // eslint-disable-line no-unused-vars
var curLine = 0; // eslint-disable-line no-unused-vars
var extended = false; // eslint-disable-line no-unused-vars
var markers=[];
var selectedNotes=[];

var time = []; // eslint-disable-line no-unused-vars
var scrollValue=0; // eslint-disable-line no-unused-vars
var accidentalOrder = [4, 1, 5, 2, 6, 3, 7]; // eslint-disable-line no-unused-vars
var gDurations = [1, 0.5, 0.25, 0.125, 0.0625, 0.03125, 0.015625];
var dots = [3, 3, 3, 3, 2, 1, 0];
var insertionTool=true;
var barTool=false;
var barFunction=-1;

function sendJSON(args) {
	var inf={
		functionName: "getJSON",
		args: {
			json: JSON.stringify(iPages),
			sDocument: JSON.stringify(SheetDocument)
		},
		generate: true
	};
	sendDataTo(JSON.stringify(inf), args.index);
}

function getJSON(args) {
	//console.log(args.json);
	iPages = JSON.parse(args.json);
	bars =iPages[curIPage].bars;
	lines = iPages[curIPage].lines;
	SheetDocument=JSON.parse(args.sDocument);

	var lInformation = {
		functionName: "newMarker",
		args: {
			index: uIndex,
			bar: curBar,
			note: curNote,
			line: curLine,
			iPage: curIPage,
			color: colors[colorI],
			extended: false,
			y: y
		},
		generate: true
	}
	sendData(JSON.stringify(lInformation));
	newMarker(lInformation.args);

	var mInformation = {
		functionName: "sendMarker",
		args: {
			index: uIndex
		},
		generate: false
	};
	sendData(JSON.stringify(mInformation));
	selectNote(curNote, curBar, curIPage, y);
	generateAll();
}

function start(createNew) {
	c=document.getElementById("principal");
	//changeInstrument("https://surikov.github.io/webaudiofontdata/sound/0000_FluidR3_GM_sf2_file.js","_tone_0000_FluidR3_GM_sf2_file");
	c.height = window.innerHeight-72;
	c.width = window.innerWidth-70;

	document.getElementById("principal").addEventListener('mousemove', debounce(function(event) {
		if(!checkPlay()) checkMousePosition(event);
	}, 8), false);
	document.getElementById("principal").addEventListener('click', function(event) {
		if(!checkPlay()) clickMouse();
	}, false);
	console.log("w");
	
	if(createNew) {
		
		lines.push(new Line());
		lines[0].maxBars=3;
		lines[0].yOffset=0;
		iPages.push(new InstrumentPage());
		iPages[curIPage].lines=lines;
		var args = {
			upperSig: 4,
			lowerSig: 4,
			cS: true,
			clef: 0,
			cC: false,
			iPage: curIPage,
			bar: curBar,
			line: curLine, 
			curLine:curLine,
			cA: false,
			acc: 0,
			sof: 0
		};
		newBar(args);
		
		var lInformation = {
			functionName: "newMarker",
			args: {
				index: uIndex,
				bar: curBar,
				note: curNote,
				line: curLine,
				iPage: curIPage,
				extended: false,
				color: colors[0],
				y: y
			},
			generate: true
		};
		newMarker(lInformation.args);
		var information = {
			iPage: curIPage,
			bar: curBar, note:curNote, duration: 1,
			line: curLine, pos: y, isSpace: true, newGroup: false, fullRest: true
		};
		placeNote(information);
		colorI=0;
		bars=iPages[curIPage].bars;
		lines = iPages[curIPage].lines;
		selectNote(curNote, curBar, curIPage, y);
		generateAll();
	} else {
		colorI=0;
		var jInformation = {
			functionName: "sendJSON",
			args: {
				index: uIndex
			} ,
			generate: false
		};
		sendData(JSON.stringify(jInformation));
	}
}