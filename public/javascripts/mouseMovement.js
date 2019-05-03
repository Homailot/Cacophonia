function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top + scrollValue
    };
}

var Mouse = {
};


function checkMousePosition(evt) {
    var mousePosition = getMousePos(c, evt);

    if(mousePosition.x>markers[uIndex].xPos+20) {
        mouseRight(mousePosition);
        sendAndUpdateMarker();
       
    } else if(mousePosition.x<markers[uIndex].xPos) {
        mouseLeft(mousePosition);
        sendAndUpdateMarker();
    }

    mouseVertical(mousePosition);
}

function getClosestNote(x, bar) {
    var note;
    var lowerBound=0, upperBound=bars[bar].notes.length-1, middlePos=(upperBound+lowerBound)/2>>0;
    while(lowerBound<=upperBound) {
        
        if(bars[bar].notes[middlePos].xPos>x) {
            upperBound=middlePos-1;

        } else if(bars[bar].notes[middlePos].xPos<x) {
            lowerBound=middlePos+1;
            
        } else return middlePos;
        middlePos=(upperBound+lowerBound)/2>>0;
    }
    if(upperBound<0) {
        upperBound=0;
    }
    if(lowerBound>=bars[bar].notes.length) {
        lowerBound=bars[bar].notes.length-1;
    }

    return Math.abs(bars[bar].notes[lowerBound].xPos-x) < Math.abs(bars[bar].notes[upperBound].xPos-x)? lowerBound:upperBound;
}

function mouseRight(mousePosition) {
    for(; curBar+1<bars.length && bars[curBar].xPos<mousePosition.x && bars[curBar+1].line===curLine; curBar++,curNote=0);
    
    if(curNote+1>=bars[curBar].notes.length) {
        if(!markers[uIndex].extended && getSum(bars, curBar)<bars[curBar].upperSig/bars[curBar].lowerSig) {
            markers[uIndex].extended=true;
            curNote++;

            updateCurMarker();
            generateAll();
        }
        return;
    }
    var note = getClosestNote(mousePosition.x, curBar);
    curNote = note;

    restoreCanvas();
    drawMarker({ headerOffset: iPages[curIPage].headerOffset });
}

function mouseLeft(mousePosition) {
    if(curBar===0 && curNote===0) return;
    for(; curBar-1>=0 && bars[curBar].initPos>mousePosition.x && bars[curBar-1].line===curLine; curBar--,curNote=0);
    var note = getClosestNote(mousePosition.x, curBar);
   

    if(Math.abs(markers[uIndex].xPos - mousePosition.x) > Math.abs(bars[curBar].notes[note].xPos - mousePosition.x) && markers[uIndex].extended) {
        markers[uIndex].extended=false;

        curNote=note;

        updateCurMarker();
        generateAll();
        return;
    }

    if(markers[uIndex].extended) return;

    curNote=note;
    

    restoreCanvas();
    drawMarker({ headerOffset: iPages[curIPage].headerOffset });
}

function mouseVertical(mousePosition) {
    var v=0;
    var ogLine=curLine;

    while(true) {
        if(mousePosition.y>markers[uIndex].yPos+26) v=1;
        else if(mousePosition.y<markers[uIndex].yPos) v=-1;
        else break;

        temporaryChangePitch(v);

        if(markers[uIndex].y===6) {
            if(lines[curLine+1] && calculateYLine(curLine+1, iPages[curIPage].headerOffset)+(curLine+1)*144<mousePosition.y) {
                moveMouseToLine(1, mousePosition);
            } else break;

            if(bars[curBar].line===ogLine) break;

            ogLine=bars[curBar].line;
        } else if(markers[uIndex].y===-17) {
            if(lines[curLine-1] && calculateYLine(curLine-1, iPages[curIPage].headerOffset)+(curLine)*144>mousePosition.y) {
                moveMouseToLine(-1, mousePosition);
            } else break;

            if(bars[curBar].line===ogLine) break;

            ogLine=bars[curBar].line;
        }
    }
    
    if(v!==0) {
        restoreCanvas();
	    sendAndUpdateMarker();
	    drawMarker({ headerOffset: iPages[curIPage].headerOffset });
    }
}

function moveMouseToLine(direction, mousePosition) {
    for(var bar=curBar+direction; bar>=0 && bar<bars.length; bar+=direction) {
        if(bars[bar].line!==curLine && bars[bar].initPos<=mousePosition.x && bars[bar].xPos>=mousePosition.x){
            curNote=0;
            curBar=bar;
            curLine=bars[bar].line;
            break;
        }
    }

    updateCurMarker();
}

function clickMouse() {
    enterNotes();
}