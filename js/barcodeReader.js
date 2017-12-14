function addScannedToCart(prd) {
    console.log(prd);
    // append product to shopping cart on dom here
    console.log(prd);
    $("#scanLst").append('<div id="' + prd.id + '" class="chip"><img src="https://bitsoko.co.ke' + prd.imagePath + '" alt="' + prd.name + '">' + prd.name + '<svg class="scannedProd" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 348.333 348.334" style="enable-background:new 0 0 348.333 348.334;width: 10px;margin-left: 20px;" xml:space="preserve"><g><path d="M336.559,68.611L231.016,174.165l105.543,105.549c15.699,15.705,15.699,41.145,0,56.85 c-7.844,7.844-18.128,11.769-28.407,11.769c-10.296,0-20.581-3.919-28.419-11.769L174.167,231.003L68.609,336.563 c-7.843,7.844-18.128,11.769-28.416,11.769c-10.285,0-20.563-3.919-28.413-11.769c-15.699-15.698-15.699-41.139,0-56.85 l105.54-105.549L11.774,68.611c-15.699-15.699-15.699-41.145,0-56.844c15.696-15.687,41.127-15.687,56.829,0l105.563,105.554 L279.721,11.767c15.705-15.687,41.139-15.687,56.832,0C352.258,27.466,352.258,52.912,336.559,68.611z"></path></g></svg></div>');
    setTimeout(startScanning, 1000)
    $(".scannedProd").click(function () {
        $(this).parent().remove();
    })
}
var newCart = [];
Quagga.onDetected(function (data) {
    var bCode = data.codeResult.code;
    console.log(bCode);

    // we have detected a code, since indexdb are async we have to pause quagga first  and test if the 
    // scanned code is available in the list of products
    //    Quagga.stop();
    // TODO: instead of checking the indexdb each time a code is detected, 
    getObjectStore('data', 'readwrite').get('soko-store-' + localStorage.getItem('soko-active-store') + '-products').onsuccess = function (event) {
        var sts = $.parseJSON(event.target.result);


        for (var j in sts) {
            console.log(sts[j].barCode, bCode)
            if (sts[j].barCode == bCode) {
                // we have found a matching code so we add it to the cart and continue scanning
                navigator.vibrate(500);
                addScannedToCart(sts[j])
                console.log("Scanned");
                Quagga.stop();
            }
        }
    }
    //    startScanning();
})


function startScanning() {
    Quagga.init({
        numOfWorkers: navigator.hardwareConcurrency,
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#quagaLauncher') // Or '#yourElement' (optional)
        },
        decoder: {
            readers: ["ean_reader", "ean_8_reader", "code_128_reader"]
        }
    }, function (err) {
        if (err) {
            console.log(err);
            return
        }
        Quagga.start();
    })
}

$(".barCodeOpn").click(function () {
    $('#barCodeReader').modal({
        ready: function () {

            startScanning();

        },
        complete: function () {
            Quagga.stop()
        }
    }).modal('open');
});
$(".checkOutQuagga").click(function () {
    $("#barCodeReader").modal("close")
})



$("#quaggachckout").click(function () {
    var location = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).lonlat
    var itemsScanned = [];
    var itmScndChildren = document.getElementById("scanLst").children; //get container element children.
    for (var i = 0, len = itmScndChildren.length; i < len; i++) {
        itemsScanned.push(itmScndChildren[i].id); //get child id.
    }

    console.log(itemsScanned);

    if (itemsScanned.length == 0) {
        Materialize.toast("You haven't added items to your cart", 3000);
    } else {
        doFetch({
            action: 'makeOrder',
            data: itemsScanned,
            loc: location,
            user: localStorage.getItem("bits-user-name")
        }).then(function (e) {
            if (e.status == "ok") {
                console.log("success!", "your order has been sent!", "success");
                refreshSalesOrders();
                $("#barCodeReader").modal("close")
            } else {
                console.log("Cancelled", "your order is not sent", "error");
            }
        })
    }
})
