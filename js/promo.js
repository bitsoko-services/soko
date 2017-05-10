function refreshPromotions() {
    doFetch({
        action: 'getPromotions',
        id: id
    }).then(function (e) {
        console.log(e);
        getObjectStore('data', 'readwrite').put(JSON.stringify(e.promotions), 'soko-store-' + id + '-promotions');
        promoUpdater();
        promoCreator();
    }).catch(function (err) {
        promoUpdater();
        promoCreator();
    });
}

function promoUpdater() {
    getObjectStore('data', 'readwrite').get('soko-store-' + localStorage.getItem('soko-active-store') + '-promotions').onsuccess = function (event) {
        var reqs = event.target.result;
        try {
            reqs = JSON.parse(reqs);
        } catch (err) {
            console.log('unable to access promotions list. ' + err);

            reqs = [];
        }

        $(".allPromosCount").html(reqs.length);
        $(".promotions-holda").html('');
        //TO_DO MAKE SURE THERE EXISTS PRODUCTS TO PROMOTE FIRST!!
        if (reqs.length == 0) {
            var html = '<li class="collection-item avatar" style="opacity: 0.6;"><i class="mdi-action-redeem cyan circle"></i>' + '<span class="collection-header">No Promotions Found</span></li>';
            $(".promotions-holda").append($.parseHTML(html));
        }

        for (var i = 0; i < reqs.length; ++i) {
            //  var saleAmount=Math.ceil(parseFloat(reqs[i].amount)/100000000 *loCon.xrate*loCon.rate)+'/= '+loCon.symbol;
            // var saleTime=moment(reqs[i].posted).fromNow();
            //var html = ''+saleAmount+'</h5><small class="noteC-time text-muted">'+saleTime+'</small></div></div></a>';
            var html = '<div id="promo-card" class="card"><div class="card-image waves-effect waves-block waves-light">' + '<img class="activator" src="' + reqs[i].promoBanner + '" alt="user bg"></div><div class="card-content" style="padding: 0px 20px;">' + '<img src="' + reqs[i].promoLogo + '" alt="" class="circle responsive-img activator card-profile-image">' + '<a class="selectedColor btn-floating activator btn-move-up waves-effect waves-light darken-2 right">' + '<svg class="activator" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 490.3 490.3" style="enable-background:new 0 0 490.3 490.3;width: 26px;margin-left: 8px;margin-top: 7px;" xml:space="preserve"><g xmlns="http://www.w3.org/2000/svg"><path d="M438.931,30.403c-40.4-40.5-106.1-40.5-146.5,0l-268.6,268.5c-2.1,2.1-3.4,4.8-3.8,7.7l-19.9,147.4 c-0.6,4.2,0.9,8.4,3.8,11.3c2.5,2.5,6,4,9.5,4c0.6,0,1.2,0,1.8-0.1l88.8-12c7.4-1,12.6-7.8,11.6-15.2c-1-7.4-7.8-12.6-15.2-11.6 l-71.2,9.6l13.9-102.8l108.2,108.2c2.5,2.5,6,4,9.5,4s7-1.4,9.5-4l268.6-268.5c19.6-19.6,30.4-45.6,30.4-73.3 S458.531,49.903,438.931,30.403z M297.631,63.403l45.1,45.1l-245.1,245.1l-45.1-45.1L297.631,63.403z M160.931,416.803l-44.1-44.1 l245.1-245.1l44.1,44.1L160.931,416.803z M424.831,152.403l-107.9-107.9c13.7-11.3,30.8-17.5,48.8-17.5c20.5,0,39.7,8,54.2,22.4 s22.4,33.7,22.4,54.2C442.331,121.703,436.131,138.703,424.831,152.403z" fill="#FFFFFF"></path></g></svg></a><p>' + reqs[i].promoName + '</p><p>' + reqs[i].promoDesc + '</p>' + '<p style="text-align: center;padding: 15px 20px;"><i style="float: left;" class="promo-state-icon mdi-notification-sync"> 0 shares</i>' + '<i class="promo-state-icon mdi-action-favorite"> 0 likes </i>' + '<i style="float: right;" class="promo-state-icon mdi-action-receipt"> 0 sales </i></p>' + '<label><div class="chip"><p class="subsribersNumb">' + cusLen + ' subsriber<span id="subPlural">s</span></p></div></label><div class="divider" style="margin: 10px;"></div><div class="promo-' + reqs[i].id + '-subscribers"></div>' + '</div><div class="card-reveal">' + '<form class="col s12"> <div class="row"> <div class="input-field col s12"> <input id="newPromo-name" type="text" class="validate js-loc-button-notification-input" value="" value="" stitm="name" required> <label for="newPromo-name" class="">Name</label> </div></div><div class="row"> <div class="input-field col s12"> <input id="newPromo-desc" type="text" class="validate js-loc-button-notification-input" value="" stitm="msg" required> <label for="newPromo-desc" class="">Desc</label> </div></div><div class="row"> <div class="file-field input-field"> <div class="btn"><span>image</span> <input id="newPromo-image" type="file" stitm="customImage" required> </div></div></div><div class="row"> <div class="input-field col s6"> <input placeholder="" id="newPromo-discount" type="number" class="validate" min="0" max="90"> <label for="newPromo-discount" class="">% discount</label> </div><div class="input-field col s6"> <input placeholder="" id="newPromo-offers" type="number" class="validate" min="0"> <label for="newPromo-offers" class="">minimum buyers</label> </div></div><div class="row" style="height:200px;overflow:auto;"> <h6 style="text-align:center;">Add an item to this promotion</h6> <ul class="promo-add-new-promotion2"></ul> </div></form>' + '<div class="row" style="text-align: center;margin: 20px 0px;"> <a class="removePromo waves-effect waves-light btn" style="margin-bottom:10px;">remove promotion</a><br><a class="backBtnPromo waves-effect waves-light btn">back</a> </div>' + '</div></div>';
            $(".promotions-holda").prepend($.parseHTML(html));
            addPromoSubscribers(reqs[i].id, reqs[i].promoSubs);
        }
        if (cusLen == 1) {
            document.getElementById('subPlural').innerHTML = '';
        }
        //$('.products-collapsible').collapsible();
        $('select').material_select();
        Materialize.updateTextFields();
        initProdCallback();
        var shroot = document.querySelectorAll(".castPromo");
        for (var i = 0; i < shroot.length; ++i) {
            shroot[i].addEventListener("touchstart", castPromo, false);
        };
    }
}

function addPromoSubscribers(promoid, promoSubs) {
    //console.log(promoid, promoSubs);
    promoSubs = promoSubs;
    getActvStoreCust(promoid, promoSubs).then(function (p) {
        //  console.log(p.promoid, p.promoSubs, p.allCust);
        promoid = p.promoid
        var allCust = p.allCust;
        var subs = p.promoSubs;
        for (var i = 0, subs = subs, promoid = promoid; i < allCust.length; ++i) {
            for (var ii = 0, allCust = allCust, promoid = promoid; ii < subs.length; ++ii) {
                var test = new RegExp(subs[ii].id).test(allCust[i].uid);
                if (test) {
                    console.log('Matched!! ' + allCust[i]);
                    var html = '<div class="chip" style="margin:5px;"><img src="' + allCust[i].img + '" alt="">' + allCust[i].name.split(" ")[0] + '</div>';
                    $(".promo-" + promoid + "-subscribers").append($.parseHTML(html));
                    break;
                } else {
                    continue;
                }
            };
        };
    });
}

function promoCreator() {
    getObjectStore('data', 'readwrite').get('soko-store-' + localStorage.getItem('soko-active-store') + '-products').onsuccess = function (event) {
        try {
            e = JSON.parse(event.target.result);
        } catch (err) {
            console.log('unable to access products list. ' + err);
            return;
        }
        if (e.length == 0) {
            var html = '<li class="collection-item avatar" style="opacity: 0.6;"><i class="mdi-action-redeem cyan circle"></i>' + '<span class="collection-header">No Product Found</span></li>';
            $(".promotions-holda").append($.parseHTML(html));
        } else {
            //setupPromos(e);
            $(".promo-add-new-promotion2").html('');
            /*
	 var html = '<option value="" disabled selected>'+e.length+' items</option>';
		      $( "select.promo-add-ProdList" ).append( $.parseHTML( html ) );
$("select.promo-add-ProdList").select2({
  data: e
})


	 var html = '<option value="" disabled selected>'+e.length+' items</option>';
	     $( "select.promo-add-ProdList" ).append( $.parseHTML( html ) );
       */
            for (var i = 0; i < e.length; ++i) {
                var html = '<li value="' + e[i].id + '" label="' + e[i].id + '" data-icon="' + e[i].imagePath + '" class="circle" selected>' + '<p><div class="row col s12"> <div class="col s6"> <input name="promoItems" type="checkbox" id="' + e[i].id + '" checked="checked"/><label for="' + e[i].id + '">' + e[i].name + '</label></div> <div class="col s4"><div style="display:inline-flex;"><button href="#" class="counter-left">-</button><input class="' + e[i].id + '" type="number" value="1" style="width:30px;text-align:center;margin-top:-6px;"><button href="#" class="counter-right">+</button></div></div></div></p>' + '</li>' + '</li>';
                $(".promo-add-new-promotion2").append($.parseHTML(html));
            }
            $('select').material_select();

            $('.counter-left').click(function (event) {
                event.preventDefault()
                minus = $(this).next('input')
                minus_ = minus.val()
                if (minus_ !== '1') {
                    minus_ = parseInt(minus_) - 1
                }
                minus.val(minus_)
            })

            $('.counter-right').click(function (event) {
                event.preventDefault()
                add = $(this).prev('input')
                add_ = add.val()
                add_ = parseInt(add_) + 1
                add.val(add_)
            })
        }
    }
}

function castPromo(t) {
    getObjectStore('data', 'readwrite').get('soko-store-customers-' + localStorage.getItem('soko-active-store')).onsuccess = function (event) {
        var reqs = event.target.result;
        var precp = [];
        reqs = JSON.parse(reqs);
        console.log(reqs);
        for (var i = 0; i < reqs.length; ++i) {
            precp.push(reqs[i].uid);
        }
        doFetch({
            action: 'doCastPromo',
            id: $(t.target).attr('pid'),
            to: precp
        }).then(function (e) {
            if (e.status == 'ok') {
                Materialize.toast('sent promotion', 3000);
            } else {
                console.log(e);
            }
        });
    }
}

function doNewPromo() {
    var items = [];
    var x = document.querySelector('.promo-add-new-promotion2 ul');
    var selcItms = document.querySelector('.promo-add-new-promotion2 input').value.split(', ');
    var selcIds = new Array();
    var allItms = new Array();
    //    for (i = 0, allItms = allItms, selcIds = selcIds; i < x.length; i++) {
    //        allItms.push({
    //            name: x.options[i].text,
    //            id: x.options[i].getAttribute('value')
    //        });
    //    }
    //    for (ii = 0, allItms = allItms, selcIds = selcIds; ii < selcItms.length; ii++) {
    //        function findChosen(it) {
    //            return it.name === selcItms[ii];
    //        }
    //        selcIds.push(parseInt(allItms.find(findChosen).id));
    //    }
    var boxes = $('input[name=promoItems]:checked');
    for (i = 0; i < boxes.length; i++) {
        console.log('ID is: ' + boxes[i].id);
        var productID = boxes[i].id;
        console.log('The item is added ' + $('li.circle input.' +
            productID).val() + ' times');
        var times = $('li.circle input.' + productID).val();
        for (j = 0; j < times; j++) {
            console.log('Product is: ' + productID);
            selcIds.push(parseInt(productID));
        }
    }

    console.log(boxes);
    $('.promo-add-new-promotion2')
    doFetch({
        action: 'doNewPromo',
        ownerid: activeStore().id,
        name: document.querySelector('#newPromo-name').value,
        desc: document.querySelector('#newPromo-desc').value,
        image: document.querySelector('#newPromo-image').value,
        items: selcIds,
        discount: document.querySelector('#newPromo-discount').value,
        offers: document.querySelector('#newPromo-offers').value
    }).then(function (e) {
        if (e.status == 'ok') {
            Materialize.toast('added new promotion..', 3000);
            refreshPromotions();
        } else {
            console.log(e);
        }
    });
}
//Empty Promo Card
$('#makeCard').click(function () {
    var structure = $('<div id="promo-card" class="card loadCard"><div class="card-image waves-effect waves-block waves-light">' + '<img class="activator" src="" alt="user bg"></div><div class="card-content" style="padding: 0px 20px;">' + '<img src="" alt="" class="circle responsive-img activator card-profile-image">' + '<a class="btn-floating activator btn-move-up waves-effect waves-light darken-2 right">' + '<svg class="activator" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 490.3 490.3" style="enable-background:new 0 0 490.3 490.3;width: 26px;margin-left: 8px;margin-top: 7px;" xml:space="preserve"><g xmlns="http://www.w3.org/2000/svg"><path d="M438.931,30.403c-40.4-40.5-106.1-40.5-146.5,0l-268.6,268.5c-2.1,2.1-3.4,4.8-3.8,7.7l-19.9,147.4 c-0.6,4.2,0.9,8.4,3.8,11.3c2.5,2.5,6,4,9.5,4c0.6,0,1.2,0,1.8-0.1l88.8-12c7.4-1,12.6-7.8,11.6-15.2c-1-7.4-7.8-12.6-15.2-11.6 l-71.2,9.6l13.9-102.8l108.2,108.2c2.5,2.5,6,4,9.5,4s7-1.4,9.5-4l268.6-268.5c19.6-19.6,30.4-45.6,30.4-73.3 S458.531,49.903,438.931,30.403z M297.631,63.403l45.1,45.1l-245.1,245.1l-45.1-45.1L297.631,63.403z M160.931,416.803l-44.1-44.1 l245.1-245.1l44.1,44.1L160.931,416.803z M424.831,152.403l-107.9-107.9c13.7-11.3,30.8-17.5,48.8-17.5c20.5,0,39.7,8,54.2,22.4 s22.4,33.7,22.4,54.2C442.331,121.703,436.131,138.703,424.831,152.403z" fill="#FFFFFF"></path></g></svg></a><p>' + '</p><p>' + '</p>' + '<p style="text-align: center;padding: 15px 20px;"><i style="float: left;" class="promo-state-icon mdi-notification-sync"> 0 shares</i>' + '<i class="promo-state-icon mdi-action-favorite"> 0 likes </i>' + '<i style="float: right;" class="promo-state-icon mdi-action-receipt"> 0 sales </i></p>' + '<label>offer subscribers</label><div class="divider" style="margin: 10px;"></div><div class="promo-' + '-subscribers"></div>' + '</div><div class="card-reveal revealOnLoad" style="">' + '<form class="col s12"> <div class="row"> <div class="input-field col s12"> <input id="newPromo-name" type="text" class="validate js-loc-button-notification-input" value="" value="" stitm="name" required> <label for="newPromo-name" class="">Name</label> </div></div><div class="row"> <div class="input-field col s12"> <input id="newPromo-desc" type="text" class="validate js-loc-button-notification-input" value="" stitm="msg" required> <label for="newPromo-desc" class="">Desc</label> </div></div><div class="row"> <div class="file-field input-field"> <div class="btn"><span>image</span> <input id="newPromo-image" type="file" stitm="customImage" required> </div></div></div><div class="row"> <div class="input-field col s6"> <input placeholder="" id="newPromo-discount" type="number" class="validate" min="0" max="90"> <label for="newPromo-discount" class="">% discount</label> </div><div class="input-field col s6"> <input placeholder="" id="newPromo-offers" type="number" class="validate" min="0"> <label for="newPromo-offers" class="">minimum buyers</label> </div></div><div class="row" style="overflow:auto;"> <h6 style="text-align:center;">Add an item to this promotion</h6> <ul class="promo-add-new-promotion2"></ul> </div></form>' + '<div class="row" style="text-align: center;margin: 20px 0px;"> <a href="#!" class="doAddNewPromo waves-effect waves-green btn-flat" style="background:#26A69A;color:white;margin-bottom:10px;">add promotion</a><br><a class="removePromo waves-effect waves-light btn" style="margin-bottom:10px;">CANCEL</a><br></div>' + '</div></div>');
    $('.promotions-holda').prepend(structure);
    for (var i = 0; i < e.length; ++i) {
        var html = '<li value="' + e[i].id + '" label="' + e[i].id + '" data-icon="' + e[i].imagePath + '" class="circle" selected>' + '<p><div class="row col s12"> <div class="col s6"> <input name="promoItems" type="checkbox" id="' + e[i].id + '" checked="checked"/><label for="' + e[i].id + '">' + e[i].name + '</label></div> <div class="col s4"><div style="display:inline-flex;"><button href="#" class="counter-left">-</button><input class="' + e[i].id + '" type="number" value="1" style="width:30px;text-align:center;margin-top:-6px;"><button href="#" class="counter-right">+</button></div></div></div></p>' + '</li>' + '</li>';
        $(".promo-add-new-promotion2").append($.parseHTML(html));
    }
    $('.doAddNewPromo').click(function (e) {
        //    var isValid = true;
        promoName_ = $('#newPromo-name').val();
        promoDescription_ = $('#newPromo-desc').val();
        promoImage_ = $('#newPromo-image').val();
        promoAmount_ = $('#newPromo-discount').val();
        promoOffers_ = $('#newPromo-offers').val();
        isValid = true;
        if (promoName_ == '' || promoName_ == null) {
            Materialize.toast('Ooops! Please enter promotion name', 3000);
            $('#newPromo-name').css({
                "border-bottom": "1px solid red",
                "background": ""
            });
        } else if (promoDescription_ == '' || promoDescription_ == null) {
            Materialize.toast('Ooops! Please enter promotion description', 3000);
            $('#newPromo-desc').css({
                "border-bottom": "1px solid red",
                "background": ""
            });
        } else if (promoImage_ == '' || promoImage_ == null) {
            Materialize.toast('Ooops! Please select an image', 3000);
            $('#newPromo-image').css({
                "border-bottom": "1px solid red",
                "background": ""
            });
        } else if (promoAmount_ == '' || promoAmount_ == null) {
            Materialize.toast('Ooops! Please enter promotion discount', 3000);
            $('#newPromo-discount').css({
                "border-bottom": "1px solid red",
                "background": ""
            });
        } else {
            var shroot = document.querySelectorAll(".doAddNewPromo");
            for (var i = 0; i < shroot.length; ++i) {
                shroot[i].addEventListener("touchstart", doNewPromo, false);
            };
            $(this).css({
                "border": "",
                "background": ""
            });
        }
    });

});
//subscription singilar/plural


//scroll to top onclick add promo
$("#makeCard").on("click", function () {
    $(window).scrollTop(0);
});

//Remove Promotion
$(document).on('touchstart click', '.removePromo', function (event) {
    console.log("Promotion Removed Successfully");
    $(this).parent().parent().parent().remove();
});

//Hide Card Reveal on Promotion Page
$(document).on('touchstart click', '.backBtnPromo', function (event) {
    $(this).parent().parent().hide();
});

//Prevent dropdown content on Promotion page closing on touchstart
$(document).on('touchstart click', '.multiple-select-dropdown', function (event) {
    event.stopPropagation();
});

//var shroot = document.querySelectorAll(".doAddNewPromo");
//for (var i = 0; i < shroot.length; ++i) {
//    shroot[i].addEventListener("touchstart", doNewPromo, false);
//};
