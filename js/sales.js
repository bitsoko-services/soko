function refreshSalesOrders() {
    doFetch({
        action: 'getOrders',
        id: localStorage.getItem('soko-active-store')
    }).then(function (e) {
        console.log(e);
        if (e.status == 'ok') {
            getObjectStore('data', 'readwrite').put(JSON.stringify(e.orders), 'soko-store-' + id + '-orders');
        } else {

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


//Recieve data from server
get_orderItems = []

function addOrderItems(orderid, orderItems, orderLoc) {
    get_orderItems.push(orderItems);
    //    console.log(orderid, orderItems, orderLoc);
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
            var html = "";
            var deliveredHTML = "";
            if (reqs[i].state == "Complete") {
                console.log("Delivered");
                deliveredHTML = '<div style="padding:10px;border-radius:7px;" id="order-card-' + i + '" class="card"><div class="col s3" style="padding:0px;"><div class="card-image"><img style="border-radius:5px;height:12vh;" src="' + reqs[i].icon + '">' +
                    ' <div class="card-action" style="padding:16px 0px 16px 0px !important;"></div>' +
                    '</div></div><div class="col s9 ordItm" style="padding:0px;"> <div class="card-stacked">' +
                    '<div class="card-content" style="padding-top:0px;"><div>order items</div><div class="orders-' + reqs[i].id + '-items"></div> </div>' +
                    '</div></div><div style="text-align:center;padding-right:15%;">Total:<span class="orders-' + reqs[i].id + '-cost"></span>/= </div></div>';
            } else {
                console.log("Not delvered")
                html = '<div style="padding:10px;border-radius:7px;" id="order-card-' + i + '" class="card"><div class="col s7" style="padding:0px;"><div class="card-image"><img style="border-radius:5px;" src="' + reqs[i].icon + '">' +
                    '<div style="text-align:center;padding-right:15%;" class="pdfHide">New Order</div>' +
                    '<div style="text-align:center;padding-right:15%;">Total:<span class="orders-' + reqs[i].id + '-cost"></span>/= </div>' +
                    ' <div class="card-action" style="padding-left:0px;"><a class="pdfHide" href="tel:' + reqs[i].phone + '" style="margin-right:5px;"><i style="border:solid #ffab40 1px; padding: 5px 10px 5px 10px;border-radius:5px;">call</i></a><a id="do-bill-' + reqs[i].id + '" href="#" class="pdfHide"><i style="border:solid #ffab40 1px; padding: 5px 10px 5px 10px;border-radius:5px;">bill</i></a></div>' +
                    ' <div class="card-action" style="padding:16px 0px 16px 0px !important;"></div>' +
                    '</div></div><div class="col s5 ordItm" style="padding:0px;"> <div class="card-stacked">' +
                    '<div class="card-content"><div>order items</div><div class="orders-' + reqs[i].id + '-items"></div> </div>' +
                    '</div></div><div class="col s12 style="width:100%;text-align:center !important;"><div class="radio-group" gid="' + reqs[i].id + '"><input type="radio" id="cancel' + reqs[i].id + '" name="selector"><label id="cancelLable_' + reqs[i].id + '" class="radioPad radioCancel" for="cancel' + reqs[i].id + '">Cancel</label><input type="radio" id="pending' + reqs[i].id + '" name="selector" checked><label class="radioPad" for="pending' + reqs[i].id + '">Pending</label><input type="radio" id="deliver' + reqs[i].id + '" name="selector"><label id="deliveredLable_' + reqs[i].id + '" class="radioPad radioDelivered delivMbr" for="deliver' + reqs[i].id + '">Delivered</label></div></div></div>';
            }

            $(".orders-holda").prepend($.parseHTML(html));
            $(".sales-holda").prepend($.parseHTML(deliveredHTML));
            //            console.log(reqs[i]);
            addOrderItems(reqs[i].id, reqs[i], reqs[i].location);

            //            var orderStatus = reqs[i].id;

        }


        $('.radioCancel').on('click', function () {
            var id = $(this).attr('id');
            var split = id.split('_');
            var complete_id = split[1];
            $('#cancelOrderModal').modal('open');

            $('#yesBtn').on('click', function () {
                $('#cancelOrderModal').modal('close');
                doFetch({
                    action: 'orderStatus',
                    id: complete_id,
                    state: 'Cancelled'
                }).then(function (e) {
                    if (e.status == 'ok') {
                        $(complete_id).parent().parent().parent().parent().remove();
                        Materialize.toast('Order Cancelled Successfully', 3000);
                    } else {
                        Materialize.toast('Error! Please try again later', 3000);
                    }
                    refreshSalesOrders();
                });
            });
            $('#noBtn').on('click', function () {
                $('#cancelOrderModal').modal('close');
            });
        });
        $('.radioDelivered').on('click', function () {
            $('#deliverOrderModal').modal('open');
        })
        //        $('.radioDelivered').on('click', function () {
        //            var id = $(this).attr('id');
        //            var split = id.split('_');
        //            var complete_id = split[1]
        //
        //            doFetch({
        //                action: 'orderStatus',
        //                id: complete_id,
        //                state: 'Delivered'
        //            }).then(function (e) {
        //                if (e.status == 'ok') {} else {}
        //                refreshSalesOrders();
        //            });
        //
        //        });
        $('.radioComplete').on('click', function () {
            var id = $(this).attr('id');
            var split = id.split('_');
            var complete_id = split[1]

            doFetch({
                action: 'orderStatus',
                id: complete_id,
                state: 'Complete'
            }).then(function (e) {
                if (e.status == 'ok') {} else {}
                refreshSalesOrders();
            });

        });


        //$('.products-collapsible').collapsible();
        // $('select').material_select();
        //Materialize.updateTextFields();
        //initProdCallback();

    }
}


//Delivery Operators
$('document').ready(function () {
    $('body').unbind('click', $('#deliverOrderModal ul.autocomplete-content li'), function () {
        var value = $('#delivery-members').val();
        if (value != '') {
            var deliveryMembers = $('#delivery-members').val();
            for (var i in deliveryGuys) {
                var name = deliveryGuys[i].name;
                var id = deliveryGuys[i].id;
                if (deliveryMembers == name) {
                    console.log("-------------click events")
                    //                    doFetch({
                    //                        action: 'deliveryMembers',
                    //                        store: localStorage.getItem('soko-active-store'),
                    //                        do: 'add',
                    //                        data: id
                    //                    }).then(function (e) {
                    //                        if (e.status == 'ok') {} else {}
                    //                    });
                }
            }
        }
    });
});
