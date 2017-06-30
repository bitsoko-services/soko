function refreshPromotions() {
    doFetch({
        action: 'getPromotions',
        id: localStorage.getItem('soko-active-store')
    }).then(function (e) {
        //Subscribers Id
        var promoSubsId = e.promotions;


        for (var i = 0; i < promoSubsId.length; i++) {
            var allPromo = promoSubsId[i].promoSubs;

            for (var s = 0; s < allPromo.length; s++) {
                console.log('[++++++++++++++]' + promoSubsId[i].id + allPromo[s].id)
            }
        }
        if (e.status == 'ok') {
            getObjectStore('data', 'readwrite').put(JSON.stringify(e.promotions), 'soko-store-' + id + '-promotions');
        } else {

            getObjectStore('data', 'readwrite').put('[]', 'soko-store-' + id + '-promotions');
        }
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
            refreshPromotions();
            return;
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

            var html = '<div id="promo-card-' + reqs[i].id + '" class="p-card card"> <div class="card-image"> <img src="' + reqs[i].promoBanner + '" alt="user bg" style="height:165px"> <span class="card-title"></span> </div><div class="card-content" style="padding-top:0px;padding-bottom:0px;"> <h5 style="font-size:1.4rem;">' + reqs[i].promoName + '</h5> <p>' + reqs[i].promoDesc + '</p></div><div id="promoMenu" style="padding:10px;text-align: center;/* background: #ffffff; */"> <div class="row" style="margin-bottom:0px;"> <div class="col s4" style="">  <p class="subsribersNumb" style="margin:0px;font-size:0.8rem;line-height:1;padding-bottom:3px;">0<br> like<span id="subPlural">s</span></p><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 478.2 478.2" style="enable-background:new 0 0 478.2 478.2;width:15px;" xml:space="preserve"> <path d="M457.575,325.1c9.8-12.5,14.5-25.9,13.9-39.7c-0.6-15.2-7.4-27.1-13-34.4c6.5-16.2,9-41.7-12.7-61.5 c-15.9-14.5-42.9-21-80.3-19.2c-26.3,1.2-48.3,6.1-49.2,6.3h-0.1c-5,0.9-10.3,2-15.7,3.2c-0.4-6.4,0.7-22.3,12.5-58.1 c14-42.6,13.2-75.2-2.6-97c-16.6-22.9-43.1-24.7-50.9-24.7c-7.5,0-14.4,3.1-19.3,8.8c-11.1,12.9-9.8,36.7-8.4,47.7 c-13.2,35.4-50.2,122.2-81.5,146.3c-0.6,0.4-1.1,0.9-1.6,1.4c-9.2,9.7-15.4,20.2-19.6,29.4c-5.9-3.2-12.6-5-19.8-5h-61 c-23,0-41.6,18.7-41.6,41.6v162.5c0,23,18.7,41.6,41.6,41.6h61c8.9,0,17.2-2.8,24-7.6l23.5,2.8c3.6,0.5,67.6,8.6,133.3,7.3 c11.9,0.9,23.1,1.4,33.5,1.4c17.9,0,33.5-1.4,46.5-4.2c30.6-6.5,51.5-19.5,62.1-38.6c8.1-14.6,8.1-29.1,6.8-38.3 c19.9-18,23.4-37.9,22.7-51.9C461.275,337.1,459.475,330.2,457.575,325.1z M48.275,447.3c-8.1,0-14.6-6.6-14.6-14.6V270.1 c0-8.1,6.6-14.6,14.6-14.6h61c8.1,0,14.6,6.6,14.6,14.6v162.5c0,8.1-6.6,14.6-14.6,14.6h-61V447.3z M431.975,313.4 c-4.2,4.4-5,11.1-1.8,16.3c0,0.1,4.1,7.1,4.6,16.7c0.7,13.1-5.6,24.7-18.8,34.6c-4.7,3.6-6.6,9.8-4.6,15.4c0,0.1,4.3,13.3-2.7,25.8 c-6.7,12-21.6,20.6-44.2,25.4c-18.1,3.9-42.7,4.6-72.9,2.2c-0.4,0-0.9,0-1.4,0c-64.3,1.4-129.3-7-130-7.1h-0.1l-10.1-1.2 c0.6-2.8,0.9-5.8,0.9-8.8V270.1c0-4.3-0.7-8.5-1.9-12.4c1.8-6.7,6.8-21.6,18.6-34.3c44.9-35.6,88.8-155.7,90.7-160.9 c0.8-2.1,1-4.4,0.6-6.7c-1.7-11.2-1.1-24.9,1.3-29c5.3,0.1,19.6,1.6,28.2,13.5c10.2,14.1,9.8,39.3-1.2,72.7 c-16.8,50.9-18.2,77.7-4.9,89.5c6.6,5.9,15.4,6.2,21.8,3.9c6.1-1.4,11.9-2.6,17.4-3.5c0.4-0.1,0.9-0.2,1.3-0.3 c30.7-6.7,85.7-10.8,104.8,6.6c16.2,14.8,4.7,34.4,3.4,36.5c-3.7,5.6-2.6,12.9,2.4,17.4c0.1,0.1,10.6,10,11.1,23.3 C444.875,295.3,440.675,304.4,431.975,313.4z"></path> </svg> </div><div class="col s4" style="">  <p class="subsribersNumb" style="margin:0px;font-size:0.8rem;line-height:1;padding-bottom:3px;"> 0<br> share<span id="subPlural">s</span></p><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 58.995 58.995" style="enable-background:new 0 0 58.995 58.995;height: 17px;margin-left: 0px;" xml:space="preserve"><path d="M39.927,41.929c-0.524,0.524-0.975,1.1-1.365,1.709l-17.28-10.489c0.457-1.144,0.716-2.388,0.716-3.693 c0-1.305-0.259-2.549-0.715-3.693l17.284-10.409C40.342,18.142,43.454,20,46.998,20c5.514,0,10-4.486,10-10s-4.486-10-10-10 s-10,4.486-10,10c0,1.256,0.243,2.454,0.667,3.562L20.358,23.985c-1.788-2.724-4.866-4.529-8.361-4.529c-5.514,0-10,4.486-10,10 s4.486,10,10,10c3.495,0,6.572-1.805,8.36-4.529L37.661,45.43c-0.43,1.126-0.664,2.329-0.664,3.57c0,2.671,1.04,5.183,2.929,7.071 c1.949,1.949,4.51,2.924,7.071,2.924s5.122-0.975,7.071-2.924c1.889-1.889,2.929-4.4,2.929-7.071s-1.04-5.183-2.929-7.071 C50.169,38.029,43.826,38.029,39.927,41.929z M46.998,2c4.411,0,8,3.589,8,8s-3.589,8-8,8s-8-3.589-8-8S42.586,2,46.998,2z M11.998,37.456c-4.411,0-8-3.589-8-8s3.589-8,8-8s8,3.589,8,8S16.409,37.456,11.998,37.456z M52.654,54.657 c-3.119,3.119-8.194,3.119-11.313,0c-1.511-1.511-2.343-3.521-2.343-5.657s0.832-4.146,2.343-5.657 c1.56-1.56,3.608-2.339,5.657-2.339s4.097,0.779,5.657,2.339c1.511,1.511,2.343,3.521,2.343,5.657S54.166,53.146,52.654,54.657z"></path></svg></div><div class="col s4" style="">    <p class="subsribersNumb" style="margin:0px;font-size:0.8rem;line-height:1;padding-bottom:3px;">' + cusLen + '<br> subsriber<span id="subPlural">s</span></p> <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;width: 20px;" xml:space="preserve"><g><g><path d="M392.531,221.867c-6.229,0-12.134,1.775-17.229,4.83c-1.877-21.803-20.224-38.963-42.505-38.963 c-10.829,0-20.736,4.062-28.271,10.735c-6.042-16.222-21.692-27.802-39.996-27.802c-11.042,0-21.129,4.224-28.715,11.136 L221.813,41.737C217.836,5.419,196.418,0,184.002,0c-22.562,0-38.938,17.946-38.929,42.974l8.533,238.933 c0.162,4.702,3.977,8.363,8.832,8.226c4.702-0.179,8.388-4.13,8.226-8.841l-8.533-238.626c0-12.74,6.758-25.6,21.871-25.6 c4.437,0,17.937,0,20.838,26.453l17.067,170.667c0.452,4.523,4.275,8.047,8.917,7.671c4.54-0.23,8.107-3.977,8.107-8.525 c0-14.114,11.486-25.6,25.6-25.6c14.114,0,25.6,11.486,25.6,25.6V230.4c0,4.71,3.823,8.533,8.533,8.533 c4.71,0,8.533-3.823,8.533-8.533c0-14.114,11.486-25.6,25.6-25.6s25.6,11.486,25.6,25.6V256c0,4.71,3.823,8.533,8.533,8.533 c4.71,0,8.533-3.823,8.533-8.533c0-8.934,8.132-17.067,17.067-17.067c8.61,0,17.067,8.457,17.067,17.067v110.933 c0,37.026-7.902,55.714-16.273,75.494c-6.204,14.66-12.604,29.773-16.606,52.506H186.092 c-9.429-41.216-31.249-91.332-64.939-149.111c-3.644-6.255-7.305-12.373-10.931-18.33c-9.301-15.24-10.402-35.499-2.679-49.254 c3.507-6.255,10.419-13.705,23.39-13.705c4.71,0,8.533-3.823,8.533-8.533s-3.823-8.533-8.533-8.533 c-16.563,0-30.157,7.962-38.272,22.417c-10.769,19.183-9.574,45.909,2.995,66.5c3.567,5.862,7.168,11.887,10.761,18.031 c34.62,59.401,56.294,110.106,64.418,150.724c0.794,3.994,4.292,6.861,8.363,6.861h204.8c4.25,0,7.842-3.123,8.448-7.322 c3.533-24.73,10.172-40.422,16.597-55.603c8.661-20.48,17.621-41.651,17.621-82.142V256 C426.664,238.14,410.391,221.867,392.531,221.867z"></path></g></g></svg></div></div></div><div style=" background: #26A69A; color: white;"><div id="myNav' + reqs[i].id + '" class="overlay" style="width: 0%;"> <a href="javascript:void(0)" class="closebtn"  id="myNav' + reqs[i].id + '"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 31.494 31.494" style="enable-background:new 0 0 31.494 31.494;width: 30px;" xml:space="preserve"><path xmlns="http://www.w3.org/2000/svg" style="fill:white;" d="M21.205,5.007c-0.429-0.444-1.143-0.444-1.587,0c-0.429,0.429-0.429,1.143,0,1.571l8.047,8.047H1.111  C0.492,14.626,0,15.118,0,15.737c0,0.619,0.492,1.127,1.111,1.127h26.554l-8.047,8.032c-0.429,0.444-0.429,1.159,0,1.587  c0.444,0.444,1.159,0.444,1.587,0l9.952-9.952c0.444-0.429,0.444-1.143,0-1.571L21.205,5.007z"/></svg></a> <div class="overlay-content"> <div style="background:linear-gradient(rgba(0, 0, 0, 0.61), transparent, rgba(0, 0, 0, 0.26));"><img class="promoBanner" src="' + reqs[i].promoBanner + '" style="height:200px;width:100%;position:relative; z-index:-1;display: block;"></div><h5 style="margin-top:-36px;margin-left:20px;">' + reqs[i].promoName + '</h5><div style="padding: 20px 10%;"><div class="switch" style=" float: right;"> <label><input fid="' + reqs[i].id + '" id="publicSwitch_' + reqs[i].id + '" type="checkbox" pritm="public"> <span class="lever"></span></label> </div><form class="col s12" fid="' + reqs[i].id + '" style="color:black;margin-bottom:20px;"> <div class="row"> <div class="input-field col s12"> <input id="newPromo-name" type="text" class="validate js-loc-button-notification-input" value="' + reqs[i].promoName + '" pritm="name" required> <label for="newPromo-name" class="">Name</label> </div></div><div class="row"> <div class="input-field col s12"> <input id="newPromo-desc" type="text" class="validate js-loc-button-notification-input" value="' + reqs[i].promoDesc + '" pritm="msg" required> <label for="newPromo-desc" class="">Desc</label> </div></div><div class="row"> <div class="file-field input-field"> <div class="btn"><span>image</span> <input id="newPromo-image" type="file" pritm="customImage" required> </div></div></div><div class="row"> <div class="input-field col s6"> <input placeholder="' + reqs[i].discount + '" id="newPromo-discount" type="number" class="validate" min="0" max="90" pritm="discount"> <label for="newPromo-discount" class="">% discount</label> </div><div class="input-field col s6"> <input placeholder="" id="newPromo-offers" type="number" class="validate" min="0" pritm="offers"> <label for="newPromo-offers" class="">minimum buyers</label> </div></div><div class="row" style="height:200px;overflow:auto;"> <h6 style="text-align:center;">Add an item to this promotion</h6> <ul class="promo-add-new-promotion3"></ul> </div><div class="row" style="text-align: center;margin: 20px 0px;"> <a class="removePromo waves-effect waves-light btn" style="margin-bottom:10px;float: left;" id="myNav' + reqs[i].id + '">remove</a><a class="backBtnPromo waves-effect waves-light btn" style="margin-bottom:10px;float: right;"  id = "myNav' + reqs[i].id + '">back</a> </div></form></div></div></div><span style="font-size:30px;cursor:pointer"><p style=" TEXT-ALIGN: CENTER; FONT-SIZE: 14px; padding: 9px; margin: 0px;" class="editPromoBtn" id = "myNav' + reqs[i].id + '">EDIT PROMOTION</p></span></div></div>';


            $(".promotions-holda").prepend($.parseHTML(html));
            addPromoSubscribers(reqs[i].id, reqs[i].promoSubs);
            $(".editPromoBtn").click(function () {
                uniqueId = $(this).attr('id')
                $("#" + uniqueId).width("100%")
                $("#" + uniqueId).scroll(function () {
                    $(".promoBanner").css("opacity", 1 - $("#" + uniqueId).scrollTop() / 150);;
                });
            })
            $(".closebtn").click(function () {
                uniqueId = $(this).attr('id')
                $("#" + uniqueId).width("0%")
            });
            $(".removePromo").click(function () {
                uniqueId = $(this).attr('id')
                $("#" + uniqueId).width("0%")
            });
            $(".backBtnPromo").click(function () {
                uniqueId = $(this).attr('id')
                $("#" + uniqueId).width("0%")
            });
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
        editPromoCallback();

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
            $(".promo-add-new-promotion3").html('');
            for (var i = 0; i < e.length; ++i) {

                $(".promo-add-new-promotion2").append('<li value="' + e[i].id + '" label="' + e[i].id + '" data-icon="' + e[i].imagePath + '" class="circle" selected>' + '<p><div class="row col s12" style="padding:0px;"> <div class="col s6"> <input name="promoItems" type="checkbox" id="' + e[i].id + '"/><label for="' + e[i].id + '">' + e[i].name + '</label></div> <div class="col s4" style="float: right;    float: right;width: auto;height: 30px;padding:0px;"><div style="display:inline-flex;"><button href="#" class="counter-left">-</button><input class="' + e[i].id + '" type="number" value="0" style="width:30px;text-align:center;margin-top:-6px;"><button href="#" class="counter-right">+</button></div></div></div></p>' + '</li>' + '</li>');

                $(".promo-add-new-promotion3").append('<li value="' + e[i].id + '" label="' + e[i].id + '" data-icon="' + e[i].imagePath + '" class="circle" selected>' + '<p><div class="row col s12" style="padding:0px;"> <div class="col s6"> <input name="promoItems" type="checkbox" id="prod' + e[i].id + '"/><label for="prod' + e[i].id + '">' + e[i].name + '</label></div> <div class="col s4" style="float: right;    float: right;width: auto;height: 30px;padding:0px;"><div style="display:inline-flex;"><button href="#" class="counter-left">-</button><input class="' + e[i].id + '" type="number" value="0" style="width:30px;text-align:center;margin-top:-6px;"><button href="#" class="counter-right">+</button></div></div></div></p>' + '</li>' + '</li>');
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
    var boxes = $('#newPromoModal input[name=promoItems]:checked');

    for (i = 0; i < boxes.length; i++) {
        //console.log('ID is: ' + boxes[i].id);
        var productID = boxes[i].id;
        // console.log('The item is added ' + $('li.circle input.' + productID).val() + ' times');
        var times = $('li.circle input.' + productID).val();
        for (j = 0; j < times; j++) {
            //   console.log('Product is: ' + productID);
            selcIds.push(parseInt(productID));
        }
    }

    //$('.promo-add-new-promotion2')
    doFetch({
        action: 'doNewPromo',
        ownerid: JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).id,
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
            $('#newPromoModal').modal('close');
        } else {
            console.log(e);
        }
    });
}

//Remove Promotion
$(document).on('touchstart click', '.removePromo', function (event) {
    parent_div = $(this).parent().parent().parent().parent().parent().parent().parent().remove();
    id = $(this).parent().parent().attr("fid");
    doFetch({
        action: 'removePromotion',
        id: id
    }).then(function (e) {
        if (e.status == 'ok') {
            Materialize.toast('Promotion Removed Successfully', 3000);
            parent_div
        } else {
            console.log(e);
        }
    });
});

//Promotion Form Validation
$('.doAddNewPromo').click(function (e) {
    promo_name = $('#newPromo-name').val();
    promo_description = $('#newPromo-desc').val();
    promo_image = $('#newPromo-image').val();
    promo_discount = $('#newPromo-discount').val();
    promo_minBuyer = $('#newPromo-offers').val();
    isValid = true;
    if (promo_name == '' || promo_name == null) {
        Materialize.toast('Ooops! Please enter promotion name', 3000);
    } else if (promo_description == '' || promo_description == null) {
        Materialize.toast('Ooops! Please enter promotion description', 3000);
    } else if (promo_image == '' || promo_image == null) {
        Materialize.toast('Ooops! Please select an image', 3000);
    } else if (promo_discount == '' || promo_discount == null) {
        Materialize.toast('Ooops! Please enter discount', 3000);
    } else if (promo_minBuyer == '' || promo_minBuyer == null) {
        Materialize.toast('Ooops! Please enter minimum buyers', 3000);
    } else {
        doNewPromo();
    }
});


//Hide Card Reveal on Promotion Page
//$(document).on('touchstart click', '.backBtnPromo', function (event) {
//    $(this).parent().parent().hide();
//});

//Prevent dropdown content on Promotion page closing on touchstart
$(document).on('touchstart click', '.multiple-select-dropdown', function (event) {
    event.stopPropagation();
});

//var shroot = document.querySelectorAll(".doAddNewPromo");
//for (var i = 0; i < shroot.length; ++i) {
//    shroot[i].addEventListener("touchstart", doNewPromo, false);
//};
