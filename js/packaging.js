function showPackagingPage() {
    $('#content > .container > div').css('display', 'none');
    $(".activePage").html("Packaging");
    setTimeout(function () {
        $('.packaging').css('display', 'block');
    }, 300)
}

function packagingData() {
    var packagingData = [];
    if ($("#smallPaperbag").prop("disabled") == false) {
        packagingData["small"] = $("#smallPaperbag").val();
    }
    if ($("#mediumPaperbag").prop("disabled") == false) {
        packagingData["medium"] = $("#mediumPaperbag").val();
    }
    if ($("#largePaperbag").prop("disabled") == false) {
        packagingData["large"] = $("#largePaperbag").val();
    }

    if ($('#packPrice').html().replace(/[^0-9\.]+/g, '') <= shopBalance) {
        doFetch({
            action: 'requestPack',
            id: localStorage.getItem('soko-active-store'),
            items: packagingData,
            type: "paperbags"
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
        //creditTopup = $("#packPrice").html();
        getInsufficientFundsOrderbook($("#packPrice").html()).then(function(r){

            doFetch({
            action: 'requestPack',
            id: localStorage.getItem('soko-active-store'),
            items: packagingData,
            type: "paperbags"
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

        });
    }
}

function packagingTotalCost() {
    var smallPack = $("#smallPaperbag").val() * 10
    var mediumPack = $("#mediumPaperbag").val() * 20
    var largePack = $("#largePaperbag").val() * 40
    if ($("#smallPaperbag").prop("disabled") == true) {
        smallPack = 0
    }
    if ($("#mediumPaperbag").prop("disabled") == true) {
        mediumPack = 0
    }
    if ($("#largePaperbag").prop("disabled") == true) {
        largePack = 0
    }
    var totalCost = smallPack + mediumPack + largePack
    $("#packPrice").html(totalCost + " " + baseCd)
}
$(document).on("keyup", ".packInput input", function (e) {
    packagingTotalCost()
})
$(document).on("click touchstart", ".packPlus", function () {
    var input = $(this).siblings("input");
    if ($(this).siblings(".packMinus").hasClass("disabled") == true) {
        if (input.val() > 49) {
            $(this).siblings(".packMinus").removeClass("disabled");
        }
    }
    $(this).siblings("input").val(parseInt(input.val()) + 1);
    packagingTotalCost()
})
$(document).on("click touchstart", ".packMinus", function () {
    var input = $(this).siblings("input")
    if (input.val() < 51) {
        $(this).addClass("disabled");
    } else {
        $(this).siblings("input").val(parseInt(input.val() - 1));
        packagingTotalCost()
    }
});
$(document).on("click touchstart", ".packCheckbox", function () {
    var checked = $(this).prop("checked");
    if (checked == true) {
        $(this).siblings(".packCounter").find("button").attr("disabled", false);
        $(this).siblings(".packCounter").find("input").attr("disabled", false);
        $(this).siblings(".packCounter").find("button").removeClass("disabled");
    } else {
        $(this).siblings(".packCounter").find("button").attr("disabled", true);
        $(this).siblings(".packCounter").find("input").attr("disabled", true);
        $(this).siblings(".packCounter").find("button").addClass("disabled");
    }
    packagingTotalCost();
})
