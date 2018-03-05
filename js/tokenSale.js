//Open Token Sale Page
$(document).on("click", "#tokenSale", function () {
    $('#content > .container > div').css('display', 'none');
    $('#content > .container > .tokenSale').css('display', 'block');
    $(".activePage").html("Token Sale")
});

//Buy Store Tokens
$("#calcTokenVal").click(function () {
    var tokenValue = $("#tokenVal").val();
    var TRID = transferTokenValue("0xb72627650f1149ea5e54834b2f468e5d430e67bf", "bits", (parseFloat(tokenValue)), allTokens.bits.rate).then(function (r) {
        console.log("This is the TRID" + r);
    });
    if (tokenValue == "") {
        Materialize.toast('Ooops! Please input amount', 3000);
    } else {
        doFetch({
            amount: (baseX * allTokens.bits.rate) / tokenValue,
            rate: baseX * allTokens.bits.rate,
            user: localStorage.getItem("soko-owner-id"),
            tran: TRID
        }).then(function (e) {
            if (e.status == 'ok') {
                $(".prodCatToast").remove();
                Materialize.toast('Product category changed successfully', 3000, "prodCatToast");
            } else {
                Materialize.toast('Error! Please try later', 3000);
            }
        });
    }
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
