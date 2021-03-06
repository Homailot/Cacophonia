function drawStaff(line, end, start) { // eslint-disable-line no-unused-vars
	ctx.beginPath();
	ctx.lineWidth = 1;
	ctx.strokeStyle = "#939393";
	var baseY = line * 144;

	ctx.moveTo(start, baseY + 80);
	ctx.lineTo(end, baseY + 80);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(start, baseY + 96);
	ctx.lineTo(end, baseY + 96);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(start, baseY + 112);
	ctx.lineTo(end, baseY + 112);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(start, baseY + 128);
	ctx.lineTo(end, baseY + 128);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(start, baseY + 144);
	ctx.lineTo(end, baseY + 144);
	ctx.stroke();
}

function drawClef(clef, xPos, line) {
	var texto = "";
	if (clef === 0) {
		texto = "\uD834\uDD1E"; //sol
		ctx.font = "100px Musicaf";
		ctx.fillText(texto, xPos + 70, (line + 1) * 144);
	} else {
		texto = "𝄢"; //fá
		ctx.font = "100px Musicaf";
		ctx.fillText(texto, xPos + 70, (line + 1) * 144);
	}
}

function drawFigure(bar, note) { // eslint-disable-line no-unused-vars
	var turned = false;
	var text;
	if (note.isSpace) {
		var pauseOffset = 0;
		switch (note.duration) {
			case 1: text = "\uD834\uDD3B"; pauseOffset -= 14; break;
			case 0.5: text = "\uD834\uDD3C"; pauseOffset -= 6; break;
			case 0.25: text = "\uD834\uDD3D"; break;
			case 0.125: text = "\uD834\uDD3E"; break;
			case 0.0625: text = "\uD834\uDD3F"; break;
			case 0.03125: text = "\uD834\uDD40"; break;
			case 0.015625: text = "𝅁"; break;
		}
		ctx.font = "60px BravuraF";
		ctx.fillText(text, note.xPos, ((note.line + 1) * 144) - 8 - 26 + pauseOffset);
		drawDot(note, false);
		return;
	}
	if (note.noteGroups.length > 1) {
		var inv = note.noteGroups[0];
		var farthest;

		for (var n = 1; n < note.noteGroups.length; n++) {
			if (Math.abs(inv.pos - (-3)) < Math.abs(note.noteGroups[n].pos - (-3))) inv = note.noteGroups[n];
		}
		farthest = inv;
		for (var n2 = 0; n2 < note.noteGroups.length; n2++) {
			if (Math.abs(inv.pos - note.noteGroups[n2].pos) > Math.abs(farthest.pos - inv.pos)) farthest = note.noteGroups[n2];
		}

		drawHead(note, note.inverted);
		for (n = 0; n < note.noteGroups.length; n++) {
			note.noteGroups[n].yPos = ((note.line + 1) * 144 - 2) + note.noteGroups[n].pos * 8 - 14;
			drawExtraStaff(note.xPos, note.noteGroups[n].pos - 2, note.line);
			var height = Math.abs(note.noteGroups[n].yPos - farthest.yPos) + 4;
			if (note.noteGroups[n].pos !== farthest.pos) drawStem(note, height + 2, note.inverted, n);
			else drawStem(note, 32, note.inverted, n);
		}

		ctx.save();
		ctx.translate(note.xPos + 19, farthest.yPos);
		ctx.font = "69px Musicaf";

		if (inv.pos < -3) {
			ctx.rotate(Math.PI);
			ctx.translate(17, -14);
			turned = true;
		}

		switch (note.duration) {
			case 1: text = ""; break;
			case 0.5: text = ""; break;
			case 0.25: text = ""; break;
			case 0.125: text = "\uD834\uDD6E"; break;
			case 0.0625: text = "\uD834\uDD6F"; break;
			case 0.03125: text = "\uD834\uDD70"; break;
			case 0.015625: text = "\uD834\uDD71"; break;
			default: text = ""; break;
		}

		if (text !== "") ctx.fillText(text, 0, 0);


		ctx.restore();
		drawDot(note, turned);
	} else {
		note.noteGroups[0].yPos = ((note.line + 1) * 144 - 2) + note.noteGroups[0].pos * 8 - 14;
		drawExtraStaff(note.xPos, note.noteGroups[0].pos - 2, note.line);

		drawNoteAccidental(note, m);
		ctx.save();
		ctx.translate(note.xPos, note.noteGroups[0].yPos);
		ctx.font = "69px Musicaf";

		var m = 1;
		if (note.inverted) {
			ctx.rotate(Math.PI);
			ctx.translate(-20, -15);
			turned = true;
			m = -1;
		}

		switch (note.duration) {
			case 1: text = "\uD834\uDD5D"; break;
			case 0.5: text = "\uD834\uDD5E"; break;
			case 0.25: text = "\uD834\uDD5F"; break;
			case 0.125: text = "\uD834\uDD60"; break;
			case 0.0625: text = "\uD834\uDD61"; break;
			case 0.03125: text = "\uD834\uDD62"; break;
			case 0.015625: text = "𝅘𝅥𝅱"; break;
			default: text = "\uD834\uDD5F"; break;
		}

		ctx.fillText(text, 0, 0);



		ctx.restore();
		drawDot(note, turned);
	}
}

function drawTies(bar, note, inverse) { // eslint-disable-line no-unused-vars
	var objN = bars[bar].notes[note];
	for (var nG = 0; nG < objN.noteGroups.length; nG++) {
		if (objN.noteGroups[nG].tiesTo !== false) {
			var result = getTied(bars, bar, note + 1, objN.noteGroups[nG]);
			var tiesTo = result.tiesTo;
			var tiesToNG = result.tiesToNG;
			var barTo = result.barTo;


			var xCenter, yCenter, radius, startAngle, endAngle;

			yCenter = objN.noteGroups[nG].yPos + 15;
			startAngle = 0.125 * Math.PI;
			endAngle = 0.875 * Math.PI;

			if (tiesTo.line != objN.line) {
				
				xCenter = bars[bar].xPos;
				radius = bars[bar].xPos - (objN.xPos + 10);

				ctx.beginPath();
				ctx.strokeStyle = "#000000";
				ctx.lineWidth = 2;
				ctx.ellipse(xCenter, yCenter, radius, 10, 0, startAngle, endAngle, false);
				ctx.stroke();

				yCenter = tiesToNG.yPos + 15 + lines[bars[barTo].line].yOffset;
				xCenter = getBarStart(bars, barTo) + bars[barTo].initPos;
				radius = tiesTo.xPos - xCenter;
			} else {
				xCenter = (objN.xPos + 10 + tiesTo.xPos) / 2;
				radius = tiesTo.xPos - xCenter;
			}


			ctx.beginPath();
			ctx.strokeStyle = "#000000";
			ctx.lineWidth = 2;
			ctx.ellipse(xCenter, yCenter, radius, 10, 0, startAngle, endAngle, false);
			ctx.stroke();
		}
	}
}

function writeDots(note) {
	ctx.font = "80px Musicaf";

	for (var dot = 0; dot < note.dots; dot++) {
		ctx.fillText("\uD834\uDD6D", 0, 0);
		ctx.translate(10, 0);
	}
}

function checkAdjacent(noteGroups) {
	for(var n = 0; n+1<noteGroups.length; n++) {
		if(noteGroups[n + 1].pos - noteGroups[n].pos === -1) {
			return true;
		}
	}

	return false;
}

function placeDots(note, noteGroupOrder, ngo, isSpace, occupied, inv) {
	ctx.restore();
	ctx.save();

	ctx.translate(note.xPos + 25, noteGroupOrder[ngo].yPos);
	if (!isSpace) {
		if (inv) ctx.translate(0, -8);
		else ctx.translate(0, +8);
		
	}
	if(checkAdjacent(noteGroupOrder)) {
		if(inv) ctx.translate(8, 0);
		else ctx.translate(10, 0);
	}

	writeDots(note);

	ctx.translate(-note.dots * 10, -16);
}

function determineDots(allocatedSpaces, note, noteGroupOrder, ngo, inv) {

	var isSpace, space, occupied = false;
	//positions that are divided by 2 are on spaces
	if (noteGroupOrder[ngo].pos % 2 === 0) isSpace = true;
	else isSpace = false;

	if (isSpace) {
		space = noteGroupOrder[ngo].pos / 2;
	} else {
		if (inv) space = (noteGroupOrder[ngo].pos - 1) / 2;
		else space = (noteGroupOrder[ngo].pos + 1) / 2;
	}
	for (var s = 0; s < allocatedSpaces.length; s++) {
		if (space === allocatedSpaces[s]) {
			occupied = true;
			return;
		} else if (occupied) {
			break;
		}
	}

	placeDots(note, noteGroupOrder, ngo, isSpace, occupied, inv);
	allocatedSpaces.push(space);
}

function drawDot(note, inv) {
	if (note.dots > 0) {
		if (note.isSpace) {
			ctx.save();
			ctx.translate(note.xPos + 25, note.noteGroups[0].yPos - 56);

			writeDots(note);

		} else {
			var noteGroupOrder = note.noteGroups;
			var allocatedSpaces = [];

			ctx.save();
			for (var ngo = 0; ngo < noteGroupOrder.length; ngo++) {
				determineDots(allocatedSpaces, note, noteGroupOrder, ngo, inv);
			}
			ctx.restore();
		}
	}
	ctx.restore();
}

function drawNoteAccidental(n, m) {
	for (var nG = n.noteGroups.length - 1; nG >= 0; nG--) {
		ctx.save();
		var objNG = n.noteGroups[nG];


		if (objNG.hideAcc === false) {
			ctx.translate(n.xPos, objNG.yPos);

			if (m === -1) {
				ctx.translate(+15, +15);
				ctx.rotate(Math.PI);
			}

			ctx.translate(-18 * objNG.accIsOffset, 0);
			if (n.inverted && n.noteGroups.length > 1) ctx.translate(-15, 0);
			var offset = 10;
			var text;
			switch (objNG.accidental) {
				case 1:
					text = "\u266F";
					break;
				case -1:
					text = "\u266D";
					offset -= 6;
					break;
				case 0:
					text = "\u266E";
					break;
				default:
					text = ""; break;
			}

			ctx.font = "75px Musicaf";
			ctx.fillText(text, 0, offset);
		}
		ctx.restore();
	}

	ctx.restore();
}

function drawStem(note, height, inverse, noteGroup) {
	ctx.beginPath();

	ctx.save();
	ctx.translate(note.xPos - 1, note.noteGroups[noteGroup].yPos + 10);
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 2;
	//height+=2;

	if (inverse) {
		ctx.rotate(Math.PI);
		ctx.translate(-21, 6);
		height -= 5;
	}

	if (note.duration <= 0.5) {
		ctx.moveTo(+16, -4);
		ctx.lineTo(+16, -height - 2 - 8);
		ctx.stroke();
	}

	ctx.restore();

}

function drawSelected() {
	if (selectedNotes[0]) {

		var note = bars[selectedNotes[0].bar].notes[selectedNotes[0].note];
		var yOffset = calculateYLine(note.line, iPages[curIPage].headerOffset);
		var adjacent = false;
		var faceRight = false;
		ctx.translate(0, yOffset);

		ctx.fillStyle = "#007acc";

		if (note.isSpace) {
			drawFigure(selectedNotes[0].bar, note);
		} else {
			var n = getNote(note, selectedNotes[0].pos);
			var noteGroupOrder = bars[selectedNotes[0].bar].notes[selectedNotes[0].note].noteGroups;

			if (n == -1) n = 0;
			for (var nG = 0; nG < noteGroupOrder.length; nG++) {
				if (nG !== n) {
					ctx.save();
					result = getNoteFace(nG, noteGroupOrder, adjacent, faceRight, note.inverted);
					ctx.restore();
				} else {
					result = drawIndividualHead(note, note.noteGroups, n, note.inverted, faceRight, adjacent);

					break;
				}

				faceRight = result.faceRight;
				adjacent = result.adjacent;

			}

		}


		ctx.fillStyle = "#000000";
		ctx.translate(0, -yOffset);
	}

}

function getNoteFace(n, noteGroupOrder, adjacent, faceRight, m) {
	if (n + 1 < noteGroupOrder.length) {
		if (noteGroupOrder[n + 1].pos - noteGroupOrder[n].pos === -1) {
			if (!adjacent) {
				faceRight = false;
				adjacent = true;
			}

			faceRight = arrangeNote(faceRight, m);
		} else {
			if (adjacent) {
				arrangeNote(faceRight, m);

				adjacent = false;
				faceRight = false;
			}
		}
	} else {
		if (adjacent) {
			arrangeNote(faceRight, m);

			adjacent = false;
			faceRight = false;
		}
	}

	return { adjacent: adjacent, faceRight: faceRight };
}

function drawIndividualHead(note, noteGroupOrder, n, inverse, faceRight, adjacent) {
	drawExtraStaff(note.xPos, noteGroupOrder[n].pos - 2, note.line);

	ctx.save();
	ctx.translate(note.xPos, noteGroupOrder[n].yPos);
	ctx.font = "69px Musicaf";

	var m = 1;
	if (inverse) {
		ctx.rotate(Math.PI);
		ctx.translate(-20, -15);
		m = -1;
	}

	var result = getNoteFace(n, noteGroupOrder, adjacent, faceRight, m);
	faceRight = result.faceRight;
	adjacent = result.adjacent;

	if (note.duration <= 0.25) ctx.fillText("\uD834\uDD58", 0, 0);
	else if (note.duration === 0.5) ctx.fillText("\uD834\uDD57", 0, 0);
	else if (note.duration === 1) ctx.fillText("\uD834\uDD5D", 0, 0);

	ctx.restore();
	return { adjacent: adjacent, faceRight: faceRight };
}

function drawHead(note, inverse) {
	var noteGroupOrder = note.noteGroups;
	drawNoteAccidental(note, inverse);
	var faceRight = false;
	var adjacent = false;
	var result;
	for (var n = 0; n < noteGroupOrder.length; n++) {

		result = drawIndividualHead(note, noteGroupOrder, n, inverse, faceRight, adjacent);
		faceRight = result.faceRight;
		adjacent = result.adjacent;
	}
}

function arrangeNote(faceRight, m) {
	if (m === -1) {
		ctx.translate(0, 0);
	}

	if (!faceRight) {
		ctx.translate(-2, 0);
		faceRight = true;
	} else {
		ctx.translate(12, 0);
		faceRight = false;
	}

	return faceRight;
}

function drawBeam(xStart, yStart, xEnd, yEnd) {// eslint-disable-line no-unused-vars
	ctx.beginPath();
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 5;

	ctx.moveTo(xStart, yStart);
	ctx.lineTo(xEnd, yEnd);
	ctx.stroke();
}

function drawMarker(args) {// eslint-disable-line no-unused-vars
	for (var marker in markers) {
		if (markers[marker].iPage === curIPage && lines[markers[marker].line] !== undefined) {
			var yOffset = calculateYLine(markers[marker].line, args.headerOffset);
			ctx.translate(0, yOffset);
			drawExtraStaff(markers[marker].xPos, markers[marker].y, markers[marker].line, yOffset);

			ctx.beginPath();
			ctx.lineWidth = 1;
			ctx.strokeStyle = "#000000";
			ctx.globalAlpha = 0.4;
			ctx.fillStyle = markers[marker].color;
			markers[marker].yPos = (markers[marker].line + 1) * 144 + yOffset + markers[marker].y * 8 - 5;

			ctx.fillRect(markers[marker].xPos, ((markers[marker].line + 1) * 144) + markers[marker].y * 8 - 5, 20, 26);
			ctx.rect(markers[marker].xPos, ((markers[marker].line + 1) * 144) + markers[marker].y * 8 - 5, 20, 26);
			ctx.globalAlpha = 1;
			ctx.stroke();
			ctx.translate(0, -yOffset);
		}
	}
}

function drawHeader(x, line, offset) { // eslint-disable-line no-unused-vars
	ctx.beginPath();

	ctx.lineWidth = 2;
	ctx.strokeStyle = "#0505FF";
	ctx.moveTo(x + 11, ((line + 1) * 144) + offset - 90);
	ctx.lineTo(x + 11, ((line + 1) * 144) + offset + 30);
	ctx.stroke();
	ctx.globalAlpha = 1;

	return offset;
}

function drawMarkup() {
	var offset = 0;

	ctx.font = "60px BravuraF";
	ctx.fillStyle = "black";
	ctx.textAlign = "center";
	ctx.fillText(SheetDocument.name, c.width / 2, 66);
	offset += 66;

	ctx.font = "35px BravuraF";
	ctx.fillText(SheetDocument.album, c.width / 2, offset + 50);
	ctx.textAlign = "start";
	offset += 50;

	ctx.font = "30px BravuraF";
	ctx.fillText("\uD834\uDD5F", 80, offset + 30);
	ctx.font = "20px BravuraF";
	ctx.fillText(" = " + SheetDocument.tempo, 100, offset + 30);
	ctx.textAlign = "end";
	ctx.fillText("Piano - " + (curIPage + 1), c.width - 80, offset + 30);
	ctx.textAlign = "start";
	offset += 30;


	return offset;
}

function drawBar(bar, color) { // eslint-disable-line no-unused-vars
	ctx.fillStyle = "#000000";
	var timePos = bar.initPos;

	if (bar.changedOrFirstClef || bar.changedClef) {
		drawClef(bar.clef, bar.initPos, bar.line);

		timePos += 45;
		if(bar.clef===2) {
			timePos+=14;
		}
	}
	var accidentalSum = bar.accidentals;
	var acc;
	for (var i = 0; i < bar.naturals.length; i++) {
		acc = bar.naturals[i] - 1;
		if (bar.firstAcc || bar.changedAcc) drawAccidental(timePos + (i) * 18, bar.naturalOrder, acc, bar.line, 0);
	}
	if (bar.firstAcc || bar.changedAcc) timePos += (bar.naturals.length) * 18;
	for (var i2 = 1; i2 <= accidentalSum; i2++) {
		acc = i2 - 1;
		if (bar.sharpOrFlat === -1) acc = 7 - i2;
		if (bar.firstAcc || bar.changedAcc) drawAccidental(timePos + (i2 - 1) * 18, bar.sharpOrFlat, acc, bar.line, bar.sharpOrFlat);
	}

	if (bar.firstAcc || bar.changedAcc) timePos += (accidentalSum) * 18;
	timePos += 10;
	if (bar.changedTimeSig) {
		ctx.font = "60px BravuraF";
		if (bar.upperSig >= 10 || bar.lowerSig >= 10) {
			timePos += 5;
		}

		if (bar.upperSig >= 10) {
			ctx.fillText(unescape("%u" + "E08" + (bar.upperSig / 10 >> 0)), timePos - 11, (bar.line * 144) + 95);
			ctx.fillText(unescape("%u" + "E08" + bar.upperSig % 10), timePos + 11, (bar.line * 144) + 95);
		} else {
			ctx.fillText(unescape("%u" + "E08" + bar.upperSig), timePos, (bar.line * 144) + 95);
		}

		if (bar.lowerSig >= 10) {
			ctx.fillText(unescape("%u" + "E08" + (bar.lowerSig / 10 >> 0)), timePos - 11, (bar.line * 144) + 128);
			ctx.fillText(unescape("%u" + "E08" + bar.lowerSig % 10), timePos + 11, (bar.line * 144) + 128);
		} else {
			ctx.fillText(unescape("%u" + "E08" + bar.lowerSig), timePos, (bar.line * 144) + 128);
		}

	}

	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.lineWidth = 2;
	var baseY = bar.line * 144;

	ctx.moveTo(bar.xPos, baseY + 80);
	ctx.lineTo(bar.xPos, baseY + 144);
	ctx.stroke();
}

function drawAccidental(pos, acc, note, line, sof) {
	var text = "";
	var offset;
	switch (note) {
		case 0:
			if (acc === -1) offset = 136;
			else offset = 80;
			break;
		case 1:
			offset = 104;
			break;
		case 2:
			if (acc === -1) offset = 128;
			else offset = 72;
			break;
		case 3:
			offset = 96;
			break;
		case 4:
			offset = 120;
			break;
		case 5:
			offset = 88;
			break;
		case 6:
			offset = 112;
			break;

	}

	switch (sof) {
		case 1:
			text = "\u266F"; break;
		case -1:
			text = "\u266D";
			offset -= 6;
			break;
		case 0:
			text = "\u266E";
			break;
		default:
			text = ""; break;
	}

	ctx.font = "80px Musicaf";
	ctx.fillText(text, pos, (line * 144) + offset);
}

function drawExtraStaff(x, y, rLine) {
	var line;
	if (y <= -11) {
		for (line = -11; line >= y; line -= 2) {
			ctx.beginPath();
			ctx.lineWidth = 1;
			ctx.strokeStyle = "#939393";
			ctx.moveTo(x - 5, ((rLine + 1) * 144) + line * 8 + 9);
			ctx.lineTo(x + 25, ((rLine + 1) * 144) + line * 8 + 9);
			ctx.stroke();
		}
	} else if (y >= 1) {
		for (line = 1; line <= y; line += 2) {
			ctx.beginPath();
			ctx.lineWidth = 1;
			ctx.strokeStyle = "#939393";
			ctx.moveTo(x - 5, ((rLine + 1) * 144) + line * 8 + 9);
			ctx.lineTo(x + 25, ((rLine + 1) * 144) + line * 8 + 9);
			ctx.stroke();
		}
	}
}