//Enable Payments
$('#paymentsToggle').click(function () {
    if (JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).phone == "") {
        $('#paymentsToggle').sideNav('hide');
        $('#editStoreModal').modal('open');
        M.toast({
            html: 'Please add your phone number',
            displayLength: 3000
        })
    } else {
        $('#deliveriesToggle').sideNav('hide');
        $('#confirmContact').modal('open');
        var value = document.getElementById("paymentsToggle").checked
        console.log(value)
        doFetch({
            action: 'togglePayments',
            id: localStorage.getItem('soko-active-store'),
            value: value
        }).then(function (e) {
            if (e.status == 'ok') {

            } else {

            }
        });
    }
});


//Payments on/off
try {
    var paymentOnOff = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).payments;
} catch (err) {
    console.log(err);
    var paymentOnOff = null
}
//var paymentOnOff = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).payments;
//if (paymentOnOff == "1") {
//    document.getElementById("paymentsToggle").checked = true;
//}
