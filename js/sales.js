function refreshSalesOrders() {
    doFetch({
        action: 'getOrders',
        id: localStorage.getItem('soko-active-store')
    }).then(function (e) {
        console.log(e);
        if (e.status == 'ok') {
            getObjectStore('data', 'readwrite').put(JSON.stringify(e.orders), 'soko-store-' + localStorage.getItem('soko-active-store') + '-orders');
        } else {

            getObjectStore('data', 'readwrite').put('[]', 'soko-store-' + localStorage.getItem('soko-active-store') + '-orders');
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
    //    console.log('[+]order items unique id: ', orderItems.from);
    get_orderItems.push(orderItems);
    var orderLocation = orderItems.location;
    var orderCrdName = orderItems.name;

    date_info = getDateHours(orderItems.date)
    tag = '#elapsed_time_' + orderItems.id
    //    console.log('[++]tag id: ', tag)
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
            name: orderCrdName,
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
            // orderCollapsible();
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
        $(".sales-holda").html("");
        for (var i = 0; i < reqs.length; ++i) {
            //  var saleAmount=Math.ceil(parseFloat(reqs[i].amount)/100000000 *loCon.xrate*loCon.rate)+'/= '+loCon.symbol;
            // var saleTime=moment(reqs[i].posted).fromNow();
            var id = 'order-card-' + i;
            var html = "";
            var deliveredHTML = "";
            var orderCrdState = reqs[i].state;

            var orderCrdLocation = reqs[i].location;
            var orderCrdLocationX = orderCrdLocation.split(",")[0]
            var orderCrdLocationY = orderCrdLocation.split(",")[1]

            var orderCrdRate = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).deliveryRate

            var shopLocation = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).lonlat
            var shopLocationX = shopLocation.split(",")[0]
            var shopLocationY = shopLocation.split(",")[1]



            var deliveredBy = reqs[i].deliveredBy;

            if (reqs[i].state == "complete") {
                deliveredHTML = '<div style="padding:10px;border-radius:4px;" id="order-card-' + i + '" class="card completeCard" cId="' + reqs[i].id + '"><div class="row" style="margin-bottom:0px;line-height:2rem;margin:5px 10px;background:transparent; padding-bottom:0px;"> <div class="col s7" style="color:#8f8f8f; font-size:0.7em;line-height:2;"></div><div class="col s5"> <div style="float:right;"><a id="do-bill-' + reqs[i].id + '" href="#" class="pdfHide"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 491.695 491.695" style="enable-background:new 0 0 491.695 491.695;width: 20; position: absolute; right: 20px;" xml:space="preserve"><g><path style="fill:#ffab40;" d="M436.714,0H149.471c-16.438,0-29.812,13.374-29.812,29.812v66.714c-54.49,15.594-94.489,65.857-94.489,125.288 c0,59.431,39.998,109.694,94.489,125.288v114.783c0,16.438,13.374,29.812,29.812,29.812h234.733c2.785,0,5.455-1.106,7.425-3.075 l71.821-71.822c1.969-1.969,3.075-4.64,3.075-7.425V29.812C466.525,13.374,453.152,0,436.714,0z M149.471,21h287.243 c4.858,0,8.811,3.953,8.811,8.812v31.689H140.659V29.812C140.659,24.953,144.612,21,149.471,21z M46.17,221.813 c0-60.263,49.027-109.29,109.29-109.29c60.263,0,109.29,49.027,109.29,109.29s-49.027,109.291-109.29,109.291 C95.197,331.104,46.17,282.076,46.17,221.813z M140.659,461.884V351.258c4.86,0.552,9.797,0.846,14.802,0.846 c39.135,0,74.292-17.347,98.195-44.752h64.336c5.799,0,10.5-4.701,10.5-10.5s-4.701-10.5-10.5-10.5h-49.381 c9.133-15.95,14.984-34.005,16.644-53.242h32.736c5.799,0,10.5-4.701,10.5-10.5c0-5.799-4.701-10.5-10.5-10.5h-32.603 c-1.42-19.194-7.02-37.242-15.886-53.241h48.488c5.799,0,10.5-4.701,10.5-10.5c0-5.799-4.701-10.5-10.5-10.5h-62.974 c-23.918-28.323-59.67-46.347-99.558-46.347c-5.005,0-9.942,0.294-14.802,0.846v-9.867h304.866v316.372h-42.009 c-16.439,0-29.811,13.374-29.811,29.811v42.011H149.471C144.612,470.695,140.659,466.743,140.659,461.884z M394.705,455.845v-27.16 c0-4.859,3.953-8.811,8.811-8.811h27.16L394.705,455.845z"></path><path style="fill:#ffab40;" d="M359.246,158.869h34.87c5.799,0,10.5-4.701,10.5-10.5c0-5.799-4.701-10.5-10.5-10.5h-34.87c-5.799,0-10.5,4.701-10.5,10.5 C348.746,154.168,353.447,158.869,359.246,158.869z"></path><path style="fill:#ffab40;" d="M359.246,233.11h34.87c5.799,0,10.5-4.701,10.5-10.5c0-5.799-4.701-10.5-10.5-10.5h-34.87c-5.799,0-10.5,4.701-10.5,10.5 C348.746,228.409,353.447,233.11,359.246,233.11z"></path><path style="fill:#ffab40;" d="M359.246,307.352h34.87c5.799,0,10.5-4.701,10.5-10.5s-4.701-10.5-10.5-10.5h-34.87c-5.799,0-10.5,4.701-10.5,10.5 S353.447,307.352,359.246,307.352z"></path><path style="fill:#ffab40;" d="M394.116,381.593c5.799,0,10.5-4.701,10.5-10.5s-4.701-10.5-10.5-10.5h-98.225c-5.799,0-10.5,4.701-10.5,10.5 s4.701,10.5,10.5,10.5H394.116z"></path><path style="fill:#ffab40;" d="M236.982,168.845l-12.81-12.81c-3.45-3.449-8.036-5.349-12.915-5.349s-9.465,1.9-12.915,5.349l-67.19,67.19l-18.573-18.573 c-3.449-3.448-8.036-5.348-12.914-5.348c-4.878,0-9.465,1.9-12.914,5.349l-12.813,12.812c-7.12,7.121-7.12,18.708,0.001,25.829 l44.297,44.296c3.45,3.451,8.037,5.351,12.916,5.351c0,0,0.001,0,0.001,0c4.878,0,9.465-1.9,12.913-5.349l92.917-92.917 C244.103,187.554,244.103,175.966,236.982,168.845z M131.151,270.807l-40.429-40.428l8.942-8.942l24.062,24.062 c4.101,4.101,10.749,4.101,14.85,0l72.681-72.681l8.942,8.942L131.151,270.807z"></path></g></svg></a> </div></div></div><div class="col s3" style="padding:0px;"><div class="card-image"><img style=" border-radius: 50%; height: 60px; width: 60px; display: block; margin-left: auto; margin-right: auto;" src="' + reqs[i].icon + '">' + '</div></div><div class="col s9" style="line-height:1.4rem;padding:5px; color:#8f8f8f;"><span id="orderCardName_' + reqs[i].id + '" style="color:black;font-weight:600;"></span> <br><span id="orderLocation_' + reqs[i].id + '"></span><br><span id="elapsed_time_' + reqs[i].id + '"></span></div></div>';
            } else {
                // Not Delivered
                html = '<ul class="collapsible" data-collapsible="accordion" style="width:100%;"> <li><div class="row" style="margin-bottom:0px;line-height:2rem;padding:5px 10px;background:white; padding-bottom:0px;"> <div class="col s7" style="color:#8f8f8f; font-size:0.7em;line-height:2;">ORDER SUMMARY</div><div class="col s5"> <div style="float:right;"> <a class="pdfHide" href="tel:' + reqs[i].phone + '" style="padding-right:5px;"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 473.806 473.806" style="enable-background:new 0 0 473.806 473.806;width: 20px;" xml:space="preserve"><g><g><path style="fill:#ffab40;" d="M374.456,293.506c-9.7-10.1-21.4-15.5-33.8-15.5c-12.3,0-24.1,5.3-34.2,15.4l-31.6,31.5c-2.6-1.4-5.2-2.7-7.7-4 c-3.6-1.8-7-3.5-9.9-5.3c-29.6-18.8-56.5-43.3-82.3-75c-12.5-15.8-20.9-29.1-27-42.6c8.2-7.5,15.8-15.3,23.2-22.8 c2.8-2.8,5.6-5.7,8.4-8.5c21-21,21-48.2,0-69.2l-27.3-27.3c-3.1-3.1-6.3-6.3-9.3-9.5c-6-6.2-12.3-12.6-18.8-18.6 c-9.7-9.6-21.3-14.7-33.5-14.7s-24,5.1-34,14.7c-0.1,0.1-0.1,0.1-0.2,0.2l-34,34.3c-12.8,12.8-20.1,28.4-21.7,46.5 c-2.4,29.2,6.2,56.4,12.8,74.2c16.2,43.7,40.4,84.2,76.5,127.6c43.8,52.3,96.5,93.6,156.7,122.7c23,10.9,53.7,23.8,88,26 c2.1,0.1,4.3,0.2,6.3,0.2c23.1,0,42.5-8.3,57.7-24.8c0.1-0.2,0.3-0.3,0.4-0.5c5.2-6.3,11.2-12,17.5-18.1c4.3-4.1,8.7-8.4,13-12.9 c9.9-10.3,15.1-22.3,15.1-34.6c0-12.4-5.3-24.3-15.4-34.3L374.456,293.506z M410.256,398.806 C410.156,398.806,410.156,398.906,410.256,398.806c-3.9,4.2-7.9,8-12.2,12.2c-6.5,6.2-13.1,12.7-19.3,20 c-10.1,10.8-22,15.9-37.6,15.9c-1.5,0-3.1,0-4.6-0.1c-29.7-1.9-57.3-13.5-78-23.4c-56.6-27.4-106.3-66.3-147.6-115.6 c-34.1-41.1-56.9-79.1-72-119.9c-9.3-24.9-12.7-44.3-11.2-62.6c1-11.7,5.5-21.4,13.8-29.7l34.1-34.1c4.9-4.6,10.1-7.1,15.2-7.1 c6.3,0,11.4,3.8,14.6,7c0.1,0.1,0.2,0.2,0.3,0.3c6.1,5.7,11.9,11.6,18,17.9c3.1,3.2,6.3,6.4,9.5,9.7l27.3,27.3 c10.6,10.6,10.6,20.4,0,31c-2.9,2.9-5.7,5.8-8.6,8.6c-8.4,8.6-16.4,16.6-25.1,24.4c-0.2,0.2-0.4,0.3-0.5,0.5 c-8.6,8.6-7,17-5.2,22.7c0.1,0.3,0.2,0.6,0.3,0.9c7.1,17.2,17.1,33.4,32.3,52.7l0.1,0.1c27.6,34,56.7,60.5,88.8,80.8 c4.1,2.6,8.3,4.7,12.3,6.7c3.6,1.8,7,3.5,9.9,5.3c0.4,0.2,0.8,0.5,1.2,0.7c3.4,1.7,6.6,2.5,9.9,2.5c8.3,0,13.5-5.2,15.2-6.9 l34.2-34.2c3.4-3.4,8.8-7.5,15.1-7.5c6.2,0,11.3,3.9,14.4,7.3c0.1,0.1,0.1,0.1,0.2,0.2l55.1,55.1 C420.456,377.706,420.456,388.206,410.256,398.806z"></path><path style="fill:#ffab40;" d="M256.056,112.706c26.2,4.4,50,16.8,69,35.8s31.3,42.8,35.8,69c1.1,6.6,6.8,11.2,13.3,11.2c0.8,0,1.5-0.1,2.3-0.2 c7.4-1.2,12.3-8.2,11.1-15.6c-5.4-31.7-20.4-60.6-43.3-83.5s-51.8-37.9-83.5-43.3c-7.4-1.2-14.3,3.7-15.6,11 S248.656,111.506,256.056,112.706z"></path><path style="fill:#ffab40;" d="M473.256,209.006c-8.9-52.2-33.5-99.7-71.3-137.5s-85.3-62.4-137.5-71.3c-7.3-1.3-14.2,3.7-15.5,11 c-1.2,7.4,3.7,14.3,11.1,15.6c46.6,7.9,89.1,30,122.9,63.7c33.8,33.8,55.8,76.3,63.7,122.9c1.1,6.6,6.8,11.2,13.3,11.2 c0.8,0,1.5-0.1,2.3-0.2C469.556,223.306,474.556,216.306,473.256,209.006z"></path></g></g></svg></a></div></div></div> <div class="collapsible-header" style="padding:5px 10px;"><div class="row"> <div class="col s3" style="height:70px;"> <img style="background:#26A69A; height:70px; width:70px; border-radius:100%;" src="' + reqs[i].icon + '"/></div><div class="col s9" style="line-height:1.4rem;padding:5px; color:#8f8f8f;"><span id="orderCardName_' + reqs[i].id + '" style="color:black;font-weight:600;"></span> <br><span id="orderLocation_' + reqs[i].id + '"></span><br><span id="orderState_' + reqs[i].id + '" style="text-transform:capitalize;"></span></div></div> <div class="row" style="color:#8f8f8f;font-size:0.7em;line-height:3;"><div class="col s4" style="font-size:1.2em;">Show more</div><div class="col s4" style="padding:0px;"></div><div class="col s4"><p style="margin:0px;float:right;"><span id="elapsed_time_' + reqs[i].id + '"></span></p></div></div></div><div class="collapsible-body" style="padding:0px;"> <span> <div class="orderLst" style="padding:10px 24px;background:white;"> <ul><li><div class="row"><div class="col s12"><div class="orders-' + reqs[i].id + '-items"></div></div><div class="col s6"></div></div></li><div class="row" style="font-size:0.9em;padding-top:10px;"><li><div class="row"><div class="col s6">Total</div><div class="col s6"><p style="float:right;margin:0px;"><span class="orders-' + reqs[i].id + '-cost"></span>/=</p></div></div><div class="row"><div class="col s6">Delivery</div><div class="col s6"><p style="float:right;margin:0px;" ><span id="oderDeliveryRate_' + reqs[i].id + '"></span>/=</p></div></div></div></li></ul> </div><div class="orderStatus" style="background:#F5F5F5; text-align:center; height:29px;"><div class="radio-group" gid="' + reqs[i].id + '"><input type="radio" id="cancel' + reqs[i].id + '" name="selector' + reqs[i].id + '"><label id="cancelLable_' + reqs[i].id + '" class="radioPad radioCancel" for="cancel' + reqs[i].id + '">Cancel</label><input type="radio" id="pending' + reqs[i].id + '" name="selector' + reqs[i].id + '" checked><label class="radioPad" for="pending' + reqs[i].id + '">Pending</label><input type="radio" id="deliver' + reqs[i].id + '" name="selector' + reqs[i].id + '"><label id="deliveredLable_' + reqs[i].id + '" class="radioPad radioDelivered delivMbr" for="deliver' + reqs[i].id + '"  onclick="orderCrdId()" >Deliver</label><input type="radio" id="complete_' + reqs[i].id + '" name="selector' + reqs[i].id + '"><label class="radioPad radioComplete" for="complete_' + reqs[i].id + '">Complete</label></div> </div><div class="orderTime" style="background:white;padding:0px 15px;"> <div class="row" style="margin-bottom:0px;font-size:0.8em;"> <div class="col s5"><p>Show less</p></div><div class="col s7"><p style="text-align:right;"><span id="deliveredBy_' + reqs[i].id + '"></span></p></div></div></div></span> </div></li></ul>'

            }
            $(".orders-holda").prepend($.parseHTML(html));

            $(".sales-holda").prepend($.parseHTML(deliveredHTML));
            addOrderItems(reqs[i].id, reqs[i], reqs[i].location);
            $("#orderState_" + reqs[i].id).text(orderCrdState);

            if (reqs[i].state == "delivering") {
                $("#deliveredBy_" + reqs[i].id).text(deliveredBy);
                $("#deliver" + reqs[i].id).attr('checked', true);
                for (var ii in deliveryGuys) {
                    var name = deliveryGuys[ii].name;
                    var id = deliveryGuys[ii].id;
                    if (deliveredBy == id) {
                        $("#deliveredBy_" + reqs[i].id).text("Delivered By: " + name);
                    }
                }
            }
            if (orderCrdRate == 0) {
                $("#oderDeliveryRate_" + reqs[i].id).text(Math.ceil(getDistance(orderCrdLocationX, orderCrdLocationY, shopLocationX, shopLocationY)))
            } else {
                $("#oderDeliveryRate_" + reqs[i].id).text(Math.ceil(getDistance(orderCrdLocationX, orderCrdLocationY, shopLocationX, shopLocationY) * orderCrdRate))
            }
        }

        setTimeout(function () {
            $('.collapsible').collapsible();
            deliveryListener();
            setTimeout(deliveryMbr, 1000);
        }, 100);

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
            var id = $(this).attr('for');
            var split = id.split('_')[1];

            doFetch({
                action: 'orderStatus',
                id: split,
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
    var kenyaGMT = Math.abs(date_now - date_from_server) / 36e5;
    var hours = kenyaGMT - 3;

    if (hours >= 24) {
        days = parseInt(hours / 24)
        hours = parseInt(hours % 24)
        return days + ' days, ' + hours + ' hrs ago'
    } else if (hours < 24 && hours > 1) {
        total_minutes = hours * 60
        hours_string = '' + hours
        if (hours_string.search('.') !== -1) {
            complete_hours = parseFloat(hours_string.split('.')[0])
            complete_minutes = complete_hours * 60
            remainder = total_minutes - complete_minutes
            remainder = parseInt(remainder)
            return complete_hours + ' hrs, ' + remainder + ' min ago'
        } else {
            return hours + ' hrs ago'
        }
    } else if (hours < 1) {
        minutes = hours * 60
        if (minutes < 1) {
            seconds = minutes * 60
            seconds = parseInt(seconds)
            return seconds + ' s ago'
        } else {
            minutes = parseInt(minutes)
            return minutes + ' min ago'
        }
    }
}


//Delete Complete Orders
$(document).on('click', '.completeCard', function (event) {
    var cardId = $(this).attr("cId");
    var thisCard = $(this);
    $("#slctSettings").css("display", "block");
    $(".salePromo").css("display", "none");
    thisCard.toggleClass("slctdCompOrd");
    var noneSlctd = $(".slctdCompOrd").length
    if (noneSlctd == 0) {
        $("#slctSettings").css("display", "none");
        $(".salePromo").css("display", "block");
    }
})

$("#deleteOrder").click(function () {
    $("#completeOrder").modal("open");
    console.log("Clicked");

    var slctArray = $('.slctdCompOrd').map(function () {
        return this.attributes[3].nodeValue;
    }).get();

    $(document).on('click', '#yesComptOrder', function (event) {
        doFetch({
            action: 'deleteOrders',
            store: localStorage.getItem("soko-active-store"),
            order: slctArray
        }).then(function (e) {
            if (e.status == 'ok') {
                thisCard.remove();
                $("#completeOrder").modal("close");
            } else {}
        });

    })
    $(document).on('click', '#noComptOrder', function (event) {
        $("#completeOrder").modal("close");
    })
});



//Get distance between the shop and the order
function getDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}
