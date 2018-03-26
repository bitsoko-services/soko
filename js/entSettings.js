var srcData;

//Open Enterprise Settings Page
$(document).on("click", "#entSettings", function () {
    $('#content > .container > div').css('display', 'none');
    $('#content > .container > .entSettings').css('display', 'block');
    $(".activePage").html("Enterprise Settings")
});


//Show Hide Managers
$(document).on("click", "#showHideMngr", function () {
    var mngrState = $("#showHideMngr").prop("checked");
    doFetch({
        action: 'entSettings',
        id: localStorage.getItem('soko-owner-id'),
        value: mngrState,
        prop: "showManagers"
    }).then(function (e) {
        if (e.status == 'ok') {} else {}
    });
})

//Activate / Deactive Token Sale
$("#tkSaleSet").click(function () {
    var mngrState = $("#tkSaleSet").prop("checked");
    doFetch({
        action: 'entSettings',
        id: localStorage.getItem('soko-owner-id'),
        value: mngrState,
        prop: "showTokens"
    }).then(function (e) {
        if (e.status == 'ok') {
            M.toast({
                html: 'Activated successfully',
                displayLength: 3000
            })
        } else {
            M.toast({
                html: 'Ooops! Try again later',
                displayLength: 3000
            })
        }
    });
})

//Append Service Card
$(document).on("click", "#addEntServiceOne", function () {
    if ($(".entServiceOneCards").length >= 4) {
        M.toast({
            html: 'You have reached the maximum number of services',
            displayLength: 3000
        })
    } else {
        $("#addEntServiceOne").modal('open');
    }
});
$(document).on("click", "#addEntServiceTwo", function () {
    if ($(".entServiceTwoCards").length >= 4) {
        M.toast({
            html: 'You have reached the maximum number of services',
            displayLength: 3000
        })
    } else {
        $('#addEntServiceTwo').modal("open");
    }
});

function base64Ent(imgId) {
    var filesSelected = document.getElementById(imgId[0].id).files;
    if (filesSelected.length > 0) {
        var fileToLoad = filesSelected[0];
        var fileReader = new FileReader();

        fileReader.onload = function (fileLoadedEvent) {
            srcData = fileLoadedEvent.target.result; // <--- data: base64

        }
        fileReader.readAsDataURL(fileToLoad);
    }
}

//Add New Enterprise Service One
$(document).on("click", "#saveEntServOne", function (imgId) {
    var getImageID = $(this).parent().parent().find(".entServiceImage")
    imgId = getImageID
    base64Ent(imgId)
    if ($("#entServOneImg").val() == "") {
        M.toast({
            html: 'Error! Please add an image',
            displayLength: 3000
        })
    } else if ($("#serviceOneHeader").val() == "") {
        M.toast({
            html: 'Error! Please add a title',
            displayLength: 3000
        })
    } else if ($("#serviceOneBody").val() == "") {
        M.toast({
            html: 'Error! Please add a body',
            displayLength: 3000
        })
    } else {
        var icon = srcData
        var title = $("#serviceOneHeader").val()
        var body = $("#serviceOneBody").val()
        //Fetch Enterprise Info
        $(document).ready(function () {
            doFetch({
                action: 'merchantServiceLoader',
                id: localStorage.getItem("bits-user-name")
            }).then(function (e) {
                var stringifiedEntInfo = JSON.stringify(e.settings.entSettings)
                var parsedEntInfo = JSON.parse(stringifiedEntInfo)
                var serviceOne = JSON.parse(parsedEntInfo.entIconList)


                serviceOne.push({
                    icon,
                    title,
                    body
                })
                doFetch({
                    action: 'entSettings',
                    id: localStorage.getItem('soko-owner-id'),
                    value: JSON.stringify(serviceOne),
                    prop: "entIconList"
                }).then(function (e) {
                    if (e.status == 'ok') {
                        M.toast({
                            html: 'Added successfully',
                            displayLength: 3000
                        })

                    }
                });

            })
        })
    }
});


//Add New Enterprise Service Two
$(document).on("click", "#saveEntServTwo", function (imgId) {
    var getImageID = $(this).parent().parent().find(".entServiceImage")
    imgId = getImageID
    base64Ent(imgId)
    if ($("#entServTwoImg").val() == "") {
        M.toast({
            html: 'Error! Please add an image',
            displayLength: 3000
        })
    } else if ($("#serviceTwoHeader").val() == "") {
        M.toast({
            html: 'Error! Please add a title',
            displayLength: 3000
        })
    } else if ($("#serviceTwoBody").val() == "") {
        M.toast({
            html: 'Error! Please add a body',
            displayLength: 3000
        })
    } else {
        var icon = srcData
        var title = $("#serviceTwoHeader").val()
        var body = $("#serviceTwoBody").val()
        //Fetch Enterprise Info
        $(document).ready(function () {
            doFetch({
                action: 'merchantServiceLoader',
                id: localStorage.getItem("bits-user-name")
            }).then(function (e) {
                var stringifiedEntInfo = JSON.stringify(e.settings.entSettings)
                var parsedEntInfo = JSON.parse(stringifiedEntInfo)
                var serviceTwo = JSON.parse(parsedEntInfo.entImageList)


                serviceTwo.push({
                    icon,
                    title,
                    body
                })
                doFetch({
                    action: 'entSettings',
                    id: localStorage.getItem('soko-owner-id'),
                    value: JSON.stringify(serviceTwo),
                    prop: "entImageList"
                }).then(function (e) {
                    if (e.status == 'ok') {
                        M.toast({
                            html: 'Added successfully',
                            displayLength: 2000
                        })
                    }
                });

            })
        })
    }
});

$(document).on("change", ".entSettings input", function (imgId) {
    var inputChanged = $(this);
    var entInput = $(this).attr("entInpt")
    var entServiceImgId = $(this).attr("id")
    if (entInput == "checkbox") {
        console.log("checkbox")
    } else if (entInput == "skipBannerInpt") {} else if (entInput == "skipInput") {

    } else if (entInput == "serviceImageNoN") {} else if (entInput == "serviceImage") {
        var currentInput = $(this);
        imgId = inputChanged
        base64Ent(imgId)
        setTimeout(function () {
            currentInput.parent().parent().parent().attr("getval", srcData)
        }, 2000);
    } else if (entInput == "entBanner") {
        imgId = inputChanged
        base64Ent(imgId)
        setTimeout(function () {
            doFetch({
                action: 'entSettings',
                id: localStorage.getItem('soko-owner-id'),
                value: srcData,
                prop: "entBanner"
            }).then(function (e) {
                if (e.status == 'ok') {
                    M.toast({
                        html: 'Added successfully',
                        displayLength: 3000
                    })
                } else {}
            });
        }, 2000);
    } else {
        var getProp = inputChanged.attr("entinpt");
        var inputVal = inputChanged.val();
        console.log(inputVal)
        doFetch({
            action: 'entSettings',
            id: localStorage.getItem('soko-owner-id'),
            value: inputVal,
            prop: getProp
        }).then(function (e) {
            if (e.status == 'ok') {
                M.toast({
                    html: 'Added successfully',
                    displayLength: 3000
                })
            } else {}
        });
    }
})



$(document).on("click", ".saveServiceOne", function () {
    //get card content
    var allCards = $(".entServicesCardOne");
    console.log(allCards)
    var servOneObj = []

    for (var i = 0; i < allCards.length; ++i) {
        var icon = allCards[i].children[0].attributes[0].textContent
        var title = allCards[i].children[1][0].value
        var body = allCards[i].children[2][0].value
        sectionOneServArray = {
            icon,
            title,
            body
        }
        servOneObj.push(sectionOneServArray)
    }

    var finalArray = servOneObj
    doFetch({
        action: 'entSettings',
        id: localStorage.getItem('soko-owner-id'),
        value: JSON.stringify(finalArray),
        prop: "entIconList"
    }).then(function (e) {
        if (e.status == 'ok') {} else {}
    });
})
$(document).on("click", ".saveServiceTwo", function () {
    //get card content
    var allCards = $(".entServicesCardTwo");
    console.log(allCards)
    var servOneObj = []

    for (var i = 0; i < allCards.length; ++i) {
        var icon = allCards[i].children[0].attributes[0].textContent
        var title = allCards[i].children[1][0].value
        var body = allCards[i].children[2][0].value
        sectionOneServArray = {
            icon,
            title,
            body
        }
        servOneObj.push(sectionOneServArray)
    }

    var finalArray = servOneObj
    doFetch({
        action: 'entSettings',
        id: localStorage.getItem('soko-owner-id'),
        value: JSON.stringify(finalArray),
        prop: "entIconList"
    }).then(function (e) {
        if (e.status == 'ok') {} else {}
    });
})


//Delete Service One
$(document).on("click", ".deleteServiceOne", function () {
    var servDelete = $(this).parent().parent().attr("count");
});
