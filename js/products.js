function refreshProducts() {
    doFetch({
        action: 'getProducts',
        id: localStorage.getItem('soko-active-store')
    }).then(function (e) {
        console.log(e);
        getObjectStore('data', 'readwrite').put(JSON.stringify(e.products), 'soko-store-' + id + '-products');
        productsUpdater();
        promoCreator();
    }).catch(function (err) {
        productsUpdater();
        promoCreator();
    });
}

function productsUpdater() {
    getObjectStore('data', 'readwrite').get('soko-store-' + localStorage.getItem('soko-active-store') + '-products').onsuccess = function (event) {
        var reqs = event.target.result;
        try {
            reqs = JSON.parse(reqs);
        } catch (err) {
            reqs = []
        };
        $(".products-collapsible").html('');
        $(".allProdCount").html(reqs.length);
        if (reqs.length == 0) {
            var html = ' <li class="collection-item avatar" style="opacity: 0.6;"><i class="mdi-action-shopping-basket grey circle"></i><div class="row">' + '<p class="collections-title"><strong>No products found</strong></p><p class="collections-content">add a product to this store below</p></div>' + '</li>';
            $(".products-collapsible").append($.parseHTML(html));
            $("#promotions>.fixed-action-btn>a").attr('href', '#firstProdModal');
            $('#firstProdModal').modal({
                dismissible: false,
                complete: function () {
                    $('#add-product').modal({
                        dismissible: false
                    });
                }
            }).modal('open');
            return;
        } else {
            $("#promotions>.fixed-action-btn>a").attr('href', '#newPromoModal');
            $('#firstProdModal').modal('close');
        }

        for (var i = 0; i < reqs.length; ++i) {
            //  var saleAmount=Math.ceil(parseFloat(reqs[i].amount)/100000000 *loCon.xrate*loCon.rate)+'/= '+loCon.symbol;
            // var saleTime=moment(reqs[i].posted).fromNow();
            //var html = ''+saleAmount+'</h5><small class="noteC-time text-muted">'+saleTime+'</small></div></div></a>';
            var html = '<li prid="' + reqs[i].id + '" style="margin-bottom:10px; background: rgb(255, 255, 255);">' + '<div class="prodImgDskt" id="prodImg-holda-' + reqs[i].id + '" style="background-size: cover;background-repeat: no-repeat;background-position: center;background-image:url(' + reqs[i].imagePath + ');width: 90px;height: 86px;float: left;"></div><div class="collapsible-header" style="width: calc(100% - 90px);display:inline-block;border-bottom:none;">' + reqs[i].name + '<div class="divider"></div><span >' + '<i class="{{product.icon}}"></i>' + reqs[i].quantity + ' available<div class="divider"></div></span></div><div class="collapsible-body"><div style="width: 100%;text-align: center;margin: 20px 0px 0px;color: rgba(0,0,0,0.4);">sale information</div>' + '<form class="col s12" style="padding: 20px 30px;"><div class="row"><div class="input-field col s12">' + '<input id="prodName-' + reqs[i].id + '" prnm="name" type="text" class="validate" prid="' + reqs[i].id + '" value="' + reqs[i].name + '"><label for="prodName-' + reqs[i].id + '" class="">Name</label></div></div>' + '<div class="row"><div class="input-field col s12"><input prnm="description" placeholder="" value="' + reqs[i].description + '" id="prodDesc-' + reqs[i].id + '" type="text" class="validate" prid="' + reqs[i].id + '" min="0">' + '<label for="description" class="">Description</label></div></div><div class="row">' + '<div class="file-field input-field"><div class="btn opacitySelectedColor"><span>image</span><input id="prodImg-' + reqs[i].id + '" prid="' + reqs[i].id + '" prnm="image" type="file">' + '</div><div class="file-path-wrapper"><input class="file-path validate" type="text"></div></div>' + '<div class="input-field col s6"><input prnm="price" placeholder="" value="' + reqs[i].price + '" id="prodPrice-' + reqs[i].id + '" type="number" class="validate" prid="' + reqs[i].id + '" min="0">' + '<label for="prodPrice-' + reqs[i].id + '" class="active">Price</label></div><div class="input-field col s6">' + '<div class="select-wrapper initialized"><span class="caret">▼</span><select id="prodMetric-' + reqs[i].id + '" prnm="metric" class="initialized" >' + '<option value="" disabled="" selected="">measurement</option>' + '<option value="1">per Kilogram</option>' + '<option value="2">per Piece</option>' + '</select></div></div></div><div style="width: 100%;text-align: center;margin: 20px 0px 0px;color: rgba(0,0,0,0.4);">availability</div>' + '<div class="row"><div class="input-field col s6">' + '<input placeholder="" prnm="rstQuantity" id="prodRestNo-' + reqs[i].id + '" type="number" value="' + reqs[i].rstQuantity + '" class="validate" min="0" prid="' + reqs[i].id + '" max="1000">' + '<label for="prodRestNo-' + reqs[i].id + '" class="active"> Quantity</label></div>' + '<div class="input-field col s6"><div class="select-wrapper initialized"><span class="caret">▼</span>' + '<select id="prodRestDur-' + reqs[i].id + '" prnm="rstDuration" class="initialized">' + '<option value="" disabled="" selected="' + reqs[i].rstDuration + '">duration</option>' + '<option value="day">per Day</option>' + '<option value="week">per Week</option>' + '<option value="month">per Month</option>' + '</select></div></div></div>' + '<div class="row" style="text-align: right;margin: 20px 0px;"> <a prid="' + reqs[i].id + '" class="opacitySelectedColor removeProduct waves-effect waves-light btn">remove product</a> </div>' + '</form></div></li>';
            $(".products-collapsible").append($.parseHTML(html));
        }
        $('.products-collapsible').collapsible();
        $('select').material_select();
        Materialize.updateTextFields();
        initProdCallback();
    }
}

function updateProd(t) {
    //var prid = $(t.target).parent().parent().parent().parent().parent().attr('prid');
    var prid = $(t.target).attr('prid');
    var name = $(t.target).attr('prnm');
    var val = $(t.target).val();
    if (name == 'image') {
        var files = t.target.files;
        var file = files[0];
        if (file) {
            var canvas = document.querySelectorAll('#tmp-canvas > canvas')[0];
            var ctx = canvas.getContext("2d");
            var cw = canvas.width;
            var ch = canvas.height;
            // limit the image to 150x100 maximum size
            var maxW = 480;
            var maxH = 320;
            var img = new Image;
            img.onload = function () {
                var iw = img.width;
                var ih = img.height;
                var scale = Math.min((maxW / iw), (maxH / ih));
                var iwScaled = iw * scale;
                var ihScaled = ih * scale;
                canvas.width = iwScaled;
                canvas.height = ihScaled;
                ctx.drawImage(img, 0, 0, iwScaled, ihScaled);
                val = canvas.toDataURL();
                doFetch({
                    action: 'doProdUpdate',
                    id: prid,
                    prop: name,
                    val: val
                }).then(function (e) {
                    if (e.status == 'ok') {
                        document.querySelector('#prodImg-holda-' + prid).src = val;
                        Materialize.toast('modified ' + name + '..', 3000);
                    } else {
                        console.log(e);
                    }
                });
            };
            img.src = URL.createObjectURL(file);
        }
    } else {
        doFetch({
            action: 'doProdUpdate',
            id: prid,
            prop: name,
            val: val
        }).then(function (e) {
            if (e.status == 'ok') {
                Materialize.toast('modified ' + name + '..', 3000);
            } else {
                console.log(e);
            }
        });
    }
}

function initProdCallback() {
    var forEach = function (array, callback, scope) {
        for (var i = 0; i < array.length; i++) {
            callback.call(scope, i, array[i]); // passes back stuff we need
        }
    };
    var myNodeList = document.querySelectorAll('.products-collapsible input');
    forEach(myNodeList, function (index, value) {
        value.addEventListener("change", updateProd);
    });
}

function addProduct() {
    var forEach = function (array, callback, scope) {
        for (var i = 0; i < array.length; i++) {
            callback.call(scope, i, array[i]); // passes back stuff we need
        }
    };
    var myNodeList = document.querySelectorAll('#add-product input');
    forEach(myNodeList, function (index, value) {
        // value.addEventListener("change", updateStore);
    });
    doFetch({
        action: 'doNewProduct',
        id: localStorage.getItem('soko-active-store'),
        prod: newProdDat
    }).then(function (e) {
        if (e.status == 'ok') {
            refreshProducts();
            Materialize.toast('added ..', 3000);
            $('#add-product').modal('close');
        } else {
            console.log(e);
        }
    });
}
var shroot = document.querySelectorAll(".removeProduct");
for (var i = 0; i < shroot.length; ++i) {
    var id = $(this).attr('prid');
    shroot[i].addEventListener("touchstart", function () {
        doFetch({
            action: 'doProdRemove',
            id: id
        }).then(function (e) {
            if (e.status == 'ok') {
                //document.querySelector('#prodImg-holda-'+prid).src = val;
                //  Materialize.toast('modified '+name+'..', 3000);
            } else {
                console.log(e);
            }
        });
    }, false);
};
var shroot = document.querySelectorAll("#add-product input");
newProdDat = {};
for (var i = 0; i < shroot.length; ++i) {
    var id = $(this).attr('prid');
    shroot[i].addEventListener("change", function () {
        var value = this;
        var val = $(value).attr('prid');
        if (val == 'undefined' || val == undefined) {
            val = $(value).parent().parent().attr('prid')
        }
        if (val == 'image') {
            //console.log(this,value);
            //var files = this.target.files;
            var file = value.files[0];
            if (file) {
                var canvas = document.querySelectorAll('#tmp-canvas > canvas')[0];
                var ctx = canvas.getContext("2d");
                var cw = canvas.width;
                var ch = canvas.height;
                // limit the image to 150x100 maximum size
                var maxW = 480;
                var maxH = 320;
                var img = new Image;
                img.onload = function () {
                    var iw = img.width;
                    var ih = img.height;
                    var scale = Math.min((maxW / iw), (maxH / ih));
                    var iwScaled = iw * scale;
                    var ihScaled = ih * scale;
                    canvas.width = iwScaled;
                    canvas.height = ihScaled;
                    ctx.drawImage(img, 0, 0, iwScaled, ihScaled);
                    newProdDat[val] = canvas.toDataURL();
                };
                img.src = URL.createObjectURL(file);
            }
        } else {
            newProdDat[val] = $(value).val();
        }
    }, false);
};
/*
 $('#firstProdModal').modal({
      dismissible: false,
      complete: function() { $('#add-product').openModal({ dismissible: false }); } // Callback for Modal close
    });
*/
//Products Form Validation
$('#submitProdForm').click(function (e) {
    //    var isValid = true;
    name_ = $('#name').val();
    description_ = $('#description').val();
    image_ = $('#image').val();
    amount_ = $('#amount').val();
    prodCy_ = $('#prod-cy').val();
    isValid = true;
    if (name_ == '' || name_ == null) {
        Materialize.toast('Ooops! Please enter product name', 3000);
        $('#name').css({
            "border-bottom": "1px solid red",
            "background": ""
        });
    } else if (description_ == '' || description_ == null) {
        Materialize.toast('Ooops! Please enter product description', 3000);
        $('#description').css({
            "border-bottom": "1px solid red",
            "background": ""
        });
    } else if (image_ == '' || image_ == null) {
        Materialize.toast('Ooops! Please select an image', 3000);
        $('#image').css({
            "border-bottom": "1px solid red",
            "background": ""
        });
    } else if (amount_ == '' || amount_ == null) {
        Materialize.toast('Ooops! Please enter amount', 3000);
        $('#amount').css({
            "border-bottom": "1px solid red",
            "background": ""
        });
    } else if (prodCy_ == '' || prodCy_ == null) {
        Materialize.toast('Ooops! Please enter quantity', 3000);
        $('#prodCy').css({
            "border-bottom": "1px solid red",
            "background": ""
        });
    } else {
        var shroot = document.querySelectorAll(".addProduct");
        for (var i = 0; i < shroot.length; ++i) {
            shroot[i].addEventListener("touchstart", addProduct, false);
        };
        $("#name, #description, #image, #amount, #prodCy").css({
            "border-bottom": "2px solid green",
            "background": ""
        });
    }
});
//Remove product
//var shroot = document.querySelectorAll(".removeProduct");
//for (var i = 0; i < shroot.length; ++i) {
//    //     id=$(this).attr('prid');
//    //console.log(id);
//    shroot[i].addEventListener("touchstart", function () {
//        console.log(this)
//        doFetch({
//            action: 'doProdRemove'
//            , id: $(this).attr('prid')
//        }).then(function (e) {
//            if (e.status == 'ok') {
//                $(document).on('touchstart click', '.removeProduct', function (event) {
//                    console.log("Product Removed Successfully");
//                    $(this).parent().parent().parent().parent().remove();
//                });
//                //document.querySelector('#prodImg-holda-'+prid).src = val;
//                //  Materialize.toast('modified '+name+'..', 3000);
//            }
//            else {
//                console.log(e);
//            }
//        });
//    }, false);
//};

//Remove Product
//$(document).on('touchstart click', '.removeProduct', function (event) {
//    console.log("Product Removed Successfully");
//    parent_div = $(this).parent().parent().parent().parent()
//    id = $(parent_div).attr('prid')
//    $(this).parent().parent().parent().parent().remove();
//    //    console.log(event)
//    doFetch({
//        action: 'removeProduct',
//        id: id
//    }).then(function (e) {
//        if (e.status == 'ok') {
//            //document.querySelector('#prodImg-holda-'+prid).src = val;
//            //  Materialize.toast('modified '+name+'..', 3000);
//        } else {
//            console.log(e);
//        }
//    });
//});


//$(document).on('touchstart click', '.removeProduct', function (event) {
//    getObjectStore('data', 'readwrite').get('soko-store-' + localStorage.getItem('soko-active-store') + '-promotions').onsuccess = function (event) {
//        try {
//            e = JSON.parse(event.target.result);
//        } catch (err) {
//            console.log('unable to access products list. ' + err);
//            return;
//        }
//        console.log(ttt);
//        if ($('input[name=promoItems]').is(':checked')) {
//            Materialize.toast('This Product Is In An Active Promotion', 3000);
//        } else if (document.getElementsByName("promoItems").checked = false) {
//            console.log("Product Removed Successfully");
//            parent_div = $(this).parent().parent().parent().parent()
//            id = $(parent_div).attr('prid')
//            $(this).parent().parent().parent().parent().remove();
//            //    console.log(event)
//            doFetch({
//                action: 'removeProduct',
//                id: id
//            }).then(function (e) {
//                if (e.status == 'ok') {
//                    //document.querySelector('#prodImg-holda-'+prid).src = val;
//                    //  Materialize.toast('modified '+name+'..', 3000);
//                } else {
//                    console.log(e);
//                }
//            });
//        } else {
//            console.log("Unable to get product list");
//        }
//    }
//});


function getProductsPromotions() {
    promos_to_products = {}
    promotions = $('.promotions-holda').find('.p-card')

    $.each(promotions, function (index, promotion) {
        unique_id = $(promotion).attr('id')
        promos_to_products[unique_id] = []
    })

    $.each(promotions, function (index, promotion) {
        products_in_promotion = $(promotion).find('li');
        $.each(products_in_promotion, function (index, products) {
            check = $(products).find('input')[0]
            if ($(check).is(':checked')) {
                product_id = $(check).attr('id')
                promos_to_products[$(promotion).attr('id')].push(product_id)
            }
        })

    })

    //    console.log('checked products: ', promos_to_products)

    return promos_to_products
}

$(document).on('touchstart click', '.removeProduct', function (event) {
    event.preventDefault()

    //    console.log('clicked event')

    parent_div = $(this).parent().parent().parent().parent()
    search_for = $(parent_div).attr('prid')

    console.log('id to check: ', search_for)

    promos = getProductsPromotions()
    found = false
    found_id = null

    $.each(promos, function (key, value) {
        $.each(value, function (index, product_id) {
            if (search_for == product_id) {
                found = true
                found_id = product_id
            }
        })
    })

    if (found) {
        console.log('product is checked');
        Materialize.toast('This product is in an active promotion', 3000);
    } else {
        console.log('the product is not checked');
        parent_div = $(this).parent().parent().parent().parent()
        id = $(parent_div).attr('prid')
        //    console.log(event)
        doFetch({
            action: 'removeProduct',
            id: id
        }).then(function (e) {
            if (e.status == 'ok') {
                console.log("Product Removed Successfully");
                $(this).parent().parent().parent().parent().remove();
            } else {
                console.log(e);
            }
        });
    }

})
