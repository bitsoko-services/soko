//Enable Payments
$('#paymentsToggle').click(function (e) {
    e.preventDefault();
    $('#paymentsToggle').sideNav('hide');
    $('#MobileModal').modal('open');
    var isValid = true;
    $('#submitPhoneNo').click(function () {
        phoneNo_ = $('#inp-phone').val();
        if (phoneNo_ == '' || phoneNo_ == null) {
            Materialize.toast('Ooops! Please enter phone number', 3000);
            $('#phoneNumber').css({
                "border-bottom": "1px solid red",
                "background": ""
            });
        } else {
            $('#paymentsToggle').prop('checked', true);
            Materialize.toast('Phone Number Verified', 3000);
            var value = document.getElementById("paymentsToggle").checked
            var phone_number = $('#inp-phone').val()
            doFetch({
                action: 'togglePayments',
                value: value,
                id: localStorage.getItem('soko-active-store')
            }).then(function (e) {});
        }
    });
});
