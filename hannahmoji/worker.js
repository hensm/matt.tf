"use strict";

self.importScripts("fuse.js");


let fuse;

self.addEventListener("message", ev => {
    const message = ev.data;
    switch (message.subject) {
        case "init":
            fuse = new Fuse(message.data, {
                keys: [ "tags" ]
              , shouldSort: true
              , threshold: 0
            });

            self.postMessage({
                subject: "init:response"
            });
            break;

        case "search":
            self.postMessage({
                subject: "search:response"
              , data: fuse.search(message.data)
            });
            break;
    }
});
