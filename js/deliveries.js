function deliveryMbr() {
    doFetch({
        action: 'getDeliveryMembers',
        id: localStorage.getItem('soko-active-store')
    }).then(function(e) {
        try {
            var deliveryMemberLst = JSON.parse(e.members)
        } catch (err) {

            var deliveryMemberLst = [];
        }
        $("#membersLst").html("");
        $("#ordMembersLst").html("");
        if (deliveryMemberLst.length == 0) {
            $('#incompleteShopIcon').css('display', 'block');
            $('.shareStoreBtn').css('display', 'none');
            $('.walletBalDiv').css('display', 'none');
            if ($('.addOperatorShopError').length >= 1) {
                //Do nothing
            } else {
                $('#shopIncompleteLst').append("<li class='addOperatorShopError'>Add delivery operators</li>")
            }
        }
        for (var i = 0; i < deliveryMemberLst.length; i++) {
            if (deliveryMemberLst[i].onLocatio != false) {
                var a = moment(new Date(moment().unix() * 1000));
                var b = moment(new Date(deliveryMemberLst[i].onLocation * 1000));
                timeDiff = a.diff(b, 'hours') + ' hours '
            } else {
                timeDiff = ''
            }
            for (var v in deliveryGuys) {
                var name = deliveryGuys[v].name;
                var id = deliveryGuys[v].id;
                var icon = deliveryGuys[v].icon;
                if (deliveryMemberLst[i].id == id) {
                    $("#membersLst").append('<div id="' + id + '" class="chip removeMember" style="height: auto !important; line-height: 1.3;"> <img src="' + icon + '"> ' + name + '<br><span style="font-size: 0.8em;">' + timeDiff + ' ago</span> </div>');
                }
            }
            // Get time difference
            moment.fn.fromNow = function(a) {
                var duration = moment().diff(this, 'hours');
                return duration;
            }
            //            var timeDif = moment.unix(deliveryMemberLst[i].onLocation).fromNow();
            var activeOperator = deliveryMemberLst[i].active

            if (activeOperator == "true") {
                for (var s in deliveryGuys) {
                    var name = deliveryGuys[s].name;
                    var id = deliveryGuys[s].id;
                    var icon = deliveryGuys[s].icon;
                    if (deliveryMemberLst[i].id == id) {
                        console.log(deliveryMemberLst[i].id)
                        try {
                            var tId = parseInt(deliveryMemberLst[i].onLocation);
                            if (!moment(tId).isBefore(moment().subtract(1, 'weeks'))) {
                                $("#ordMembersLst").append('<div class="row" style="margin-bottom:0px;"><div class="col s10"><div class="chip selectMmbr ' + id + '" style="border-radius:5px;background:#FAFAFA;color:black;"> <img style="border-radius:5px;" src="' + icon + '"> ' + name + ' </div></div><div class="col s2" style="padding-top:5px;"><form action="#"> <label for="radio_' + id + '"><input class="with-gap" rid="' + id + '" name="group1" type="radio" id="radio_' + id + '"/><span></span></label></form></div></div>');
                            }
                        } catch (e) {
                            console.log('Info! this member may no longer be active ', e)
                        }

                    }
                }
            }
        }
    })
    try {
        var rateInput = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).deliveryRate;
    } catch (err) {
        var rateInput = 0
    }
    $('#delivery_Rate').val(rateInput);
    $("#sliderAmount").val(rateInput);
    $("#slide").val(rateInput);
    $("#rangeOutputId").val(rateInput);

    if (rateInput == 0 || rateInput == undefined || rateInput == '') {
        $('#incompleteShopIcon').css('display', 'block');
        $('.shareStoreBtn').css('display', 'none');
        $('.walletBalDiv').css('display', 'none');
        $('#shopIncompleteLst').append("<li>Set shop's delivery rate</li>")
    }
}

function initDeilveryFunctions() {


    $(document).on('touchstart click', '#deliveryPage', function() {
        $(".activePage").html("Deliveries")
    });

    //Initiale noUiSlider
    var slider = document.getElementById('test-slider');
    try {
        var getMinDelDist = JSON.parse(JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).deliveryRadius).min * 1000;
        var getMaxDelDist = JSON.parse(JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).deliveryRadius).max * 1000;

        if (getMinDelDist == null || getMinDelDist == NaN) {
            var getMinDelDist = 500
        }
        if (getMaxDelDist == null || getMaxDelDist == NaN) {
            var getMaxDelDist = 10000
        }
    } catch (err) {
        console.log(err)
        var getMinDelDist = 500
        var getMaxDelDist = 10000
    }

    $("#showMinDist").val(getMinDelDist)
    $("#showMaxDist").val(getMaxDelDist)

    document.getElementById("showMinDist").innerHTML = getMinDelDist;
    document.getElementById("showMaxDist").innerHTML = getMaxDelDist;
    noUiSlider.create(slider, {
        start: [getMinDelDist, getMaxDelDist],
        connect: true,
        step: 500,
        range: {
            'min': 500,
            'max': 15000
        },
    });

    //Get noUiSlider Values
    slider.noUiSlider.on('change.one', function(e) {
        var min = JSON.parse(e[0]).toFixed(0) / 1000;
        var max = JSON.parse(e[1]).toFixed(0) / 1000;

        doFetch({
            action: 'deliveryRadius',
            store: localStorage.getItem('soko-active-store'),
            radius: {
                min,
                max
            }
        }).then(function(e) {
            if (e.status == 'ok') {
                M.toast({
                    html: 'Delivery rate set successfully',
                    displayLength: 3000
                })
            } else {
                M.toast({
                    html: 'Error!!! Please try again later',
                    displayLength: 3000
                })
            }
        });
    });

    //Update distanceRangeOutputId
    slider.noUiSlider.on('slide.one', function(e) {
        var min = JSON.parse(e[0]) / 1000 + " KM";
        var max = JSON.parse(e[1]) / 1000 + " KM";
        $("#distanceRangeOutputId").html(min + " - " + max)
    });

    //Enable Deliveries
    $('#deliveriesToggle').click(function(e) {
        e.preventDefault();
        $('#deliveriesToggle').sideNav('hide');

        var isValid = true;
        $('#submitPhoneNo').click(function() {
            phoneNo_ = $('#inp-phone').val();
            if (phoneNo_ == '' || phoneNo_ == null && e.status == "ok") {
                M.toast({
                    html: 'Ooops! Please enter phone number',
                    displayLength: 3000
                })
                $('#phoneNumber').css({
                    "border-bottom": "1px solid red",
                    "background": ""
                });
            } else {
                remove
                $('#deliveriesToggle').prop('checked', true);
                M.toast({
                    html: 'Phone Number Verified',
                    displayLength: 3000
                })
                var value = document.getElementById("deliveriesToggle").checked
                var phone_number = $('#inp-phone').val()
                doFetch({
                    action: 'toggleDeliveries',
                    value: value,
                    id: localStorage.getItem('soko-active-store')
                }).then(function(e) {});
            }
        });
    });


    //Delivery Member List
    //function deliveryMemberLst() {
    //    var deliveryMembers = $('#delivery-members').val();
    //    for (var s in deliveryGuys) {
    //        var name = deliveryGuys[s].name;
    //        var id = deliveryGuys[s].icon;
    //        if ($('#delivery-members').val() != '') {
    //            $("#membersLst").append('<div class="chip removeMember"> <img src="' + id + '"> ' + name + ' </div>');
    //        } else {
    //            $("#membersLst").append('<div class="chip removeMember">You do not have delivery Members</div>');
    //        }
    //        $('.removeMember').click(function () {
    //            var removeMember = $(this)
    //            $('#removeMemberModal').modal('open');
    //            $('#yesMemberBtn').on('click', function () {
    //                $('#removeMemberModal').modal('close');
    //                doFetch({
    //                    action: 'deliveryMembers',
    //                    store: localStorage.getItem('soko-active-store'),
    //                    do: 'remove',
    //                    data: id
    //                }).then(function (e) {
    //                    if (e.status == 'ok') {
    //                        $(removeMember).remove();
    //                    } else {}
    //                });
    //            });
    //            $('#noMemberBtn').on('click', function () {
    //                $('#removeMemberModal').modal('close');
    //            });
    //        })
    //    }
    //}
    //Remove Delivery Member
    $(document).on('click', '.removeMember', function(e) {
        e.stopPropagation();
        var removeMember = $(this).attr("id");
        console.log(removeMember);
        $('#removeMemberModal').modal('open');
        $('#yesMemberBtn').on('click', function() {
            doFetch({
                action: 'deliveryMembers',
                store: localStorage.getItem('soko-active-store'),
                do: 'remove',
                data: removeMember
            }).then(function(e) {
                if (e.status == 'ok') {
                    $(removeMember).remove();
                    $('#removeMemberModal').modal('close');
                    deliveryMbr();
                    console.log($("#delivery-members").val(""));
                } else {}
            });
        });
    });
    //Delivery Rate
    $("#sliderAmount").on("change", function() {
        deliveryRate = $("#sliderAmount").val();
        doFetch({
            action: 'deliveryRate',
            store: localStorage.getItem('soko-active-store'),
            rate: deliveryRate
        }).then(function(e) {
            if (e.status == 'ok') {
                M.toast({
                    html: 'Delivery rate set successfully',
                    displayLength: 3000
                })
            } else {
                M.toast({
                    html: 'Error!!! Please try again later',
                    displayLength: 3000
                })
            }
        });
    });
    //Distace Set
    $("#distanceSliderAmount").on("change", function() {
        deliveryDistance = $("#distanceSliderAmount").val();
        doFetch({
            action: 'deliveryRadius',
            store: localStorage.getItem('soko-active-store'),
            radius: deliveryDistance
        }).then(function(e) {
            if (e.status == 'ok') {
                M.toast({
                    html: 'Delivery rate set successfully',
                    displayLength: 3000
                })
            } else {
                M.toast({
                    html: 'Error!!! Please try again later',
                    displayLength: 3000
                })
            }
        });
    });

    /*
//Distace Slider
var distanceSlide = document.getElementById('distaceSlide'),
    distanceSliderDiv = document.getElementById("distanceSliderAmount");

distanceSlide.onchange = function () {
    distanceSliderDiv.innerHTML = $("#distanceSliderAmount").val(this.value);
    var sliderVal = $("#distanceSliderAmount").val();
    $("#distaceSlide").val(sliderVal);
    var distanceVal = $("#distanceRangeOutputId").val()
    $("#distaceSlide").val(distanceVal);
    doFetch({
        action: 'deliveryRadius',
        store: localStorage.getItem('soko-active-store'),
        radius: sliderVal
    }).then(function (e) {
        if (e.status == 'ok') {} else {}
    });
}
*/

    //New Operator
    $('#addNewOperator').on('click', function() {
        var inputVal = $("#delivery_operator_no").val();
        var orderId = $("#deliverOrderModal").attr('gid');;
        doFetch({
            action: 'createNewOperator',
            number: inputVal,
            orderId: orderId
        }).then(function(e) {
            if (e.status == 'ok') {
                M.toast({
                    html: 'Delivery member added successfully',
                    displayLength: 3000
                })
            } else {
                M.toast({
                    html: 'Error! Please try again later',
                    displayLength: 3000
                })
            }
        });
    });

    $(document).on("click", "#addOperatorNumb", function() {
        operatorNumb = $('#OperatorNumb').val()
        if (operatorNumb == "") {
            M.toast({
                html: 'Ooops! Please enter a phone number',
                displayLength: 3000
            })
            $("#OperatorNumb").css("border-bottom", "solid 1px red")
        } else if (operatorNumb.length < 10) {
            M.toast({
                html: 'Ooops! Input too short',
                displayLength: 3000
            })
            $("#OperatorNumb").css("border-bottom", "solid 1px red")
        } else {
            M.toast({
                html: 'Sending invite link. Please wait',
                classes: 'operatorNumb',
                displayLength: 3000
            })
            $("#OperatorNumb").css("border-bottom", "1px solid #9e9e9e")
            doFetch({
                action: 'deliveryMembers',
                number: operatorNumb
            }).then(function(e) {
                if (e.status == 'ok') {
                    M.toast({
                        html: 'Invite link sent successfully',
                        displayLength: 3000
                    })
                    $('.operatorNumb').remove();
                } else {
                    console.log(e);
                }
            });
        }
    });
}

function manageOperators() {
    var value = $('#delivery-members').val();
    if (value != '') {
        $("#confirmAddMember").modal("open");
        var deliveryMembers = $('#delivery-members').val();
        for (var i in deliveryGuys) {
            var name = deliveryGuys[i].name;
            var id = deliveryGuys[i].id;
            if (deliveryMembers == name) {
                $("#operatorName").html(name);
                var thisOperator = id;
                $('#yesOperatorBtn').unbind().on('click', function(event) {
                    event.preventDefault();
                    doFetch({
                        action: 'deliveryMembers',
                        store: localStorage.getItem('soko-active-store'),
                        do: 'add',
                        data: thisOperator
                    }).then(function(e) {
                        if (e.status == 'ok') {
                            deliveryMbr();
                            $("#confirmAddMember").modal("close");
                            $('#delivery-members').val("");
                            $("#addOperatorsModal").modal("close");
                            M.toast({
                                html: 'Operator added successfully.',
                                displayLength: 3000
                            })
                        } else {
                            M.toast({
                                html: 'Error!!! Try again later',
                                displayLength: 3000
                            })
                        }
                    });
                });
                $('#noOperatorBtn').on('click', function() {
                    $("#confirmAddMember").modal("close");
                });
            }
        }
    }
}

//Select Deliver Operator For Order
$(document).on("click", ".with-gap", function(e) {
    var orderId = $("#deliverOrderModal").attr('gid');
    doFetch({
        action: 'orderDeliveryMembers',
        orderId: orderId,
        id: $(this).attr('rid')
    }).then(function(e) {
        if (e.status == 'ok') {
            M.toast({
                html: 'Delivery member selected successfully',
                displayLength: 3000
            })
            $('#deliverOrderModal').modal('close');
        } else {}
    });
});
