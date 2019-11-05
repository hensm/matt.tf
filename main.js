"use strict";

const CURSOR_CHAR = "█";
const CURSOR_STEP = 5;

const mail = document.getElementById("mail");
const mailTextNode = mail.childNodes[0];
const mailTextContent = mailTextNode.textContent;

mailTextNode.textContent = "";

const cursor = mail.appendChild(
		document.createTextNode(CURSOR_CHAR));

for (let i = 0; i < mailTextContent.length; i++) {
	setTimeout(() => {
		// Append next character
		mailTextNode.textContent += mailTextContent.charAt(i);

		// Remove cursor if at end
		if (i === mailTextContent.length - 1) {

			setInterval(() => {
				if (cursor.textContent === "") {
					cursor.textContent = CURSOR_CHAR;
				} else {
					cursor.textContent = "";
				}
			}, 500);
		}
	}, CURSOR_STEP * i);
}


let zoomLevel = 1;

window.addEventListener("wheel", ev => {
	const change = -(ev.deltaY / 10)

	if ((zoomLevel + change) > 1) {
		if ((zoomLevel + change) < 3) {
			zoomLevel += change;
		} else {
			zoomLevel = 3;
		}
	} else {
		zoomLevel = 1;
	}

	document.body.style.transformOrigin = "top left";
	document.body.style.transform = `scale(${1 * zoomLevel})`;
});
