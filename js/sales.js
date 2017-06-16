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

var adress = "";
//Recieve data from server
get_orderItems = []

function addOrderItems(orderid, orderItems, orderLoc) {
    console.log('[+]order items unique id: ', orderItems.from);
    get_orderItems.push(orderItems);
    var orderLocation = orderItems.location;
    var orderCrdName = orderItems.name;

    date_info = getDateHours(orderItems.date)
    tag = '#elapsed_time_' + orderItems.id
    console.log('[++]tag id: ', tag)
    $(tag).text(date_info)

    for (var i in deliveryGuys) {
        var name = deliveryGuys[i].name;
        var id = deliveryGuys[i].id;
        if (orderItems.from == id) {
            console.log("-------------------->>");
            console.log(name);
        }
    }

    var latlng = orderLocation;
    var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + latlng + "&sensor=false";
    $.getJSON(url, function (data) {
        formatted = []
        var address = data.results[0].formatted_address.split(",")
        bolden = '<span style="">' + address[0] + '</span>'
        formatted.push(bolden)
        $.each(address, function (index, value) {
            if (index !== 0) {
                formatted.push(value)
            }
        })
        formatted_html = formatted[0]
        location_tag = '#orderLocation_' + orderItems.id
        name_tag = '#orderCardName_' + orderItems.id
        $(name_tag).text(orderCrdName);
        $(location_tag).html(formatted_html);
    });
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

                    var html = '<div class="chip"><img src="' + p[i].imagePath + '" alt="">' + orderItems[ii].count + ' ' + p[i].name.split(" ")[0] + '' + sss + '</div>';
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
            orderCollapsible();
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
                deliveredHTML = '<div style="padding:10px;border-radius:7px;" id="order-card-' + i + '" class="card"><div class="col s3" style="padding:0px;"><div class="card-image"><img style="border-radius:5px;height:12vh;" src="' + reqs[i].icon + '">' + ' <div class="card-action" style="padding:16px 0px 16px 0px !important;"></div>' + '</div></div><div class="col s9 ordItm" style="padding:0px;"> <div class="card-stacked">' + '<div class="card-content" style="padding-top:0px;"><div>order items</div><div class="orders-' + reqs[i].id + '-items"></div> </div>' + '</div></div><div style="text-align:center;padding-right:15%;">Total:<span class="orders-' + reqs[i].id + '-cost"></span>/= </div></div>';
            } else {
                console.log("Not delvered");
                html = '<ul class="collapsible" data-collapsible="accordion" style="width:100%;"> <li><div class="row" style="margin-bottom:0px;line-height:2rem;padding:5px 10px;background:white;"> <div class="col s7" style="color:#8f8f8f; font-size:0.7em;">ORDER SUMMARY</div><div class="col s5"> <div style="float:right;"> <a class="pdfHide" href="tel:' + reqs[i].phone + '" style="border:solid #ffab40 1px; padding: 5px 10px 5px 10px;border-radius:5px;color:#6a6969;margin-right:10px;font-size:0.7em;">CALL</a><a id="do-bill-' + reqs[i].id + '" href="#" class="pdfHide" style="border:solid #ffab40 1px; padding: 5px 10px 5px 10px;border-radius:5px;color:#6a6969;font-size:0.7em;">BILL</a> </div></div></div> <div class="collapsible-header" style="padding:5px 10px;"><div class="row"> <div class="col s3" style="height:70px;"> <img style="background:#26A69A; height:70px; width:70px; border-radius:100%;" src="' + reqs[i].icon + '"/></div><div class="col s9" style="line-height:1.4rem;padding:5px; color:#8f8f8f;"><span id="orderCardName_' + reqs[i].id + '" style="color:black;font-weight:600;"></span> <br><span id="orderLocation_' + reqs[i].id + '"></span><br>Ksh. <span class="orders-' + reqs[i].id + '-cost"></span></div></div> <div class="row" style="color:#8f8f8f;font-size:0.7em;"><div class="col s6" style="font-size:1.2em;">Show more</div><div class="col s6"><p style="margin:0px;float:right;"><span id="elapsed_time_' + reqs[i].id + '"></span>/=</p></div></div></div><div class="collapsible-body" style="padding:0px;"> <span> <div class="orderLst" style="padding:10px 24px;background:white;"> <ul><li><div class="row"><div class="col s6"><div class="orders-' + reqs[i].id + '-items"></div></div><div class="col s6"></div></div></li><div class="row" style="font-size:0.9em;padding-top:10px;"><li><div class="col s6">Total</div><div class="col s6"><p style="float:right;margin:0px;"><span class="orders-' + reqs[i].id + '-cost"></span>/=</p></div></div></li></ul> </div><div class="orderStatus" style="background:#F5F5F5; text-align:center; padding:10px;"><div class="radio-group" gid="' + reqs[i].id + '"><input type="radio" id="cancel' + reqs[i].id + '" name="selector"><label id="cancelLable_' + reqs[i].id + '" class="radioPad radioCancel" for="cancel' + reqs[i].id + '">Cancel</label><input type="radio" id="pending' + reqs[i].id + '" name="selector" checked><label class="radioPad" for="pending' + reqs[i].id + '">Pending</label><input type="radio" id="deliver' + reqs[i].id + '" name="selector"><label id="deliveredLable_' + reqs[i].id + '" class="radioPad radioDelivered delivMbr" for="deliver' + reqs[i].id + '"  onclick="orderCrdId()" >Delivered</label></div> </div><div class="orderTime" style="background:white;padding:0px 15px;"> <div class="row" style="margin-bottom:0px;font-size:0.8em;"> <div class="col s6"><p>Show less</p></div><div class="col s6"><p style="float:right;" id="elapsed_time_' + reqs[i].id + '"></p></div></div></div></span> </div></li></ul>'

            }
            $(".orders-holda").prepend($.parseHTML(html));
            setTimeout(function () {
                $('.collapsible').collapsible();
            }, 100);
            $(".sales-holda").prepend($.parseHTML(deliveredHTML));
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
                        $(complete_id).parent().parent().parent().parent().parent().parent().remove();
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
            $('#deliverOrderModal').modal({
                ready: function (modal, trigger) {
                    deliveryListener();
                    setTimeout(deliveryMbr, 1000);
                }
            }).modal('open');
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

function orderCrdId() {
    $(".radioDelivered").click(function () {
        var orderCrdId = $(this).attr("id").replace(/^\D+/g, '');
        $("#deliverOrderModal").attr('gid', orderCrdId);
    });
}

function getDateHours(date_from_server) {
    date_now = new Date()
    date_from_server = new Date(date_from_server)
    var hours = Math.abs(date_now - date_from_server) / 36e5;

    if (hours >= 24) {
        days = parseInt(hours / 24)
        hours = parseInt(hours % 24)
        return days + ' days, ' + hours + ' hours ago'
    } else if (hours < 24 && hours > 1) {
        total_minutes = hours * 60
        hours_string = '' + hours
        if (hours_string.search('.') !== -1) {
            complete_hours = parseFloat(hours_string.split('.')[0])
            complete_minutes = complete_hours * 60
            remainder = total_minutes - complete_minutes
            remainder = parseInt(remainder)
            return complete_hours + ' hours, ' + remainder + ' minutes ago'
        } else {
            return hours + ' hours ago'
        }
    } else if (hours < 1) {
        minutes = hours * 60
        if (minutes < 1) {
            seconds = minutes * 60
            seconds = parseInt(seconds)
            return seconds + ' seconds ago'
        } else {
            minutes = parseInt(minutes)
            return minutes + ' minutes ago'
        }
    }
}
