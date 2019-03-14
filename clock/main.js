var onYouTubePlayerAPIReady;

var params = {
    subreddit: "earthporngifs",
    subredditSort: "hot",
    supportedDomains: [
        "i.imgur.com",
        "gfycat.com",
        "giant.gfycat.com"
    ]
};

var GFYCAT_REQ_LOOKUP = 0,
    GFYCAT_REQ_GET = 1;

var fetchPosts = function(subreddit, sort, callback) {
        var req = new XMLHttpRequest();

        req.open("GET", "https://www.reddit.com/r/" + subreddit + "/" + sort + ".json", true);
        req.send();

        req.addEventListener("load", function(e) {
            var req = e.target;
            if(req.status === 200 && req.readyState === 4) {

                var posts = JSON.parse(req.response).data.children,
                    result = {};

                var i;
                for(i = 0; i < posts.length; i++) {
                    var data = posts[i].data;
                    if(!(data.is_self && data.stickied) && params.supportedDomains.indexOf(data.domain) > -1) {
                        if(result.hasOwnProperty(data.domain)) {
                            result[data.domain].push(data.url);
                        } else {
                            result[data.domain] = [];
                            result[data.domain].push(data.url);
                        }
                    }
                }

                callback(result);
            }
        }, false);
    },
    fetchGfycat = function(url, callback) {
        var requestURL,
            mode;

        var regex = /gfycat.com\/(\w*).*/;

        if(url.indexOf("gfycat.com") > -1) {
            requestURL = "https://gfycat.com/cajax/get/" + url.match(regex)[1];
            mode = GFYCAT_REQ_GET;
        } else {
            requestURL = "https://gfycat.com/cajax/checkUrl/" + url;
            mode = GFYCAT_REQ_LOOKUP;
        }

        var req = new XMLHttpRequest();
        req.open("GET", requestURL, true);
        req.send();

        req.addEventListener("load", function(e) {
            var req = e.target;
            if(req.status === 200 && req.readyState === 4) {
                var data = JSON.parse(req.response),
                    success = false;

                switch(mode) {
                    case GFYCAT_REQ_LOOKUP:
                        if(data.urlKnown) {
                            callback(true, data.webmUrl.replace("http", "https"));
                            success = true;
                        }
                        break;
                    case GFYCAT_REQ_GET:
                        if(!data.error) {
                            callback(true, data.gfyItem.webmUrl.replace("http", "https"));
                            success = true;
                        }
                        break;
                }

                if(!success) {
                    callback(false, url);
                }
            }
        }, false);
    };

function http_to_https (url) {
    return /^https/.test(url) ? url : url.replace("http", "https");
}

var handleImage = function(url) {
        let secure_url = http_to_https(url);
        if(secure_url.indexOf(".gifv") > -1) {
            handleGfycat(true, secure_url.replace("gifv", "mp4"));
        } else if(secure_url.indexOf(".gif") > -1) {
            fetchGfycat(secure_url, handleGfycat);
        } else {
            background.classList.remove("hidden");
            background.setAttribute("src");
        }
    },
    handleGfycat = function(success, url) {
        if(success) {
            videoBackground.classList.remove("hidden");
            videoBackground.setAttribute("src", url);
        } else {
            background.classList.remove("hidden");
            background.setAttribute("src", url);
        }
    };

var clock = document.getElementById("clock"),

    subreddit = document.getElementById("subreddit"),
    subredditName = document.getElementById("subreddit-name"),
    subredditSort = document.getElementById("subreddit-sort"),
    subredditChoose = document.getElementById("subreddit-choose"),
    subredditChooseInner = document.getElementById("subreddit-choose-inner"),
    subredditChooseName = document.getElementById("subreddit-choose-name"),
    subredditChooseSort = document.getElementById("subreddit-choose-sort"),
    subredditChooseChange = document.getElementById("subreddit-choose-change"),

    toggleSound = document.getElementById("toggle-sound"),
    background = document.getElementById("background")
    videoBackground = document.getElementById("video-background");

var fetchPostsCallback = function(data) {
    subredditName.textContent = subredditChooseName.value = params.subreddit;
    subredditSort.textContent = subredditChooseSort.value = params.subredditSort;

    background.removeAttribute("src");
    videoBackground.pause();
    videoBackground.removeAttribute("src");

    background.classList.add("hidden");
    videoBackground.classList.add("hidden");
    toggleSound.classList.add("hidden");

    var sites = Object.keys(data);

    var siteIndex = Math.floor(Math.random() * (sites.length)),
        urlIndex = Math.floor(Math.random() * (data[sites[siteIndex]].length));

    var site = sites[siteIndex],
        url = data[sites[siteIndex]][urlIndex];

    switch(site) {
        case "i.imgur.com":
        case "giant.gfycat.com":
            handleImage(url);
            break;
        case "gfycat.com":
            fetchGfycat(url, handleGfycat);
            break;
    }
};

subreddit.addEventListener("click", function(e) {
    if(!(e.target === subredditChoose ||
         e.target === subredditChooseInner ||
         e.target === subredditChooseName ||
         e.target === subredditChooseSort)) {
        subredditChoose.classList.toggle("hidden");
    }
}, false);

subredditChooseChange.addEventListener("click", function() {
    params.subreddit = subredditChooseName.value;
    params.subredditSort = subredditChooseSort.value;

    fetchPosts(params.subreddit, params.subredditSort, fetchPostsCallback);
}, false);

fetchPosts(params.subreddit, params.subredditSort, fetchPostsCallback);


var delay,
    setTimeString = function() {
        var date = new Date()
        var timeString = date.toLocaleTimeString().split(":");
        timeString.pop();
        clock.textContent = timeString.join(":");
        delay = (60 - date.getSeconds()) * 1000;
    };

setTimeString();
window.setTimeout(function() {
    setTimeString();
    setInterval(setTimeString, 60000);
}, delay);