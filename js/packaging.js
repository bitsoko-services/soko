function showPackagingPage() {
    $('#content > .container > div').css('display', 'none');
    $(".activePage").html("Packaging");
    setTimeout(function () {
        $('.packaging').css('display', 'block');
    }, 300)
}

function packagingData() {
    var packagingData = [];
    packagingData["smallPaperBag"] = $("#smallPaperbag").val();
    packagingData["mediumPaperbag"] = $("#mediumPaperbag").val();
    packagingData["largePaperbag"] = $("#largePaperbag").val();
    doFetch({
        action: 'requestPack',
        id: localStorage.getItem('soko-active-store'),
        items: packagingData
    }).then(function (e) {
        if (e.status == "ok") {
            M.toast({
                html: "Request sent successfully"
            })
        } else {
            M.toast({
                html: "Error! Try again later"
            })
        }
    }).catch(function (err) {
        M.toast({
            html: "Error! Try again later"
        })
    });
}
