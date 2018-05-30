function tokenSaleFunc() { //Open Token Sale Page
    $(document).on("click", "#tokenSale", function () {
        $('#content > .container > div').css('display', 'none');
        $('#content > .container > .tokenSale').css('display', 'block');
        $(".activePage").html("Token Sale")
    });

    //Buy Store Tokens
    $("#calcTokenVal").click(function () {
        var tokenValue = $("#buyStrTkns").val();
        if (tokenValue == "") {
            M.toast({
                html: 'Ooops! Please input amount',
                displayLength: 3000
            })
        } else {
            transferTokenValue("0x7D1Ce470c95DbF3DF8a3E87DCEC63c98E567d481", "0xb72627650f1149ea5e54834b2f468e5d430e67bf", parseFloat(tokenValue), allTokens["0xb72627650f1149ea5e54834b2f468e5d430e67bf"].rate).then(function (r) {
                console.log("This is the TRID" + r);
                doFetch({
                    action: "creditStore",
                    contract: "0xb72627650f1149ea5e54834b2f468e5d430e67bf",
                    amount: tokenValue / (baseX * allTokens["0xb72627650f1149ea5e54834b2f468e5d430e67bf"].rate),
                    rate: baseX * allTokens["0xb72627650f1149ea5e54834b2f468e5d430e67bf"].rate,
                    user: localStorage.getItem("soko-owner-id"),
                    baseCd: baseCd,
                    shop: localStorage.getItem("soko-active-store"),
                    tran: r
                }).then(function (e) {
                    if (e.status == 'ok') {
                        $(".prodCatToast").remove();
                        M.toast({
                            html: 'Tokens bought successfully',
                            classes: 'prodCatToast',
                            displayLength: 3000
                        })
                        $("#buyStoreTokens").modal("close")
                    } else {
                        M.toast({
                            html: 'Error! Please try later',
                            displayLength: 3000
                        })
                    }
                });
            });
        }
    });

    //Withdraw Store Tokens
    $("#entWithdraw").click(function () {
        var tokenValue = $("#withdrawFundsInpt").val();
        if (tokenValue == "") {
            M.toast({
                html: 'Ooops! Please input amount',
                displayLength: 3000
            })
        } else {
            transferTokenValue("0x7D1Ce470c95DbF3DF8a3E87DCEC63c98E567d481", "0xb72627650f1149ea5e54834b2f468e5d430e67bf", parseFloat(tokenValue), allTokens["0xb72627650f1149ea5e54834b2f468e5d430e67bf"].rate).then(function (r) {
                console.log("This is the TRID" + r);
                doFetch({
                    action: "entWithdraw",
                    contract: "0xb72627650f1149ea5e54834b2f468e5d430e67bf",
                    amount: tokenValue / (baseX * allTokens["0xb72627650f1149ea5e54834b2f468e5d430e67bf"].rate),
                    rate: baseX * allTokens["0xb72627650f1149ea5e54834b2f468e5d430e67bf"].rate,
                    user: localStorage.getItem("soko-owner-id"),
                    baseCd: baseCd,
                    shop: localStorage.getItem("soko-active-store"),
                    tran: r
                }).then(function (e) {
                    if (e.status == 'ok') {
                        $(".prodCatToast").remove();
                        M.toast({
                            html: 'Please wait! Request being processed',
                            classes: 'prodCatToast',
                            displayLength: 3000
                        })
                        $("#buyStoreTokens").modal("close")
                    } else {
                        M.toast({
                            html: 'Error! Please try later',
                            displayLength: 3000
                        })
                    }
                });
            });
        }
    });
}
setTimeout(function (e) {
    tokenSaleFunc();
}, 8000)

