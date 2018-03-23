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


//Fetch Enterprise Info
$(document).ready(function () {
    doFetch({
        action: 'merchantServiceLoader',
        id: localStorage.getItem("bits-user-name")
    }).then(function (e) {
        var stringifiedEntInfo = JSON.stringify(e.settings.entSettings)
        var parsedEntInfo = JSON.parse(stringifiedEntInfo);
        try {
            var serviceOne = JSON.parse(parsedEntInfo.entIconList)
        } catch (err) {

            var serviceOne = [];
        }
        try {
            var serviceTwo = JSON.parse(parsedEntInfo.entImageList)

        } catch (err) {
            var serviceTwo = [];
        }

        //Append Service One
        $(".entServiceOne").html('');
        for (var i = 0; i < serviceOne.length; ++i) {
            var servOne = serviceOne[i]
            $(".entServiceOne").append('<div class="row entServicesCardOne entServiceOneCards" count="' + i + '"> <form getVal="' + servOne.icon + '"  action="#"> <div class="file-field input-field" style="position: relative; background: url(' + servOne.icon + ');background-size: contain; background-repeat: no-repeat; background-position: 50% 50%;"> <div style="text-align: center"> <span> <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512; width: 50px;margin: 15px;" xml:space="preserve"> <path d="M479.5,113.5h-66v-9.775c0-10.12-5.534-19.397-14.441-24.209C367.564,62.496,331.928,53.5,296,53.5 c-35.928,0-71.564,8.996-103.059,26.015c-8.907,4.813-14.441,14.09-14.441,24.21v9.775h-45V106c0-12.407-10.094-22.5-22.5-22.5H51 c-12.406,0-22.5,10.093-22.5,22.5v7.755C12.461,115.734,0,129.435,0,146c0,9.723,0,238.057,0,250c0,17.92,14.579,32.5,32.5,32.5 h161.759c30.324,19.63,65.449,30,101.741,30s71.417-10.37,101.741-30H479.5c17.921,0,32.5-14.58,32.5-32.5 c0-10.01,0-204.959,0-215v-35C512,128.08,497.421,113.5,479.5,113.5z M193.5,103.725c0-4.603,2.519-8.823,6.572-11.013 C229.383,76.872,262.555,68.5,296,68.5s66.617,8.372,95.928,24.212c4.054,2.19,6.572,6.41,6.572,11.013v10.27 C368.004,94.044,332.596,83.5,296,83.5c-36.292,0-71.418,10.37-101.742,30H193.5V103.725z M43.5,106c0-4.136,3.364-7.5,7.5-7.5h60 c4.136,0,7.5,3.364,7.5,7.5v7.5h-75V106z M32.5,413.5c-9.649,0-17.5-7.851-17.5-17.5c0-11.69,0-240.272,0-250 c0-9.649,7.851-17.5,17.5-17.5h141.69c-15.038,12.883-28.058,28.133-38.355,45H37c-4.143,0-7.5,3.358-7.5,7.5 c0,4.142,3.357,7.5,7.5,7.5h90.599C115.077,214.056,108.5,242.323,108.5,271s6.577,56.945,19.099,82.5H37 c-4.143,0-7.5,3.358-7.5,7.5c0,4.142,3.357,7.5,7.5,7.5h98.834c10.298,16.867,23.319,32.116,38.356,45H32.5z M391.361,414.755 c-0.011,0.007-0.022,0.014-0.033,0.021c-0.004,0.003-0.008,0.005-0.012,0.008C363.038,433.57,330.08,443.5,296,443.5 c-34.08,0-67.038-9.93-95.316-28.716c-0.004-0.003-0.008-0.005-0.012-0.008c-0.011-0.007-0.022-0.014-0.033-0.021 c-22.1-14.691-40.793-34.578-54.06-57.509C131.48,331.146,123.5,301.323,123.5,271c0-30.322,7.98-60.146,23.079-86.245 c13.266-22.932,31.959-42.818,54.06-57.51c0.011-0.007,0.022-0.014,0.033-0.021c0.004-0.003,0.008-0.005,0.012-0.008 C228.962,108.43,261.92,98.5,296,98.5c34.098,0,67.073,9.94,95.361,28.746c22.101,14.691,40.794,34.578,54.06,57.51 C460.52,210.854,468.5,240.678,468.5,271c0,30.323-7.98,60.146-23.079,86.245C432.154,380.177,413.461,400.063,391.361,414.755z M497,173.5h-13.087c-4.143,0-7.5,3.358-7.5,7.5c0,4.142,3.357,7.5,7.5,7.5H497v165h-13.087c-4.143,0-7.5,3.358-7.5,7.5 c0,4.142,3.357,7.5,7.5,7.5H497V396c0,9.649-7.851,17.5-17.5,17.5h-61.691c16.144-13.831,29.975-30.384,40.596-48.744 C474.822,336.377,483.5,303.957,483.5,271c0-32.957-8.678-65.376-25.095-93.755c-10.621-18.36-24.451-34.913-40.595-48.745h61.69 c9.649,0,17.5,7.851,17.5,17.5V173.5z"></path> <path d="M296,143.5c-70.304,0-127.5,57.196-127.5,127.5S225.696,398.5,296,398.5S423.5,341.304,423.5,271S366.304,143.5,296,143.5 z M296,383.5c-62.032,0-112.5-50.467-112.5-112.5S233.968,158.5,296,158.5S408.5,208.967,408.5,271S358.032,383.5,296,383.5z"></path> <path d="M296,113.5c-36.205,0-71.588,12.645-99.63,35.605c-3.205,2.625-3.676,7.35-1.052,10.555 c2.624,3.205,7.35,3.674,10.554,1.051C231.242,139.939,263.25,128.5,296,128.5c78.575,0,142.5,63.925,142.5,142.5 c0,32.75-11.439,64.758-32.211,90.127c-2.624,3.205-2.153,7.93,1.052,10.555c3.201,2.621,7.927,2.156,10.554-1.052 c22.96-28.043,35.605-63.425,35.605-99.63C453.5,184.154,382.846,113.5,296,113.5z"></path> <path d="M396.682,382.34c-2.625-3.206-7.352-3.675-10.554-1.052C360.758,402.061,328.75,413.5,296,413.5 c-78.575,0-142.5-63.925-142.5-142.5c0-32.75,11.439-64.758,32.211-90.127c2.624-3.205,2.153-7.93-1.052-10.555 c-3.204-2.624-7.93-2.154-10.554,1.052C151.145,199.413,138.5,234.795,138.5,271c0,86.846,70.654,157.5,157.5,157.5 c36.205,0,71.588-12.645,99.63-35.605C398.835,390.27,399.306,385.545,396.682,382.34z"></path> </svg> </span> <input type="file" id="serviceImage" class="serviceImage serviceSection serviceImageOne" entinpt="serviceImage"> </div><div class="file-path-wrapper" style="display:none;"> <input class="file-path validate" type="text" entinpt="serviceImageNoN"> </div><div style="position: absolute; bottom: 0px; background: #353333b8; width: 100%; text-align: center; color: white;">Change Image</div></div></form> <form getVal="' + servOne.title + '"  class="col s12"> <div class="row"> <div class="input-field col s12"> <input type="text" class="validate serviceHeader serviceSection serviceHeaderOne" entinpt="skipInput" value="' + servOne.title + '"> <label for="email">Service Header</label> </div></div></form> <form getVal="' + servOne.body + '"  class="col s12"> <div class="row"> <div class="input-field col s12"> <input type="text" class="validate serviceBody serviceSection serviceBodyOne" entinpt="skipInput" value="' + servOne.body + '"> <label for="email">Service Body</label> </div></form> </div><div class="row" style="text-align: center; padding-bottom: 10px;"> <button class="btn opacitySelectedColor deleteServiceOne" style="margin-right: 25px; background: rgb(35, 31, 31); filter: brightness(1.3);"> delete </button> <button class="btn opacitySelectedColor saveServiceOne" style="padding: 0px 25px; background: rgb(35, 31, 31); filter: brightness(1.3);">Save</button> </div></div>')
        }

        if (serviceOne.length == 0) {
            $(".entServiceOne").html('nothing found :-(');
        }

        //Append Service Two
        $(".entServiceTwo").html('')
        for (var i = 0; i < serviceTwo.length; ++i) {
            var servTwo = serviceTwo[i]
            $(".entServiceTwo").append('<div class="row entServicesCardTwo entServiceTwoCards"> <form getVal="' + servTwo.icon + '"  action="#"> <div class="file-field input-field" style="position: relative; background: url(' + servTwo.icon + ');background-size: contain; background-repeat: no-repeat; background-position: 50% 50%;"> <div style="text-align: center"> <span> <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512; width: 50px;margin: 15px;" xml:space="preserve"> <path d="M479.5,113.5h-66v-9.775c0-10.12-5.534-19.397-14.441-24.209C367.564,62.496,331.928,53.5,296,53.5 c-35.928,0-71.564,8.996-103.059,26.015c-8.907,4.813-14.441,14.09-14.441,24.21v9.775h-45V106c0-12.407-10.094-22.5-22.5-22.5H51 c-12.406,0-22.5,10.093-22.5,22.5v7.755C12.461,115.734,0,129.435,0,146c0,9.723,0,238.057,0,250c0,17.92,14.579,32.5,32.5,32.5 h161.759c30.324,19.63,65.449,30,101.741,30s71.417-10.37,101.741-30H479.5c17.921,0,32.5-14.58,32.5-32.5 c0-10.01,0-204.959,0-215v-35C512,128.08,497.421,113.5,479.5,113.5z M193.5,103.725c0-4.603,2.519-8.823,6.572-11.013 C229.383,76.872,262.555,68.5,296,68.5s66.617,8.372,95.928,24.212c4.054,2.19,6.572,6.41,6.572,11.013v10.27 C368.004,94.044,332.596,83.5,296,83.5c-36.292,0-71.418,10.37-101.742,30H193.5V103.725z M43.5,106c0-4.136,3.364-7.5,7.5-7.5h60 c4.136,0,7.5,3.364,7.5,7.5v7.5h-75V106z M32.5,413.5c-9.649,0-17.5-7.851-17.5-17.5c0-11.69,0-240.272,0-250 c0-9.649,7.851-17.5,17.5-17.5h141.69c-15.038,12.883-28.058,28.133-38.355,45H37c-4.143,0-7.5,3.358-7.5,7.5 c0,4.142,3.357,7.5,7.5,7.5h90.599C115.077,214.056,108.5,242.323,108.5,271s6.577,56.945,19.099,82.5H37 c-4.143,0-7.5,3.358-7.5,7.5c0,4.142,3.357,7.5,7.5,7.5h98.834c10.298,16.867,23.319,32.116,38.356,45H32.5z M391.361,414.755 c-0.011,0.007-0.022,0.014-0.033,0.021c-0.004,0.003-0.008,0.005-0.012,0.008C363.038,433.57,330.08,443.5,296,443.5 c-34.08,0-67.038-9.93-95.316-28.716c-0.004-0.003-0.008-0.005-0.012-0.008c-0.011-0.007-0.022-0.014-0.033-0.021 c-22.1-14.691-40.793-34.578-54.06-57.509C131.48,331.146,123.5,301.323,123.5,271c0-30.322,7.98-60.146,23.079-86.245 c13.266-22.932,31.959-42.818,54.06-57.51c0.011-0.007,0.022-0.014,0.033-0.021c0.004-0.003,0.008-0.005,0.012-0.008 C228.962,108.43,261.92,98.5,296,98.5c34.098,0,67.073,9.94,95.361,28.746c22.101,14.691,40.794,34.578,54.06,57.51 C460.52,210.854,468.5,240.678,468.5,271c0,30.323-7.98,60.146-23.079,86.245C432.154,380.177,413.461,400.063,391.361,414.755z M497,173.5h-13.087c-4.143,0-7.5,3.358-7.5,7.5c0,4.142,3.357,7.5,7.5,7.5H497v165h-13.087c-4.143,0-7.5,3.358-7.5,7.5 c0,4.142,3.357,7.5,7.5,7.5H497V396c0,9.649-7.851,17.5-17.5,17.5h-61.691c16.144-13.831,29.975-30.384,40.596-48.744 C474.822,336.377,483.5,303.957,483.5,271c0-32.957-8.678-65.376-25.095-93.755c-10.621-18.36-24.451-34.913-40.595-48.745h61.69 c9.649,0,17.5,7.851,17.5,17.5V173.5z"></path> <path d="M296,143.5c-70.304,0-127.5,57.196-127.5,127.5S225.696,398.5,296,398.5S423.5,341.304,423.5,271S366.304,143.5,296,143.5 z M296,383.5c-62.032,0-112.5-50.467-112.5-112.5S233.968,158.5,296,158.5S408.5,208.967,408.5,271S358.032,383.5,296,383.5z"></path> <path d="M296,113.5c-36.205,0-71.588,12.645-99.63,35.605c-3.205,2.625-3.676,7.35-1.052,10.555 c2.624,3.205,7.35,3.674,10.554,1.051C231.242,139.939,263.25,128.5,296,128.5c78.575,0,142.5,63.925,142.5,142.5 c0,32.75-11.439,64.758-32.211,90.127c-2.624,3.205-2.153,7.93,1.052,10.555c3.201,2.621,7.927,2.156,10.554-1.052 c22.96-28.043,35.605-63.425,35.605-99.63C453.5,184.154,382.846,113.5,296,113.5z"></path> <path d="M396.682,382.34c-2.625-3.206-7.352-3.675-10.554-1.052C360.758,402.061,328.75,413.5,296,413.5 c-78.575,0-142.5-63.925-142.5-142.5c0-32.75,11.439-64.758,32.211-90.127c2.624-3.205,2.153-7.93-1.052-10.555 c-3.204-2.624-7.93-2.154-10.554,1.052C151.145,199.413,138.5,234.795,138.5,271c0,86.846,70.654,157.5,157.5,157.5 c36.205,0,71.588-12.645,99.63-35.605C398.835,390.27,399.306,385.545,396.682,382.34z"></path> </svg> </span> <input type="file" id="serviceImage" class="serviceImage serviceSection serviceImageTwo" entinpt="serviceImage"> </div><div class="file-path-wrapper" style="display:none;"> <input class="file-path validate" type="text" entinpt="serviceImageNoN"> </div><div style="position: absolute; bottom: 0px; background: #353333b8; width: 100%; text-align: center; color: white;">Change Image</div></div></form> <form getVal="' + servTwo.title + '"  class="col s12"> <div class="row"> <div class="input-field col s12"> <input type="text" class="validate serviceHeader serviceSection serviceHeaderTwo" entinpt="skipInput" value="' + servTwo.title + '"> <label for="email">Service Header</label> </div></div></form> <form getVal="' + servTwo.body + '"  class="col s12"> <div class="row"> <div class="input-field col s12"> <input type="text" class="validate serviceBody serviceSection serviceBodyTwo" entinpt="skipInput" value="' + servTwo.body + '"> <label for="email">Service Body</label> </div></form> </div><div class="row" style="text-align: center; padding-bottom: 10px;"> <button class="btn opacitySelectedColor deleteServiceTwo" style="margin-right: 25px; background: rgb(35, 31, 31); filter: brightness(1.3);"> delete </button> <button class="btn opacitySelectedColor saveServiceTwo" style="padding: 0px 25px; background: rgb(35, 31, 31); filter: brightness(1.3);">Save</button> </div></div>')
        }

        if (serviceTwo.length == 0) {
            $(".entServiceTwo").html('nothing found :-(');
        }

    })
})


//Delete Service One
$(document).on("click", ".deleteServiceOne", function () {
    var servDelete = $(this).parent().parent().attr("count");
});
