function showPackagingPage() {
    $('#content > .container > div').css('display', 'none');
    $(".activePage").html("Packaging");
    setTimeout(function() {
        $('.packaging').css('display', 'block');
    }, 300)
}

function packagingDataArray() {
    promise1 = new Promise(function(resolve, reject) {
        var packagingDataArray = {};
        var wrappingBagDataArray = {};
        if (packagingType == "paperBag") {
            if ($("#smallPaperbag").prop("disabled") == false) {
                packagingDataArray["small"] = $("#smallPaperbag").val();
            } else {
                packagingDataArray["small"] = "0"
            }
            if ($("#mediumPaperbag").prop("disabled") == false) {
                packagingDataArray["medium"] = $("#mediumPaperbag").val();
            } else {
                packagingDataArray["medium"] = "0"
            }
            if ($("#largePaperbag").prop("disabled") == false) {
                packagingDataArray["large"] = $("#largePaperbag").val();
            } else {
                packagingDataArray["large"] = "0"
            }
            resolve(packagingDataArray);
        } else {
            if ($("#wrappingBagTiny").prop("checked") == true) {
                wrappingBagDataArray["tiny-1"] = $("#wrappingTiny-1").val()
            }else{
                wrappingBagDataArray["tiny-1"] = "0"
            }
            if ($("#wrappingBagSmall").prop("checked") == true) {
                wrappingBagDataArray["small-3"] = $("#wrappingSmall-3").val()
            }else{
                wrappingBagDataArray["small-3"] = "0"
            }
            if ($("#wrappingBagMedium").prop("checked") == true) {
                wrappingBagDataArray["meduim-5"] = $("#wrappingMeduim-5").val()
            }else{
                wrappingBagDataArray["meduim-5"] = "0"
            }
            if ($("#wrappingBagLarge").prop("checked") == true) {
                wrappingBagDataArray["large-8"] = $("#wrappingLarge-8").val()
            }else{
                wrappingBagDataArray["large-8"] = "0"
            }
            resolve(wrappingBagDataArray);
        }
    });
}
$(document).on("click touchstart", ".packagingCheckout", function() {
    activePackaging = $(this).attr('packagingType');
    packagingDataArray()
    packagingData()
})

function packagingData() {
    if (packagingType == "paperBag") {} else {}

    promise1.then(function(value) {
        if ($('.packPrice').html().replace(/[^0-9\.]+/g, '') <= shopBalance) {
            doFetch({
                action: 'requestPack',
                id: localStorage.getItem('soko-active-store'),
                items: value,
                type: packagingType,
                trHash: ""
            }).then(function(e) {
                if (e.status == "ok") {
                    M.toast({
                        html: "Request sent successfully"
                    })
                } else {
                    M.toast({
                        html: "Error! Try again later"
                    })
                }
            }).catch(function(err) {
                M.toast({
                    html: "Error! Try again later"
                })
            });
        } else {
            //creditTopup = $(".packPrice").html();
            getInsufficientFundsOrderbook($(".packPrice").html()).then(function(r) {

                doFetch({
                    action: 'requestPack',
                    id: localStorage.getItem('soko-active-store'),
                    items: value,
                    type: "paperbags"
                }).then(function(e) {
                    if (e.status == "ok") {
                        M.toast({
                            html: "Request sent successfully"
                        })
                    } else {
                        M.toast({
                            html: "Error! Try again later"
                        })
                    }
                }).catch(function(err) {
                    M.toast({
                        html: "Error! Try again later"
                    })
                });

            });
        }
    });
}

function packagingTotalCost() {
    var packagingType = $(this).attr('packagingType');
    var smallPack = $("#smallPaperbag").val() * 10
    var mediumPack = $("#mediumPaperbag").val() * 20
    var largePack = $("#largePaperbag").val() * 40
    var tinyWrappingBag = $("#wrappingTiny-1").val() * 5
    var smallWrappingBag = $("#wrappingSmall-3").val() * 10
    var meduiumWrappingBag = $("#wrappingMeduim-5").val() * 15
    var largeWrappingBag = $("#wrappingLarge-8").val() * 20

    if (packagingType == 'paperBag') {
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
        $(".packPrice").html(totalCost + " " + baseCd)
    } else {
        if ($("#wrappingBagTiny").prop("checked") == false) {
            tinyWrappingBag = 0
        }
        if ($("#wrappingBagSmall").prop("checked") == false) {
            smallWrappingBag = 0
        }
        if ($("#wrappingBagMedium").prop("checked") == false) {
            meduiumWrappingBag = 0
        }
        if ($("#wrappingBagLarge").prop("checked") == false) {
            largeWrappingBag = 0
        }
        var totalCost = tinyWrappingBag + smallWrappingBag + meduiumWrappingBag + largeWrappingBag
        $(".packPrice").html(totalCost + " " + baseCd)
    }

}
$(document).on("keyup", ".packInput input", function(e) {
    packagingTotalCost()
})
$(document).on("click touchstart", ".packPlus", function() {
    var input = $(this).siblings("input");
    if ($(this).siblings(".packMinus").hasClass("disabled") == true) {
        if (input.val() > 49) {
            $(this).siblings(".packMinus").removeClass("disabled");
        }
    }
    $(this).siblings("input").val(parseInt(input.val()) + 1);
    packagingTotalCost()
})
$(document).on("click touchstart", ".packMinus", function() {
    var input = $(this).siblings("input");
    if (input.val() < 51) {
        $(this).addClass("disabled");
    } else {
        $(this).siblings("input").val(parseInt(input.val() - 1));
        packagingTotalCost()
    }
});
$(document).on("click touchstart", ".packCheckbox", function() {
    var checked = $(this).prop("checked");
    packagingType = $(this).attr('packagingType');
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
