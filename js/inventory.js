var inventoryItemsActive = false

function openInventoryPage() {
    $('#content > .container > div').css('display', 'none');
    setTimeout(function(e) {
        $('#content > .container > .inventoryPage').css('display', 'block');
        $(".activePage").html("Inventory")
    }, 300);
    sponpProdNamesInput();
}

function isInventoryActive() {
    getObjectStore('data', 'readwrite').get('soko-store-' + localStorage.getItem('soko-active-store') + '-products').onsuccess = function(event) {
        var reqs = JSON.parse(event.target.result);
        for (var i = 0; i < reqs.length; ++i) {
            if (reqs[i].sponsored == "true") {
                inventoryItemsActive = true
            }
        }
        if (inventoryItemsActive != true) {
            document.getElementById('inventoryAddBtn').classList.add('pulse')
        }
    }
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
            var itemIcon = sponProds[iii].icon;
            var itemMetric = sponProds[iii].metric;
            $('.inventoryItemsToAdd').append('<form action="#" style="padding-right: 20px;"> <p> <label> <input class="inventoryItems" type="checkbox" pid="' + itemId + '" id="inventoryItem' + itemId + '"/> <span><img src="' + itemIcon + '" style=" width: 25px; height: 25px; object-fit: cover; border-radius: 50%; float: left; margin-right: 10px;">' + itemName + '  @ ' + itemPrice + ' ' + itemMetric + '</span> </label> </p></form>');


            if (invetoryItemsInStore.includes(itemId) == true) {
                $('#inventoryItem' + itemId + '').attr('checked', true);
            }
        }

    });
    var remainingTime = 7 - moment().format("d");
    if (remainingTime == 1) {
        document.getElementById('invetoryEndDate').innerHTML = remainingTime + " day";
    } else {
        document.getElementById('invetoryEndDate').innerHTML = remainingTime + " days";
    }
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
    if (isChecked == true) {
        M.toast({
            html: 'Adding item to inventory',
            classes: 'spnsrdTst',
            displayLength: 10000
        })
        doFetch({
            action: 'sponsoredProduct',
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
    } else {
        $("#rmvSpnsrdProd").attr("sid", getId)
        $("#rmvSpnsrdProd").css('display', 'block');
        $('#inventoryItem' + getId).prop('checked', true);
        $(document).on('touchstart click', '#yesSponsoredBtn', function(event) {
            var sponsoredID = $("#rmvSpnsrdProd").attr("sid");
            $(this).unbind(event);
            doFetch({
                action: 'sponsoredProduct',
                store: localStorage.getItem('soko-active-store'),
                do: 'remove',
                id: sponsoredID
            }).then(function(e) {
                if (e.status == 'ok') {
                    $("#rmvSpnsrdProd").hide();
                    $('#inventoryItem15').prop('checked', false);
                    M.toast({
                        html: 'Inventory item removed successfully',
                        displayLength: 3000
                    })
                } else {}
            });
        });
    }
})

$(document).on('touchstart click', '#noSponsoredBtn', function(event) {
    $("#rmvSpnsrdProd").hide();
});
