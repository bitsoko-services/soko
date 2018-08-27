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
    if ($('#packPrice').html() <= shopBalance) {
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
    } else {
        M.toast({
            html: "Error! Not enough money"
        })
    }
}
$(document).on("keyup", ".packInput input", function (e) {
    var smallPack = $("#smallPaperbag").val() * 10
    var mediumPack = $("#mediumPaperbag").val() * 20
    var largePack = $("#largePaperbag").val() * 40
    var totalCost = smallPack + mediumPack + largePack
    console.log(totalCost)
    $("#packPrice").html(totalCost)
})
$(document).on("click touchstart", ".packPlus", function () {
    var input = $(this).siblings("input");
    if ($(this).siblings(".packMinus").hasClass("disabled") == true) {
        $(this).siblings(".packMinus").removeClass("disabled");
    }
    $(this).siblings("input").val(parseInt(input.val())+ 1);
})
$(document).on("click touchstart", ".packMinus", function () {
    var input = $(this).siblings("input")
    if (input.val() <= 2) {
        $(this).addClass("disabled");
    } else {
        $(this).siblings("input").val(parseInt(input.val() - 1));
    }
})
