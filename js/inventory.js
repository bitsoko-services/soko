function openInventoryPage() {
    $('#content > .container > div').css('display', 'none');
    setTimeout(function(e) {
        $('#content > .container > .inventoryPage').css('display', 'block');
        $(".activePage").html("Inventory")
    }, 300);
    sponpProdNamesInput();
}


//Input Initiallization
var sponProds = {}
//
function sponpProdNamesInput() {
    var inputVal = $("#check-prod-input").val();
    var fetchedData = doFetch({
        action: 'getAllProducts',
        data: inputVal,
        filter: 'sponsored'
    }).then(function(e) {
        console.log('=======================')
        console.log(e)
        var dat = {}
        var itemDat = new Array();
        sponProds = e.products;
        for (var iii in e.products) {
            var nm = e.products[iii].name + " - " + e.products[iii].price;
            var icn = e.products[iii].icon;
            var itemName = e.products[iii].name
            //var id = e.users[iii].id;
            dat[nm] = icn;
            itemDat.push(itemName)

        }
        autocomplete(document.getElementById("check-prod-input"), itemDat);

    });
}

//Process Inventory Order
function inventoryOrder(prid) {
    var quantity = document.getElementById("prodRestNo-" + prid).value;
    var prodPrice = document.getElementById("prodPrice-" + prid).value;
    var totalCost = quantity * prodPrice;
    if (totalCost > shopBalance) {
        getInsufficientFundsOrderbook(JSON.stringify(totalCost));
    } else {
        doFetch({
            action: 'inventoryOrder',
            shop: localStorage.getItem('soko-active-store'),
            item: prid,
            quantity: quantity,
            price: prodPrice,
        }).then(function(e) {
            if (e.status == 'ok') {
                M.toast({
                    html: 'Order request sent successfully'
                })
            } else {
                M.toast({
                    html: 'Error!!! Try again later'
                })
            }
        })
    }
}
