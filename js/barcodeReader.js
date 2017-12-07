function addScannedToCart(prd){
console.log(prd)
}
var newCart=[];


$(".barCodeOpn").click(function () {
    $('#barCodeReader').modal({
        ready: function () {
             Quagga.onDetected(function(data){
             var bCode=data.codeResult.code;    
               // we have detected a code, since indexdb are async we have to pause quagga first and test if the 
               // scanned code is available in the list of products
  Quagga.stop();
        getObjectStore('data', 'readwrite').get('soko-store-' + localStorage.getItem('soko-active-store') + '-products').onsuccess = function (event) {
var sts=$.parseJSON(event.target.result);
            
            
            var cpt=false;
            for(var j in sts ){
                
            if(sts[j].barCode==bCode){
               cpt=true;
               // we have found a matching code so we add it to the cart and continue scanning
                
                
            addScannedToCart(sts[j]) 
                alert('added '+sts[j].name+' to cart')
               
               }
                if(!cpt){
             // we have not found a matching code so we continue the scanning
                    console.log('no product matched with '+bCode+' continuing search..')
  Quagga.start();   
                }
            }
        }  
                 
                 
                 
              
                 
                 
            })


            Quagga.init({
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
