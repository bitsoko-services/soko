$(document).on("click", "#feedBack", function () {
    $('#content > .container > div').css('display', 'none');
    $('#content > .container > .feedback').css('display', 'block');
    $(".activePage").html("Feedback")
    storeFeed();
    $('.sidenav').sidenav("close");
});

function storeFeed() {
    doFetch({
        action: 'getStoreFeed',
        store: localStorage.getItem('soko-active-store')
    }).then(function (e) {
        if (e.status == 'ok') {
            //Populate feedback
        } else {
            //Error populating feedback
            M.toast({
                html: 'Error! Try again later'
            })
        }
    }).catch(function (err) {

    });
}
