//Open Token Sale Page
$(document).on("click", "#tokenSale", function () {
    $('#content > .container > div').css('display', 'none');
    $('#content > .container > .tokenSale').css('display', 'block');
});

//Activate / Deactive Token Sale
$("#tkSaleSet").click(function () {
    var mngrState = $("#tkSaleSet").prop("checked");
    doFetch({
        action: 'tokenize',
        store: localStorage.getItem('soko-active-store'),
        state: mngrState
    }).then(function (e) {
        if (e.status == 'ok') {
            Materialize.toast('Activated successfully', 3000);
        } else {
            Materialize.toast('Ooops! Try again later', 3000);
        }
    });
})
