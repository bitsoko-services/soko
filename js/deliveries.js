$(document).on('touchstart click', '#deliveryPage', function () {
    $(".activePage").html("Deliveries")
});
//Enable Deliveries
$('#deliveriesToggle').click(function (e) {
    e.preventDefault();
    $('#MobileModal').modal({
        ready: function (modal, trigger) {
            deliveryListener();
            setTimeout(deliveryMbr, 1000);
        }
    }).modal('open');
    $('#deliveriesToggle').sideNav('hide');

    var isValid = true;
    $('#submitPhoneNo').click(function () {
        phoneNo_ = $('#inp-phone').val();
        if (phoneNo_ == '' || phoneNo_ == null && e.status == "ok") {

            Materialize.toast('Ooops! Please enter phone number', 3000);
            $('#phoneNumber').css({
                "border-bottom": "1px solid red",
                "background": ""
            });
        } else {
            $('#deliveriesToggle').prop('checked', true);
            Materialize.toast('Phone Number Verified', 3000);
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
    $('.deliveryField').on('click', $('ul.autocomplete-content li'), function (e) {
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
                            } else {}
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



        var matched = []
        try {
            var deliveryMembers = JSON.parse(e.members);
        } catch (err) {
            var deliveryMembers = [];
        }
        var users = deliveryGuys;
        $("#membersLst").html('');
        $("#ordMembersLst").html('');

        var memberIds = deliveryMembers.map(function (member) {
            users.forEach(function (user) {
                if (user.id === member.id) {
                    matched.push({
                        icon: user.icon,
                        name: user.name,
                        id: user.id
                    })
                }
            });

        });

        $.each(matched, function (index, obj) {
            var id = obj.id;
            name = obj.name;
            icon = obj.icon
            console.log(obj);
            $("#membersLst").append('<div id="' + id + '" class="chip removeMember"> <img src="' + icon + '"> ' + name + ' </div>');
            $("#ordMembersLst").append('<div class="row" style="margin-bottom:0px;"><div class="col s10"><div class="chip selectMmbr ' + id + '" style="border-radius:5px;background:#FAFAFA;color:black;"> <img style="border-radius:5px;" src="' + icon + '"> ' + name + ' </div></div><div class="col s2" style="padding-top:5px;"><input class="with-gap" name="group1" type="radio" id="radio_' + id + '"/> <label for="radio_' + id + '"></label></div></div>');
            $("#radio_" + id).click(function () {
                var orderId = $("#deliverOrderModal").attr('gid');
                doFetch({
                    action: 'orderDeliveryMembers',
                    orderId: orderId,
                    id: id
                }).then(function (e) {
                    if (e.status == 'ok') {
                        Materialize.toast('Delivery member selected successfully', 3000);
                        $('#deliverOrderModal').modal('close');
                    } else {}
                });
            })
        })
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
            Materialize.toast('Delivery rate set successfully', 3000);
        } else {
            Materialize.toast('Error!!! Please try again later', 3000);
        }
    });
});


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
            Materialize.toast('Delivery member added successfully', 3000);
        } else {
            Materialize.toast('Error! Please try again later', 3000);
        }
    });
});

$(document).on("click", "#addOperatorNumb", function () {
    operatorNumb = $('#OperatorNumb').val()
    if (operatorNumb == "") {
        Materialize.toast("Ooops! Please enter a phone number", 3000);
        $("#OperatorNumb").css("border-bottom", "solid 1px red")
    } else if (operatorNumb.length < 10) {
        Materialize.toast("Ooops! Input too short", 3000);
        $("#OperatorNumb").css("border-bottom", "solid 1px red")
    } else {
        Materialize.toast("Sending invite link. Please wait", 10000, 'operatorNumb');
        $("#OperatorNumb").css("border-bottom", "1px solid #9e9e9e")
        doFetch({
            action: 'deliveryMembers',
            number: operatorNumb
        }).then(function (e) {
            if (e.status == 'ok') {
                Materialize.toast('Invite link sent successfully', 3000);
                $('.operatorNumb').remove();
            } else {
                console.log(e);
            }
        });
    }
});
