function Note(xPos, yPos, line, duration, pos, noteValue, isSpace, scalePos, acc) {
	this.xPos = xPos;
	this.noteGroups = new Array();
	this.noteGroups.push(new NoteGroup(yPos, pos, noteValue, scalePos, acc));
	this.line = line;
	this.duration = duration;
	this.pos = pos;
	this.isSpace = isSpace;
	this.accWidth=0;
	this.width = 30;
	this.dots=0;
	this.inverted=false;
}

function NoteGroup(yPos, pos, noteValue, scalePos, acc) {
	this.yPos = yPos;
	this.pos = pos;
	this.noteValue = noteValue;
	this.scalePos = scalePos;
	this.accidental = acc;
	this.hideAcc = true;
	this.accIsOffset=1;
}

function placeNote(duration, line, pos, isSpace, newGroup) {
	realPosition = ((line+1) * 144 - 2 ) + pos * 8;
	if(isSpace) realPosition=((line+1) * 144) - 48;
	xPos = Marker.xPos
	var noteValue = 71;
	var scalePos = (pos+3)*-1+7;
	var sP = 7;
	var desc = false;
	var acc = 0;
	for(iPos = 7; iPos!==scalePos;) {
		if(scalePos<iPos) {
			iPos--; sP--; noteValue-=2; desc = true;
		} 
		else {
			iPos++; sP++; noteValue+=2;
		} 

		if(sP>7) sP-=7;
		else if(sP<1) sP+=7;
		
		if(desc && (sP===7 || sP===3)) noteValue++;
		else if(!desc && (sP===1 || sP===4)) noteValue--;
	}
	for(var i = 1; i<=bars[curBar].accidentals; i++) {
		var value = i-1;
		if(bars[curBar].sharpOrFlat===-1) value = 7-i;

		if(sP === accidentalOrder[value]) {
			acc = bars[curBar].sharpOrFlat;
			break;
		}
	}

	for(var i = 0; i<bars[curBar].notes.length; i++) {
		var n=bars[curBar];
		for(var note=0; note<n.notes[i].noteGroups.length; note++) {
			if(pos === n.notes[i].noteGroups[note].pos) {
				acc=n.notes[i].noteGroups[note].accidental;

			}
		}
	}
	
	var note;
	if(!newGroup) {
		note = new Note(xPos, realPosition, line, duration, pos, noteValue, isSpace, sP, acc);
		bars[curBar].notes.splice(curNote, 0, note); 
	} else {
		bars[curBar].notes[curNote].noteGroups.push(new NoteGroup(realPosition, pos, noteValue, sP, acc));
		var noteGroupOrder=orderNoteGroup(bars[curBar].notes[curNote]);
		bars[curBar].notes[curNote].noteGroups=noteGroupOrder;
	}
	note = bars[curBar].notes[curNote];
	var inverse;
	for(var n=0; n<note.noteGroups.length; n++) {
		if(n===0) inverse = note.noteGroups[0].pos;
		else if(Math.abs(note.noteGroups[n].pos - (-3)) > Math.abs(inverse - (-3))) {
			inverse = note.noteGroups[n].pos;
		}
	}
	
	if(inverse<-3) {
		note.inverted=true;
	} else {
		note.inverted=false;
	}
}

NoteGroup.prototype.updateAccidental = function(bar, n, j) {
	for(var i = 1; i<=bars[bar].accidentals; i++) {
		var value = i-1;
		if(bars[bar].sharpOrFlat===-1) value = 7-i;

		if(this.scalePos === accidentalOrder[value] && this.accidental===bars[bar].sharpOrFlat) {
			hideAccidental(n, this, true, j);
			break;
		} else if(this.scalePos === accidentalOrder[value]) {
			hideAccidental(n, this, false, j);
			break;
		}
	}

	getAccWidth(j, bars[bar]);
}

function hideAccidental(note, nG, hide, j) {
	if(hide) {
		// if(nG.hideAcc===false) {
		// 	note.width-=note.accWidth;
		// } 
		nG.hideAcc=true;
	} else {
		// if(nG.hideAcc===true) {
		// 	note.width+=note.accWidth;
		// } 
		nG.hideAcc=false;
	}
}

function getNote(note, y) {
	//see if we are on a note, and selects the note if we are on one.
	var n = null;
	for(var noteGroup=0; noteGroup<note.noteGroups.length; noteGroup++) {
		if(note.noteGroups[noteGroup].pos===y+2) {
			
			n=note.noteGroups[noteGroup];
			break;
		}
	}

	return n
}

function determineAccFromBar(bar, note, n, j) {
	//if the value was changed then we need to verify if we have to show the accidental figure or not
	hideAccidental(note, n, false, j);
	//first we check based on the bar's accidentals
	if(bar.accidentals===0 && n.accidental===0) {
		hideAccidental(note, n, true, j);
	}
	for(var i = 1; i<=bar.accidentals; i++) {
		var value = i-1;
		if(bar.sharpOrFlat===-1) value = 7-i;

		if((n.scalePos === accidentalOrder[value] && n.accidental===bar.sharpOrFlat)) {
			hideAccidental(note, n, true, j);
			break;
		} else if(n.scalePos === accidentalOrder[value] && n.accidental!==bar.sharpOrFlat) {
			hideAccidental(note, n, false, j);
			break;
		}

		if(n.accidental!==0) {
			hideAccidental(note, n, false, j);
		} else {
			hideAccidental(note, n, true, j);
		}
	}
}

function determineAccFromNotes(bar, note, n, j) {
	//then, we verify for the notes before. Afterwards, we check the notes after it, and change them accordingly.
	for(var i = 0; i<bar.notes.length; i++) {
		for(var noteGroup=0; noteGroup<bar.notes[i].noteGroups.length; noteGroup++) {
			if(i > j) {
				var subject = bar.notes[i];
				var subjectPlace = bar.notes[i].noteGroups[noteGroup];
				
			}
			else if(i < j) {
				var subject = note;
				var subjectPlace = n;
			} 
			else continue;

			if(n.pos === bar.notes[i].noteGroups[noteGroup].pos) {
				if(bar.notes[i].noteGroups[noteGroup].accidental!==n.accidental) {
					hideAccidental(subject, subjectPlace, false, i);
					if(i>j) {
						n=bar.notes[i].noteGroups[noteGroup];
					} 
				} else {
					hideAccidental(subject, subjectPlace, true, i);
				}
			}

			if(i>j) {
				getAccWidth(i, bar);	
			}
		}
	}
}

function changeAccidental(bar, note, y, value, j) {
	if(j<bar.notes.length && !note.isSpace) {
		var n = getNote(note, y);

		//if we found a note then
		if(n!==null) {
			
			//we change it's value
			n.accidental += value;
			if(n.accidental>1) n.accidental=1;
			else if(n.accidental<-1) n.accidental=-1;
			else {
				determineAccFromBar(bar, note,n, j);

				determineAccFromNotes(bar, note, n, j);
			}

			getAccWidth(j, bar);
		}
	}
}

function determineAccLocation(objNote, objGroup, maxLength) {
	var curLength=0;
	while(curLength<objGroup.length) {
		if(objNote.noteGroups[nG].pos-objGroup[curLength].pos<=5) {
			curLength++;		
		} else {
			objNote.noteGroups[nG].accIsOffset=curLength+1;

			objGroup[curLength]=objNote.noteGroups[nG];

			break;
		}
	}
	if(curLength>maxLength) {
		maxLength=curLength;
		objNote.noteGroups[nG].accIsOffset=curLength+1;
		objGroup.push(objNote.noteGroups[nG]);
	}

	return maxLength;
}

function getAccWidth(note, bar) {
	var objNote = bar.notes[note];
	var maxLength=-1;
	var objGroup=[];
	objNote.accWidth=0;
	
	for(nG=objNote.noteGroups.length-1; nG>=0; nG--) {
		if(objGroup.length===0 && objNote.noteGroups[nG].hideAcc===false) {
			objNote.noteGroups[nG].accIsOffset=1;
			objGroup.push(objNote.noteGroups[nG]);
			maxLength=0;
			continue;
		}
		else if(objGroup.length===0 || objNote.noteGroups[nG].hideAcc) {
			objNote.noteGroups[nG].accIsOffset=1;
			continue;
		}

		maxLength = determineAccLocation(objNote, objGroup, maxLength);
	}
	if(note.inverted && note.noteGroups.length>1) objNote.accWidth+=15;
	if(objGroup.length !== 0) objNote.accWidth+=(objGroup.length*18);
}

function augment(bar, note, pos, value) {
	if(note<bars[bar].notes.length) {
		var objNote = bars[bar].notes[note]
		objNote.dots+=value;
		if(objNote.dots<0) objNote.dots=0;
		else if(objNote.dots>3) objNote.dots=3;
		else if(value>0) {
			objNote.width+=10;
		}
		else {
			objNote.width-=10;
		}
	}
}

function getNoteDuration(note) {
	var duration = note.duration;
	var lastDuration = duration;
	for(dot=0; dot<note.dots; dot++) {
		lastDuration=lastDuration*1/2
		duration+=lastDuration;
	}

	return duration;
}