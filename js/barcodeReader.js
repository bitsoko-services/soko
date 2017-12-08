function addScannedToCart(prd){
console.log(prd);
      // append product to shopping cart on dom here
      
                alert('added '+prd.name+' to cart')
}
var newCart=[];
      Quagga.onDetected(function(data){
             var bCode=data.codeResult.code;    
               // we have detected a code, since indexdb are async we have to pause quagga first and test if the 
               // scanned code is available in the list of products
  Quagga.stop();
            // TODO: instead of checking the indexdb each time a code is detected, 
        getObjectStore('data', 'readwrite').get('soko-store-' + localStorage.getItem('soko-active-store') + '-products').onsuccess = function (event) {
var sts=$.parseJSON(event.target.result);
            
            
            for(var j in sts ){
                
            if(sts[j].barCode==bCode){
               // we have found a matching code so we add it to the cart and continue scanning
                  navigator.vibrate(500);
           addScannedToCart(sts[j]) 
               
               } 
                  
            }
              
                startScanning(); 
        }  
                 
                 
                 
              
                 
                 
            })


function startScanning(){
Quagga.init({
                numOfWorkers: navigator.hardwareConcurrency,
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: document.querySelector('#quagaLauncher') // Or '#yourElement' (optional)
                },
                decoder: {
                    readers: ["ean_reader","ean_8_reader","code_128_reader"]
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
