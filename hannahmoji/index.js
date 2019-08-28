"use strict";

const AVATAR_ID_HANNAH = "191405008_41-s5";
const AVATAR_ID_ME = "191405008_41-s5";
//const AVATAR_ID_ME     = "519634393_3-s5";


// Elements
const elEmoji            = document.querySelector(".emoji")
const elEmojiImage       = document.querySelector(".emoji__image");
const elEmojiTitle       = document.querySelector(".emoji__title");
const elEmojiDescription = document.querySelector(".emoji__description");
const elSearch           = document.querySelector(".search");
const elSearchInput      = document.querySelector(".search__input");
const elCanvas           = document.querySelector("#canvas");

elSearchInput.value = "";

function fitCanvas () {
    elCanvas.width = window.innerWidth;
    elCanvas.height = window.innerHeight;
}

fitCanvas();

window.addEventListener("resize", fitCanvas);



function displayEmoji (template, avatarId1, avatarId2) {
    const url = template.src
            .replace("%s", avatarId1)
            .replace("%s", avatarId2);

    elEmojiImage.srcset = `
            ${url},
            ${url}&scale=2 2x`;

    elEmojiTitle.textContent = template.alt_text;
    elEmojiDescription.textContent = template.descriptive_alt_text;
}


function getRandomTemplate (templates) {
    return templates[Math.floor(Math.random() * templates.length)];
}


fetch("templates.json")
    .then(res => res.json())
    .then(init)
    .catch(err => {
        console.error(err);
    });

function buildWorker (data, onResults) {
    return new Promise ((resolve, reject) => {
        const worker = new Worker("worker.js");

        worker.postMessage({
            subject: "init"
          , data: data
        });

        worker.addEventListener("message", ev => {
            const message = ev.data;

            switch (message.subject) {
                case "init:response": {
                    resolve(worker);
                    break;
                };
                case "search:response": {
                    onResults(message.data);
                    break;
                }
            }
            if (ev.data.subject === "init:response") {
                resolve(worker);
            }
        });
    });
}

async function init (res) {
    const templates = res.imoji.concat(res.friends);

    // Limit DPI to 2
    const dpi = Math.min(window.devicePixelRatio, 2);


    TagCanvas.Start("canvas", null, {
        imageMode: "image"
      , imageScale: (0.5 / dpi)
      , noTagsMessage: false
      , pinchZoom: true
      , zoom: 1.25
      , reverse: true
      , maxSpeed: 0.025
    });


    function onResults (results) {
        // Clear tags
        while (elCanvas.firstChild) {
            elCanvas.removeChild(elCanvas.firstChild);
        }

        for (const result of results) {
            const url = result.src
                    .replace("%s", AVATAR_ID_HANNAH)
                    .replace("%s", AVATAR_ID_ME);

            const tag = document.createElement("a");
            const img = document.createElement("img");

            img.src = `${url}&scale=${dpi}`;

            tag.addEventListener("click", ev => {
                ev.preventDefault();
                
                displayEmoji(result, AVATAR_ID_HANNAH, AVATAR_ID_ME);
            });

            tag.appendChild(img);
            canvas.appendChild(tag);
        }

        TagCanvas.Reload("canvas");
        TagCanvas.SetSpeed("canvas", [ 0.05, -0.05 ]);
    }

    let worker = await buildWorker(templates, onResults);
    let hasSearched = false;

    let timeout;

    elSearchInput.addEventListener("input", async ev => {
        if (!ev.target.value) {
            return;
        }

        window.clearTimeout(timeout);
        window.setTimeout(async () => {
            if (hasSearched) {
                hasSearched = false;
                worker.terminate();
                worker = await buildWorker(templates, onResults);
            }

            worker.postMessage({
                subject: "search"
              , data: ev.target.value
            });

            hasSearched = true;
        }, 500);
    });
}
