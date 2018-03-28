$(document).on('touchstart click', '#deliveryPage', function () {
    $(".activePage").html("Deliveries")
});
//Enable Deliveries
$('#deliveriesToggle').click(function (e) {
    e.preventDefault();
    $('#MobileModal').modal({
        ready: function (modal, trigger) {
            setTimeout(deliveryMbr, 1000);
        }
    }).modal('open');
    $('#deliveriesToggle').sideNav('hide');

    var isValid = true;
    $('#submitPhoneNo').click(function () {
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
            }).then(function (e) {});
        }
    });
});

//Delivery Members
$('document').ready(function () {

    $('#deliverOrderModal').modal({
        ready: function (modal, trigger) {
            deliveryMbr();
        }
    });
    $(document).on('click', $('.deliveryField ul.autocomplete-content li'), function (e) {
        var value = $('#delivery-members').val();
        if (value != '') {
            var deliveryMembers = $('#delivery-members').val();
            for (var i in deliveryGuys) {
                var name = deliveryGuys[i].name;
                var id = deliveryGuys[i].id;
                if (deliveryMembers == name) {
                    $("#confirmAddMember").modal("open");
                    $("#operatorName").html(name);
                    var thisOperator = id;
                    $('#yesOperatorBtn').on('click', function (event) {
                        event.preventDefault();
                        doFetch({
                            action: 'deliveryMembers',
                            store: localStorage.getItem('soko-active-store'),
                            do: 'add',
                            data: thisOperator
                        }).then(function (e) {
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
                    $('#noOperatorBtn').on('click', function () {
                        $("#confirmAddMember").modal("close");
                    });
                }
            }
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
function deliveryMbr() {
    doFetch({
        action: 'getDeliveryMembers',
        id: localStorage.getItem('soko-active-store')
    }).then(function (e) {
        try {
            var deliveryMemberLst = JSON.parse(e.members)
        } catch (err) {

            var deliveryMemberLst = [];
        }
        $("#membersLst").html("");
        for (var i = 0; i < deliveryMemberLst.length; i++) {
            for (var s in deliveryGuys) {
                var name = deliveryGuys[s].name;
                var id = deliveryGuys[s].id;
                var icon = deliveryGuys[s].icon;
                if (deliveryMemberLst[i].id == id) {

                    $("#membersLst").append('<div id="' + id + '" class="chip removeMember"> <img src="' + icon + '"> ' + name + ' </div>');
                    $("#ordMembersLst").append('<div class="row" style="margin-bottom:0px;"><div class="col s10"><div class="chip selectMmbr ' + id + '" style="border-radius:5px;background:#FAFAFA;color:black;"> <img style="border-radius:5px;" src="' + icon + '"> ' + name + ' </div></div><div class="col s2" style="padding-top:5px;"><form action="#"> <label for="radio_' + id + '"><input class="with-gap" name="group1" type="radio" id="radio_' + id + '"/><span></span></label></form></div></div>');
                    $("#radio_" + id).click(function () {
                        var orderId = $("#deliverOrderModal").attr('gid');
                        doFetch({
                            action: 'orderDeliveryMembers',
                            orderId: orderId,
                            id: id
                        }).then(function (e) {
                            if (e.status == 'ok') {
                                M.toast({
                                    html: 'Delivery member selected successfully',
                                    displayLength: 3000
                                })
                                $('#deliverOrderModal').modal('close');
                            } else {}
                        });
                    })
                }
            }
        }
    })
    var rateInput = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).deliveryRate;
    $('#delivery_Rate').val(rateInput);
    $("#sliderAmount").val(rateInput);
    $("#slide").val(rateInput);
    $("#rangeOutputId").val(rateInput);
}

//Remove Delivery Member
$(document).on('click', '.removeMember', function (e) {
    e.stopPropagation();
    var removeMember = $(this).attr("id");
    console.log(removeMember);
    $('#removeMemberModal').modal('open');
    $('#yesMemberBtn').on('click', function () {
        doFetch({
            action: 'deliveryMembers',
            store: localStorage.getItem('soko-active-store'),
            do: 'remove',
            data: removeMember
        }).then(function (e) {
            if (e.status == 'ok') {
                $(removeMember).remove();
                $('#removeMemberModal').modal('close');
                deliveryMbr();
                console.log($("#delivery-members").val(""));
            } else {}
        });
    });
    $('#noMemberBtn').on('click', function () {
        $('#removeMemberModal').modal('close');
    });
});
//Delivery Rate
$("#sliderAmount").on("change", function () {
    deliveryRate = $("#sliderAmount").val();
    doFetch({
        action: 'deliveryRate',
        store: localStorage.getItem('soko-active-store'),
        rate: deliveryRate
    }).then(function (e) {
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
$("#distanceSliderAmount").on("change", function () {
    deliveryDistance = $("#distanceSliderAmount").val();
    doFetch({
        action: 'deliveryRadius',
        store: localStorage.getItem('soko-active-store'),
        radius: deliveryDistance
    }).then(function (e) {
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


//New Operator
$('#addNewOperator').on('click', function () {
    var inputVal = $("#delivery_operator_no").val();
    var orderId = $("#deliverOrderModal").attr('gid');;
    doFetch({
        action: 'createNewOperator',
        number: inputVal,
        orderId: orderId
    }).then(function (e) {
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

$(document).on("click", "#addOperatorNumb", function () {
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
        }).then(function (e) {
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
