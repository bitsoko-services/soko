function toggleFullScreen() {
    var doc = window.document;
    var docEl = doc.documentElement;

    var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        requestFullScreen.call(docEl);
    } else {
        cancelFullScreen.call(doc);
    }
}

//Prompt user to use app on fullscreen mode
function fullScreenMode() {
    if (localStorage.getItem("fullScreenPermission") == null) {
        $("#fullScreenPermission").modal("open")
    } else {
        if (localStorage.getItem("fullScreenPermission") == "true") {
            toggleFullScreen();
            setTimeout(function () {
                screen.orientation.lock('landscape')
            }, 500)
        }
    }
}
