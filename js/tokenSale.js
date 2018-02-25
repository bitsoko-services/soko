//Open Token Sale Page
$(document).on("click", "#tokenSale", function () {
    $('#content > .container > div').css('display', 'none');
    $('#content > .container > .tokenSale').css('display', 'block');
    $(".activePage").html("Token Sale")
});

//Activate / Deactive Token Sale
$("#tkSaleSet").click(function () {
    var mngrState = $("#tkSaleSet").prop("checked");
    doFetch({
        action: 'tokenize',
        id: localStorage.getItem('soko-owner-id'),
        state: mngrState
    }).then(function (e) {
        if (e.status == 'ok') {
            Materialize.toast('Activated successfully', 3000);
        } else {
            Materialize.toast('Ooops! Try again later', 3000);
        }
    });
})
