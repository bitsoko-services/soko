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
        data: '',
        filter: 'sponsored'
    }).then(function(e) {
        var dat = {}
        var itemDat = new Array();
        sponProds = e.products;
        $('.inventoryItemsToAdd').html('');
        for (var iii in sponProds) {
            var itemName = sponProds[iii].name;
            var itemPrice = sponProds[iii].price;
            var itemId = sponProds[iii].id;
            $('.inventoryItemsToAdd').append('<form action="#"> <p> <label> <input class="inventoryItems" type="checkbox" pid="' + itemId + '" id="inventoryItem' + itemId + '"/> <span>' + itemName + '</span> </label> </p></form>');
        }

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



$(document).on('click touchstart', '.inventoryItems', function(e) {
    var getId = $(this).attr('pid');
    var isChecked = $('#inventoryItem' + getId).prop('checked');
    console.log(getId)
    console.log(isChecked)
    if(isChecked == true){
        M.toast({
            html: 'Adding item to inventory',
            classes: 'spnsrdTst',
            displayLength: 10000
        })
        doFetch({
            action: 'addSponsoredProduct',
            store: localStorage.getItem('soko-active-store'),
            do: 'add',
            id: getId
        }).then(function(e) {
            if (e.status == 'ok') {
                $(".spnsrdTst").remove();
                $('#spnsrdModal').modal('close');
                M.toast({
                    html: 'Item added to inventory successfully',
                    displayLength: 3000
                })
            } else {}
        });
    }else{
        M.toast({
            html: 'Removing item from inventory',
            classes: 'spnsrdTst',
            displayLength: 10000
        })
        doFetch({
            action: 'addSponsoredProduct',
            store: localStorage.getItem('soko-active-store'),
            do: 'remove',
            id: getId
        }).then(function(e) {
            if (e.status == 'ok') {
                $(".spnsrdTst").remove();
                $('#spnsrdModal').modal('close');
                M.toast({
                    html: 'Item removed successfully',
                    displayLength: 3000
                })
            } else {}
        });
    }


})
