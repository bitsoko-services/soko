var srcData;

$(document).on("click", "#entSettings", function () {
    $('#content > .container > div').css('display', 'none');
    $('#content > .container > .settingsPage').css('display', 'block');
    $(".activePage").html("")
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
        setTimeout(function () {
            if ($(".entServicesCardOne").length == 0) {
                var sectionOneCard = []
                var icon = srcData
                var title = $("#serviceOneHeader").val()
                var body = $("#serviceOneBody").val()

                var serviceOneArray = {
                    icon,
                    title,
                    body
                }
                sectionOneCard.push(serviceOneArray)
                doFetch({
                    action: 'entSettings',
                    id: localStorage.getItem('soko-owner-id'),
                    value: JSON.stringify(sectionOneCard),
                    prop: "entIconList"
                }).then(function (e) {
                    if (e.status == 'ok') {
                        M.toast({
                            html: 'Added successfully',
                            displayLength: 3000
                        })
                        $("#addEntServiceOne").modal("close")
                    }
                });
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
                                $("#addEntServiceOne").modal("close")
                            }
                        });

                    })
                })
            }
        }, 2000);
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
        setTimeout(function () {
            if ($(".entServicesCardTwo").length == 0) {
                var sectionOneCard = []
                var icon = srcData
                var title = $("#serviceTwoHeader").val()
                var body = $("#serviceTwoBody").val()

                var serviceOneArray = {
                    icon,
                    title,
                    body
                }
                sectionOneCard.push(serviceOneArray)
                doFetch({
                    action: 'entSettings',
                    id: localStorage.getItem('soko-owner-id'),
                    value: JSON.stringify(sectionOneCard),
                    prop: "entImageList"
                }).then(function (e) {
                    if (e.status == 'ok') {
                        M.toast({
                            html: 'Added successfully',
                            displayLength: 3000
                        })
                        $("#addEntServiceTwo").modal("close")
                    }
                });
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
                            prop: "entImageList"
                        }).then(function (e) {
                            if (e.status == 'ok') {
                                M.toast({
                                    html: 'Added successfully',
                                    displayLength: 3000
                                })
                                $("#addEntServiceTwo").modal("close")
                            }
                        });

                    })
                })
            }
        }, 2000);
    }
});


$(document).on("change", ".entSettings input", function (imgId) {
    var inputChanged = $(this);
    var entInput = $(this).attr("entInpt")
    var entServiceImgId = $(this).attr("id")
    if (entInput == "checkbox") {
        console.log("checkbox")
    } else if (entInput == "skipBannerInpt") {} else if (entInput == "newEnt") {} else if (entInput == "skipInput") {

    } else if (entInput == "serviceImageNoN") {} else if (entInput == "serviceImage") {
        var currentInput = $(this);
        imgId = currentInput
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
        if (e.status == 'ok') {
            M.toast({
                html: 'Added successfully',
                displayLength: 3000
            })
        } else {
            M.toast({
                html: 'Error! Try again later',
                displayLength: 3000
            })
        }
    });
})
$(document).on("click", ".saveServiceTwo", function () {
    //get card content
    var allCards = $(".entServicesCardTwo");
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
        prop: "entImageList"
    }).then(function (e) {
        if (e.status == 'ok') {
            M.toast({
                html: 'Added successfully',
                displayLength: 3000
            })
        } else {
            M.toast({
                html: 'Error! Try again later',
                displayLength: 3000
            })
        }
    });
})


//Delete Service One
$(document).on("click", ".deleteServiceOne", function () {
    $(this).parent().parent().remove();
    M.toast({
        html: 'Please wait...',
        displayLength: 100000,
        classes: "deleteServToast"
    })
    setTimeout(function () {
        //get card content
        var allCards = $(".entServicesCardOne");
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
            if (e.status == 'ok') {
                M.toast({
                    html: 'Removed successfully',
                    displayLength: 3000
                });
                $(".deleteServToast").remove();
            } else {
                M.toast({
                    html: 'Error! Try again later',
                    displayLength: 3000
                })
            }
        });
    }, 1000);
});

$(document).on("click", ".deleteServiceTwo", function () {
    $(this).parent().parent().remove();
    M.toast({
        html: 'Please wait...',
        displayLength: 100000,
        classes: "deleteServToast"
    })
    setTimeout(function () {
        //get card content
        var allCards = $(".entServicesCardTwo");
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
            prop: "entImageList"
        }).then(function (e) {
            if (e.status == 'ok') {
                M.toast({
                    html: 'Removed successfully',
                    displayLength: 3000
                });
                $(".deleteServToast").remove();
            } else {
                M.toast({
                    html: 'Error! Try again later',
                    displayLength: 3000
                })
            }
        });
    }, 1000);
});

//New Enterprise
$(document).on("click", "#businessDomainMonthly", function () {
    if ($("#businessDomainInput").val() == "") {
        M.toast({
            html: 'Please enter a domain',
            displayLength: 3000
        })
    } else {
        doFetch({
            action: 'checkEnterpriseDomain',
            domain: $("#businessDomainInput").val()
        }).then(function (e) {
            if (e.status == 'ok') {
                if (sessionStorage.getItem('walletKey')) {
                    if ((allTokens["0xb72627650f1149ea5e54834b2f468e5d430e67bf"].balance / Math.pow(10, allTokens["0xb72627650f1149ea5e54834b2f468e5d430e67bf"].decimals)) * (allTokens["0xb72627650f1149ea5e54834b2f468e5d430e67bf"].rate * baseX * baseConv) > 500) {
                        var totCost = parseFloat(500);
                        transferTokenValue('0x7D1Ce470c95DbF3DF8a3E87DCEC63c98E567d481', "0xb72627650f1149ea5e54834b2f468e5d430e67bf", totCost, allTokens["0xb72627650f1149ea5e54834b2f468e5d430e67bf"].rate).then(function (res) {
                            console.log(res);
                            doFetch({
                                action: 'domainPay',
                                id: localStorage.getItem('soko-owner-id'),
                                domain: $("#businessDomainInput").val() + $("#domainSuffix").val(),
                                period: "monthly",
                                trHash: res
                            }).then(function (e) {
                                if (e.status == 'ok') {
                                    M.toast({
                                        html: 'Enterprise created successfully',
                                        displayLength: 3000
                                    });
                                } else {
                                    M.toast({
                                        html: 'Error! Try again later',
                                        displayLength: 3000
                                    })
                                }
                            });
                        })
                    } else {
                        var toastHTML = '<span>You have insufficient funds</span><a href="https://bitsoko.io/tm/?cid=0xb72627650f1149ea5e54834b2f468e5d430e67bf" target="_blank"><button class="btn-flat toast-action">buy</button></a>';
                        M.toast({
                            html: toastHTML
                        });
                    }
                } else {
                    var toastHTML = '<span>Unlock wallet to register</span><button class="btn-flat toast-action" onclick="walletStatus()">unlock</button>';
                    M.toast({
                        html: toastHTML
                    });
                }
            } else {
                M.toast({
                    html: 'Domain not available',
                    displayLength: 3000
                })
            }
        });
    }
});

$(document).on("click", "#businessDomainYealy", function () {
    if ($("#businessDomainInput").val() == "") {
        M.toast({
            html: 'Please enter a domain',
            displayLength: 3000
        })
    } else {
        doFetch({
            action: 'checkEnterpriseDomain',
            domain: $("#businessDomainInput").val()
        }).then(function (e) {
            if (e.status == 'ok') {
                if (sessionStorage.getItem('walletKey')) {
                    if ((allTokens["0xb72627650f1149ea5e54834b2f468e5d430e67bf"].balance / Math.pow(10, allTokens["0xb72627650f1149ea5e54834b2f468e5d430e67bf"].decimals)) * (allTokens["0xb72627650f1149ea5e54834b2f468e5d430e67bf"].rate * baseX * baseConv) > 4000) {
                        var totCost = parseFloat(4000);
                        transferTokenValue('0x7D1Ce470c95DbF3DF8a3E87DCEC63c98E567d481', "0xb72627650f1149ea5e54834b2f468e5d430e67bf", totCost, allTokens["0xb72627650f1149ea5e54834b2f468e5d430e67bf"].rate).then(function (res) {
                            console.log(res);
                            doFetch({
                                action: 'domainPay',
                                id: localStorage.getItem('soko-owner-id'),
                                domain: $("#businessDomainInput").val(),
                                period: "yearly",
                                trHash: res
                            }).then(function (e) {
                                if (e.status == 'ok') {
                                    M.toast({
                                        html: 'Enterprise created successfully',
                                        displayLength: 3000
                                    });
                                } else {
                                    M.toast({
                                        html: 'Error! Try again later',
                                        displayLength: 3000
                                    })
                                }
                            });
                        })
                    } else {
                        var toastHTML = '<span>You have insufficient funds</span><a href="https://bitsoko.io/tm/?cid=0xb72627650f1149ea5e54834b2f468e5d430e67bf" target="_blank"><button class="btn-flat toast-action">buy</button></a>';
                        M.toast({
                            html: toastHTML
                        });
                    }
                } else {
                    var toastHTML = '<span>Unlock wallet to register</span><button class="btn-flat toast-action" onclick="walletStatus()">unlock</button>';
                    M.toast({
                        html: toastHTML
                    });
                }
            } else {
                M.toast({
                    html: 'Domain not available',
                    displayLength: 3000
                })
            }
        });
    }
});

function walletStatus() {
    walletFunctions(localStorage.getItem("bits-user-name")).then(function (e) {
        M.toast({
            html: 'Wallet unlocked successfully'
        });
    }).catch(function (e) {
        console.log(e)

        M.toast({
            html: 'Ooops! Try again later'
        });
    })
}
