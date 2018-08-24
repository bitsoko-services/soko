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
$(document).on("keyup", ".packInput input", function (e) {
    var smallPack = $("#smallPaperbag").val() * 10
    var mediumPack = $("#mediumPaperbag").val() * 20
    var largePack = $("#largePaperbag").val() * 40
    var totalCost = smallPack + mediumPack + largePack
    console.log(totalCost)
    $("#packPrice").html(totalCost)
})
