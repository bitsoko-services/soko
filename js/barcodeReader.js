$(".barCodeOpn").click(function () {
    $('#barCodeReader').modal({
        ready: function () {
             Quagga.onDetected(function(data){

              console.log(data.codeResult.code) 
              alert(data.codeResult.code) 
            })


            Quagga.init({
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: document.querySelector('#quagaLauncher') // Or '#yourElement' (optional)
                },
                decoder: {
                    readers: ["code_128_reader"]
                }
            }, function (err) {
                if (err) {
                    console.log(err);
                    return
                }
                console.log("Initialization finished. Ready to start");
                Quagga.start();
            })
        },
        complete: function () {
            Quagga.stop()
        }
    }).modal('open');
});
$(".checkOutQuagga").click(function () {
    $("#barCodeReader").modal("close")
})
