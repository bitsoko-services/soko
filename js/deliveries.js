//Enable Deliveries
$('#deliveriesToggle').click(function (e) {
    e.preventDefault();
    $('#MobileModal').modal('open');
    $('#deliveriesToggle').sideNav('hide');
    deliveryListener();
    //    $('#mobileVerification').modal({
    //        dismissible: false,
    //    });
    var isValid = true;
    $('#submitPhoneNo').click(function () {
        phoneNo_ = $('#inp-phone').val();
        if (phoneNo_ == '' || phoneNo_ == null && e.status == "ok") {
            $('#MobileModal').modal({
                dismissible: false,
            });
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
    $('body').on('click', $('#MobileModal ul.autocomplete-content li'), function () {
        var value = $('#delivery-members').val();
        if (value != '') {
            var deliveryMembers = $('#delivery-members').val();
            for (var i in deliveryGuys) {
                var name = deliveryGuys[i].name;
                var id = deliveryGuys[i].id;
                if (deliveryMembers == name) {
                    doFetch({
                        action: 'deliveryMembers',
                        store: localStorage.getItem('soko-active-store'),
                        do: 'add',
                        data: id
                    }).then(function (e) {
                        if (e.status == 'ok') {} else {}
                    });
                }
            }
        }
    });
});


//Delivery Member List
function deliveryMemberLst() {
    var deliveryMembers = $('#delivery-members').val();
    for (var s in deliveryGuys) {
        var name = deliveryGuys[s].name;
        var id = deliveryGuys[s].icon;
        if ($('#delivery-members').val() != '') {
            $("#membersLst").append('<div class="chip removeMember"> <img src="' + id + '"> ' + name + ' </div>');
        } else {
            $("#membersLst").append('<div class="chip removeMember">You do not have delivery Members</div>');
        }
        $('.removeMember').click(function () {
            var removeMember = $(this)
            $('#removeMemberModal').modal('open');
            $('#yesMemberBtn').on('click', function () {
                $('#removeMemberModal').modal('close');
                doFetch({
                    action: 'deliveryMembers',
                    store: localStorage.getItem('soko-active-store'),
                    do: 'remove',
                    data: id
                }).then(function (e) {
                    if (e.status == 'ok') {
                        $(removeMember).remove();
                    } else {}
                });
            });
            $('#noMemberBtn').on('click', function () {
                $('#removeMemberModal').modal('close');
            });
        })
    }
}

$('.MobileModal').modal({
    ready: function (modal, trigger) {
        deliveryListener();
        deliveryMemberLst();
    },
});
