//Enable Payments
$('#paymentsToggle').click(function () {
    $('#deliveriesToggle').sideNav('hide');
    $('#confirmContact').modal('open');
    var value = document.getElementById("paymentsToggle").checked
    doFetch({
        action: 'togglePayments',
        value: value
    }).then(function (e) {});
});

$('#paymentsToggle').click(function mobifer() {
    userNamesInput();
    if ($('#editStore-Phone').val() == "") {
        $('#editStoreModal').modal('open');
        Materialize.toast('Please add your phone number', 3000);
    }
});
