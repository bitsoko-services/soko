function refreshSalesOrders() {
    doFetch({
        action: 'getOrders',
        id: localStorage.getItem('soko-active-store')
    }).then(function (e) {
        console.log(e);
         if (e.status == 'ok') {   
        getObjectStore('data', 'readwrite').put(JSON.stringify(e.orders), 'soko-store-' + id + '-orders');
        }else{
        
        getObjectStore('data', 'readwrite').put('[]', 'soko-store-' + id + '-orders');
        }
        orderUpdater();
    }).catch(function (err) {
        orderUpdater();
    });
    /*
    doFetch({
        action: 'getSales',
        id: id
    }).then(function (e) {
        console.log(e);
        getObjectStore('data', 'readwrite').put(JSON.stringify(e.promotions), 'soko-store-' + id + '-sales');
        salesUpdater();
        salesCreator();
    }).catch(function (err) {
        salesUpdater();
        salesCreator();
    });
    */
}

function getActvStoreProds(orderid, orderItems, orderLoc) {

    return new Promise(function (resolve, reject) {

        getObjectStore('data', 'readwrite').get("soko-store-" + localStorage.getItem('soko-active-store') + "-products").onsuccess = function (event) {

            var p = {};
            p.orderid = orderid;
            p.orderItems = orderItems;
            p.orderLoc = orderLoc;
            p.allProds = $.parseJSON(event.target.result);
            resolve(p);
        }
    });
}

function addOrderItems(orderid, orderItems, orderLoc) {
    console.log(orderid, orderItems, orderLoc);
    getActvStoreProds(orderid, orderItems, orderLoc).then(function (p) {

        var orderItems = $.parseJSON(p.orderItems.items);

        //name: p.orderItems.name,

        //number: p.orderItems.phone
        var orderUser = {
            name: 'a name',
            icon: p.orderItems.icon,
            number: '0707'
        };
        var orderid = p.orderid;
        var orderLoc = p.orderLoc;
        var p = p.allProds;
        tCost = 0;
        invoiceDat = [];
        $(".orders-" + orderid + "-items").html('');

        for (var i = 0, orderItems = orderItems, invoiceDat = invoiceDat, tCost = tCost, orderid = orderid; i < p.length; ++i) {
            for (var ii = 0, p = p, orderid = orderid, invoiceDat = invoiceDat, tCost = tCost; ii < orderItems.length; ++ii) {
                var test = new RegExp(orderItems[ii].pid).test(p[i].id);
                if (test) {
                    invoiceDat.push({
                        name: orderUser,
                        prod: p[i],
                        count: orderItems[ii].count
                    });
                    //console.log('Matched!! ' + p[i]);
                    if (parseInt(orderItems[ii].count) > 1) {
                        var sss = 's';
                    } else {
                        var sss = '';
                    }

                    var html = '<div class="chip" style="margin:5px;"><img src="' + p[i].imagePath + '" alt="">' + orderItems[ii].count + ' ' + p[i].name.split(" ")[0] + '' + sss + '</div>';
                    $(".orders-" + orderid + "-items").append($.parseHTML(html));
                    tCost = tCost + (p[i].price * parseInt(orderItems[ii].count));
                    break;
                } else {
                    continue;
                }
            };
        };
        $(".orders-" + orderid + "-cost").text(tCost);

        createInvoiceListener(orderid, invoiceDat, orderLoc);

    });
}

function salesUpdater() {
    var gsl = getObjectStore('data', 'readwrite').get('soko-store-' + localStorage.getItem('soko-active-store') + '-transactions');
    gsl.onsuccess = function (event) {
        localConverter().then(function (loCon) {
            var reqs = event.target.result;
            try {
                reqs = JSON.parse(reqs);
            } catch (err) {
                noSalesUpdater();
                return;
            }
            var nC = 0;
            $(".noteC-holda").html('');
            for (var i = 0; i < reqs.length; ++i) {
                if (reqs[i].status == 'pending') {
                    nC++;
                    var saleAmount = Math.ceil(parseFloat(reqs[i].amount) / 100000000 * loCon.xrate * loCon.rate) + '/= ' + loCon.symbol;
                    var saleTime = moment(reqs[i].posted).fromNow();
                    //f = ''+saleAmount+'</h5><small class="noteC-time text-muted">'+saleTime+'</small></div></div></a>';
                    var html = ' <li class="collection-item avatar"><i class="mdi-action-receipt green circle"></i><div class="row"><div class="col s5">' + '<p class="collections-title"><strong>#3</strong> Tomatoes, sold</p><p class="collections-content">.......</p></div>' + '<div class="col s2"><span class="task-cat green accent-2">P1</span></div><div class="col s5"><div class="progress"><div class="determinate green" style="width: 70%"></div>' + '</div><div class="select-wrapper initialized"><span class="caret">▼</span><select class="initialized"><option value="" disabled="" selected="">pending</option>' + '<option value="1">complete</option></select></div></div></div></li>' + $(".soko-sales-list").append($.parseHTML(html));
                };
            }
            if (parseInt(nC) > 0) {
                navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
                if (navigator.vibrate) {
                    // vibration API supported
                    navigator.vibrate(1000);
                }
                $('ul.tabs').tabs();
            } else {
                noSalesUpdater();
            }
            $(".noteC-count").css('display', 'block').html(nC);
        });
    }
    gsl.onerror = function (event) {
        noSalesUpdater();
    }
}

function noSalesUpdater() {
    $(".soko-sales-list").html('');
    var html = ' <li class="collection-item avatar" style="opacity: 0.6;"><i class="mdi-action-receipt grey circle"></i><div class="row">' + '<p class="collections-title"><strong>No Transactions found</strong></p><p class="collections-content">you can start making sales using promotions </p></div>' + '</li>';
    $(".soko-sales-list").append(html);
    $('ul.tabs').tabs();
}

function orderUpdater() {
    getObjectStore('data', 'readwrite').get('soko-store-' + localStorage.getItem('soko-active-store') + '-orders').onsuccess = function (event) {
        var reqs = event.target.result;
        try {
            reqs = JSON.parse(reqs);
        } catch (err) {
            console.log('unable to access orders list. ' + err);
            refreshSalesOrders();
return;
        }

        $(".allOrdersCount").html(reqs.length);
        $(".orders-holda").html('');
        //TO_DO MAKE SURE THERE EXISTS orders!!
        if (reqs.length == 0) {
            var html = '<li class="collection-item avatar" style="opacity: 0.6;"><i class="mdi-action-redeem cyan circle"></i>' + '<span class="collection-header">No Orders Found</span></li>';
            $(".orders-holda").append($.parseHTML(html));
        } else {
            $(".orders-holda").html('');
            //  var html = ' <li class="collection-item avatar" style="opacity: 0.6;"><i class="mdi-action-redeem grey circle"></i><div class="row">' + '<p class="collections-title"><strong>Add Promotion</strong></p><p class="collections-content">you can add ' + (3 - reqs.length) + ' more promotions</p></div>' + '</li>';
            //  $(".orders-holda").append(html);
        }
        for (var i = 0; i < reqs.length; ++i) {
            //  var saleAmount=Math.ceil(parseFloat(reqs[i].amount)/100000000 *loCon.xrate*loCon.rate)+'/= '+loCon.symbol;
            // var saleTime=moment(reqs[i].posted).fromNow();
            var id = 'order-card-' + i;
            var html = '<div style="padding:10px;border-radius:7px;" id="order-card-' + i + '" class="card"><div class="col s7" style="padding:0px;"><div class="card-image"><img style="border-radius:5px;" src="' + reqs[i].icon + '">' +
                '<div style="text-align:center;padding-right:15%;" class="pdfHide">New Order</div>' +
                '<div style="text-align:center;padding-right:15%;">Total:<span class="orders-' + reqs[i].id + '-cost"></span>/= </div>' +
                ' <div class="card-action" style="padding-left:0px;"><a class="pdfHide" href="tel:' + reqs[i].phone + '" style="margin-right:5px;"><i style="border:solid #ffab40 1px; padding: 5px 10px 5px 10px;border-radius:5px;">call</i></a><a id="do-bill-' + reqs[i].id + '" href="#" class="pdfHide"><i style="border:solid #ffab40 1px; padding: 5px 10px 5px 10px;border-radius:5px;">bill</i></a></div>' +
                ' <div class="card-action" style="padding:16px 0px 16px 0px !important;"></div>' +
                '</div></div><div class="col s5 ordItm" style="padding:0px;"> <div class="card-stacked">' +
                '<div class="card-content"><div>order items</div><div class="orders-' + reqs[i].id + '-items"></div> </div>' +
                '</div></div><div class="col s12 style="width:100%;text-align:center !important;"><div class="radio-group" gid="' + reqs[i].id + '"><input type="radio" id="cancel' + reqs[i].id + '" name="selector"><label class="radioPad" for="cancel' + reqs[i].id + '">Cancel</label><input type="radio" id="pending' + reqs[i].id + '" name="selector" checked><label class="radioPad" for="pending' + reqs[i].id + '">Pending</label><input type="radio" id="deliver' + reqs[i].id + '" name="selector"><label class="radioPad" for="deliver' + reqs[i].id + '">Delivered</label><input type="radio" id="complete' + reqs[i].id + '" name="selector"><label class="radioPad" for="complete' + reqs[i].id + '">Complete</label> </div></div></div>';
            // var html = '<div class="card"><div class="card-image waves-effect waves-block waves-light">' + '<img class="activator" src="' + reqs[i].promoBanner + '" alt="user bg"></div><div class="card-content" style="padding: 0px 20px;">' + '<img src="' + reqs[i].promoLogo + '" alt="" class="circle responsive-img activator card-profile-image">' + '<a class="btn-floating activator btn-move-up waves-effect waves-light darken-2 right">' + '<svg class="activator" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 490.3 490.3" style="enable-background:new 0 0 490.3 490.3;width: 26px;margin-left: 8px;margin-top: 7px;" xml:space="preserve"><g xmlns="http://www.w3.org/2000/svg"><path d="M438.931,30.403c-40.4-40.5-106.1-40.5-146.5,0l-268.6,268.5c-2.1,2.1-3.4,4.8-3.8,7.7l-19.9,147.4 c-0.6,4.2,0.9,8.4,3.8,11.3c2.5,2.5,6,4,9.5,4c0.6,0,1.2,0,1.8-0.1l88.8-12c7.4-1,12.6-7.8,11.6-15.2c-1-7.4-7.8-12.6-15.2-11.6 l-71.2,9.6l13.9-102.8l108.2,108.2c2.5,2.5,6,4,9.5,4s7-1.4,9.5-4l268.6-268.5c19.6-19.6,30.4-45.6,30.4-73.3 S458.531,49.903,438.931,30.403z M297.631,63.403l45.1,45.1l-245.1,245.1l-45.1-45.1L297.631,63.403z M160.931,416.803l-44.1-44.1 l245.1-245.1l44.1,44.1L160.931,416.803z M424.831,152.403l-107.9-107.9c13.7-11.3,30.8-17.5,48.8-17.5c20.5,0,39.7,8,54.2,22.4 s22.4,33.7,22.4,54.2C442.331,121.703,436.131,138.703,424.831,152.403z" fill="#FFFFFF"></path></g></svg></a><p>' + reqs[i].promoName + '</p><p>' + reqs[i].promoDesc + '</p>' + '<p style="text-align: center;padding: 15px 20px;"><i style="float: left;" class="promo-state-icon mdi-notification-sync"> 0 shares</i>' + '<i class="promo-state-icon mdi-action-favorite"> 0 likes </i>' + '<i style="float: right;" class="promo-state-icon mdi-action-receipt"> 0 sales </i></p>' + '<label>offer subscribers</label><div class="divider" style="margin: 10px;"></div><div class="promo-' + reqs[i].id + '-subscribers"></div>' + '</div><div class="card-reveal">' + '<form class="col s12"> <div class="row"> <div class="input-field col s12"> <input id="newPromo-name" type="text" class="validate js-loc-button-notification-input" value="" value="" stitm="name" required> <label for="newPromo-name" class="">Name</label> </div></div><div class="row"> <div class="input-field col s12"> <input id="newPromo-desc" type="text" class="validate js-loc-button-notification-input" value="" stitm="msg" required> <label for="newPromo-desc" class="">Desc</label> </div></div><div class="row"> <div class="file-field input-field"> <div class="btn"><span>image</span> <input id="newPromo-image" type="file" stitm="customImage" required> </div></div></div><div class="row"> <div class="input-field col s6"> <input placeholder="" id="newPromo-discount" type="number" class="validate" min="0" max="90"> <label for="newPromo-discount" class="">% discount</label> </div><div class="input-field col s6"> <input placeholder="" id="newPromo-offers" type="number" class="validate" min="0"> <label for="newPromo-offers" class="">minimum buyers</label> </div></div><div class="row" style="height:200px;overflow:auto;"> <h6 style="text-align:center;">Add an item to this promotion</h6> <ul class="promo-add-new-promotion2"></ul> </div></form>' + '<div class="row" style="text-align: center;margin: 20px 0px;"> <a class="removePromo waves-effect waves-light btn" style="margin-bottom:10px;">remove promotion</a><br><a class="backBtnPromo waves-effect waves-light btn">back</a> </div>' + '</div></div>';

            $(".orders-holda").prepend($.parseHTML(html));
            console.log(reqs[i]);
            addOrderItems(reqs[i].id, reqs[i], reqs[i].location);

            var orderStatus = reqs[i].id;

            $(document).on('touchstart click', '#cancel' + orderStatus, function () {
                var cancelBtn = $(this).parent();
                id = $(cancelBtn).attr('gid').replace(/\D/g, '');
                doFetch({
                    action: 'orderStatus',
                    id: id,
                    state: 'Cancelled'
                }).then(function (e) {
                    if (e.status == 'ok') {
                        $('#cancelOrderModal').modal('open');
                        $(document).on('touchstart click', '#yesBtn', function () {
                            $(cancelBtn).parent().parent().remove();
                            $('#cancelOrderModal').modal('close');
                            doFetch({
                                action: 'orderStatus',
                                id: id,
                                state: 'orderCancelled'
                            }).then(function (e) {
                                if (e.status == 'ok') {} else {}
                            });
                        });
                        $(document).on('touchstart click', '#noBtn', function () {
                            $('#cancelOrderModal').modal('close');
                        });
                    } else {}
                    refreshSalesOrders();
                });
            });
            $(document).on('touchstart click', '#deliver' + orderStatus, function () {
                var deliveredBtn = $(this).parent();
                id = $(deliveredBtn).attr('gid').replace(/\D/g, '');
                doFetch({
                    action: 'orderStatus',
                    id: id,
                    state: 'Delivered'
                }).then(function (e) {
                    if (e.status == 'ok') {} else {
                        console.log(e);
                    }
                    refreshSalesOrders();
                });
            });
            $(document).on('touchstart click', '#complete' + orderStatus, function () {
                var completeBtn = $(this).parent();
                id = $(completeBtn).attr('gid').replace(/\D/g, '');
                doFetch({
                    action: 'orderStatus',
                    id: id,
                    state: 'Complete'
                }).then(function (e) {
                    if (e.status == 'ok') {} else {
                        console.log(e);
                    }
                    refreshSalesOrders();
                });
            });
        }

        //$('.products-collapsible').collapsible();
        // $('select').material_select();
        //Materialize.updateTextFields();
        //initProdCallback();

    }
}
