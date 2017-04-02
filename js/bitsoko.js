stores = [];
currCust = "";
timeline = [];
transactions = [];
stimeline = function () {
    var stl = timeline.sort(function (a, b) {
        console.log(a.time, b.time);
        if (a.time > b.time) {
            return 1;
        }
        if (a.time < b.time) {
            return -1;
        }
        // a must be equal to b
        return 0; //sort by ascending
    });
    return stl;
}();
//  Object.observe(stimeline, timelineObserver);
flag = false;

function profileLoaded(p) {
    $('.profile-image').attr('src', p.image);
    //p.ownerid=1;
    localStorage.setItem('soko-owner-id', p.bitsokoUserID);
    Materialize.toast('Signing in...', 3000)
    doFetch({
        action: 'merchantServiceLoader'
        , id: localStorage.getItem('bits-user-name')
    }).then(function (e) {
        if (e.status == "ok") {
            $('#login').modal('close');
            getObjectStore('data', 'readwrite').put(JSON.stringify(e.services), 'soko-stores');
            localStorage.setItem('bitsoko-stores', 'true');
            loadPOS();
        }
        else if (e.msg == "no services") {
            getObjectStore('data', 'readwrite').put(JSON.stringify([]), 'soko-stores');
            $('#firstStoreModal').modal({
                dismissible: false
                , complete: function () {
                    $('#newStoreModal').modal({
                        dismissible: false
                    }).modal('open');
                }
            });
            $('#firstStoreModal').modal('open');
        }
        else {
            createService(p);
        }
    }).catch(function (err) {
        loadPOS();
    });
    doFetch({
        action: 'getMadr'
        , id: p.bitsokoUserID
    }).then(function (e) {
        if (e.status == "ok") {
            localStorage.setItem('bitsoko-wallets-addr', e.adr)
        }
        else {
            console.log('Error: unable to load merchant info');
        }
    });
}
//Remove Product
$(document).on('touchstart click', '.removeProduct', function (event) {
    console.log("Product Removed Successfully");
    $(this).parent().parent().parent().parent().remove();
});
//Remove Promotion
$(document).on('touchstart click', '.removePromo', function (event) {
    console.log("Promotion Removed Successfully");
    $(this).parent().parent().parent().parent().parent().remove();
});
//Hide Card Reveal on Promotion Page
$(document).on('touchstart click', '.backBtnPromo', function (event) {
    $(this).parent().parent().hide();
});
//Prevent dropdown content on Promotion page closing on touchstart
$(document).on('touchstart click', '.multiple-select-dropdown', function (event) {
    event.stopPropagation();
});

function reqMsg(data) {
    getObjectStore('data', 'readwrite').get("bitsoko-merchant-customers").onsuccess = function (event) {
        cid = data;
        var allCust = $.parseJSON(event.target.result);
        for (var i = 0, cid = cid; i < allCust.length; ++i) {
            var test = new RegExp(cid).test(allCust[i].uid);
            if (test) {
                swal({
                    title: "Message " + allCust[i].name
                    , text: 'send a short message to '
                    , type: "input"
                    , customClass: "salertHm"
                    , showCancelButton: true
                    , closeOnConfirm: false
                    , confirmButtonText: "Send"
                    , animation: "slide-from-top"
                    , inputPlaceholder: "message"
                    , imageUrl: allCust[i].img.replace('50', '150')
                }, function (inputValue) {
                    if (inputValue === false) return false;
                    if (inputValue === "") {
                        swal.showInputError("You need to write something!");
                        return false
                    }
                    doFetch({
                        action: 'sendMessage'
                        , to: 'user-' + allCust[i].uid
                        , from: 'service-' + localStorage.getItem('bitsoko-merchant-id')
                        , msg: inputValue
                    }).then(function (e) {
                        swal({
                            title: "Message Sent"
                            , text: inputValue
                            , timer: 5000
                            , showConfirmButton: false
                        });
                    });
                });
                break;
            }
            else {
                continue;
            }
        };
    };
}

function reqSend(data) {
    getObjectStore('data', 'readwrite').get("bitsoko-merchant-customers").onsuccess = function (event) {
        cid = data;
        var allCust = $.parseJSON(event.target.result);
        for (var i = 0, cid = cid; i < allCust.length; ++i) {
            var test = new RegExp(cid).test(allCust[i].uid);
            if (test) {
                swal({
                    title: "Send to " + allCust[i].name
                    , text: 'request a transfer from admin '
                    , type: "input"
                    , customClass: "salertHm"
                    , showCancelButton: true
                    , closeOnConfirm: false
                    , confirmButtonText: "Request"
                    , animation: "slide-from-top"
                    , inputPlaceholder: "amount"
                    , imageUrl: allCust[i].img.replace('50', '150')
                }, function (inputValue) {
                    if (inputValue === false) return false;
                    if (inputValue === "" || isNaN(inputValue)) {
                        swal.showInputError("You need to enter an amount!");
                        return false
                    }
                    doFetch({
                        action: 'sendTranReq'
                        , to: 'user-' + allCust[i].uid
                        , from: 'service-' + localStorage.getItem('bitsoko-merchant-id')
                        , amount: inputValue
                    }).then(function (e) {
                        swal({
                            title: "Request Sent"
                            , text: inputValue
                            , timer: 5000
                            , showConfirmButton: false
                        });
                    });
                });
                break;
            }
            else {
                continue;
            }
        };
    };
}

function updateMerch(s) {
    //localStorage.setItem('soko-active-store',services[0].id);
    $('.store-name').html(s.name);
    $('.store-desc').html(s.description);
    //$('.store-img').attr('src', s.icon);
    //document.getElementByClass('user-details')
    $("ul.side-nav.leftside-navigation li.user-details").css("background", "url(" + s.bannerPath + ") no-repeat center center").css("background-size", "cover");;
    var x = document.getElementsByClassName('user-details');
    var i;
    for (i = 0, s = s; i < x.length; i++) {
        //x[i].style.background = s.banner;
    }
};

function loadPOS() {
    screen.keepAwake = true;
    var stCb = getObjectStore('data', 'readwrite').get('soko-stores');
    stCb.onsuccess = function (event) {
        try {
            var svcs = event.target.result;
            var services = JSON.parse(svcs);
        }
        catch (err) {
            $('#newStoreModal').modal({
                dismissible: false
            });
            $('#newStoreModal').modal('open');
            return;
        }
        if (services.length == 0) {
            $('#firstStoreModal').modal({
                dismissible: false
                , complete: function () {
                    $('#newStoreModal').modal({
                        dismissible: false
                    }).modal('open');
                }
            });
            $('#firstStoreModal').modal('open');
            return;
        }
        $("#switchStoreContent").html('');
        for (var i = 0; i < services.length; ++i) {
            var html = ' <li class="collection-item avatar closeSwitchStore" style="" svid="' + services[i].id + '"><img src="' + services[i].bannerPath + '" alt="" class="circle"><div class="row">' + '<p class="collections-title">' + services[i].name + '</strong></p><p class="collections-content">...</p></div>' + '</li>';
            $("#switchStoreContent").append(html);
            localStorage.setItem('soko-store-id-' + services[i].id, JSON.stringify(services[i]));
            localStorage.setItem('soko-active-store', services[0].id);
            initialisePush('soko-store-id-' + services[i].id);
        }
        var shroot = document.querySelectorAll(".closeSwitchStore");
        for (var i = 0; i < shroot.length; ++i) {
            shroot[i].addEventListener("touchstart", doSwitchStore, false);
        };
        addStore();
    }
    stCb.onerror = function (event) {
            $('#newStoreModal').modal({
                dismissible: false
            });
            $('#newStoreModal').modal('open');
        }
        //  appMaster.animateScript();
        //setInterval(noteChecker,30000);
}

function Tobserver(changes) {
    changes.forEach(function (change, i) {
        console.log('what property changed? ' + change.name);
        console.log('how did it change? ' + change.type);
        console.log('whats the current value? ' + change.object[change.name]);
        console.log(change); // all changes
        var elm = '#trans-' + change.object.ID + '-' + change.name;
        console.log('changing: ' + elm)
        $(elm).html(change.object[change.name]);
        //$('#store-desc').val(e.desc);
    });
}
bc.postMessage({
    cast: 'connect'
    , user: 'serviceHandler'
});
/*
function process(e,event) {
        var currStep=$(e).attr('id').split("-")[1];

    $('#prod-'+currStep+'-butt > span').removeClass( 'fa-question fa-check fa-spinner fa-spin' );
    $('#prod-'+currStep+'-butt > span').addClass( 'fa-spinner fa-spin' );

        //var input = $(e).attr('for');
        var action = $(e).attr('action');
        if (currStep=='type'){

        localStorage.setItem('BITS.merchant.actvID','');
        localStorage.setItem('BITS.merchant.actvIDwal','');
        var itemid = localStorage.getItem('BITS.merchant.actvID');

        }else {
        var itemid = localStorage.getItem('BITS.merchant.actvID');

        }

             return new Promise(function(resolve, reject) {
        if(currStep=='img'){
      //var event=e;
         var data=[];
           // files = [];
      var reader = new FileReader();
    // Do the usual XHR stuff

         $.each(event.target.files, function(index, file) {
      reader.onload = function(event) {
        object = {};
        object.filename = file.name;
        object.data = event.target.result;
        imgtest=event.target.result;
        data.push(object);

        console.log(action,data);
         //resolve(doGet(action,JSON.stringify(data),itemid));
         resolve(doFetch({action:action, data:JSON.stringify(data), datab:itemid}));

 //return ;
         // console.log(object);
      };

        reader.onerror=function(event){


      reject(Error("image Error"));
        };

      reader.readAsDataURL(file);


  });
        }else{
        var data = $(e).val();

 //return doGet(action,data,itemid);
       doFetch({action:action, data:data, datab:itemid}).then(function(e){
           resolve(e);
                                                              });


        }
  // Return a new promise.

    });
}

*/
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
function createCanvas() {
    var clcanvas = document.createElement("canvas");
    var allcanvas = document.createElement("canvas");
    allcanvas.id = "spectrum-all";
    clcanvas.id = "spectrum-color";
    clcanvas.height = "200";
    allcanvas.height = "200";
    allcanvas.width = "20";
    /* var html = '<canvas height="200" id="spectrum-color" style="width:80%;height:200px;"> </canvas>' + '<canvas height="200" id="spectrum-all" width="20"> </canvas>' + '<br>' + '<div class="selected-color"></div>';*/
    document.getElementById('themeCanvas').appendChild(clcanvas);
    document.getElementById('themeCanvas').appendChild(allcanvas);
}

function refreshBills(month, year) {
    var months = {
        '0': 'Jan'
        , '1': 'Feb'
        , '2': 'Mar'
        , '3': 'Apr'
        , '4': 'May'
        , '5': 'Jun'
        , '6': 'Jul'
        , '7': 'Aug'
        , '8': 'Sep'
        , '9': 'Oct'
        , '10': 'Nov'
        , '11': 'Dec'
    }
    doFetch({
        action: 'getServiceBills'
        , id: localStorage.getItem('soko-active-store')
    }).then(function (e) {
        bills = e.reqs
        i = 0
        billing_string = ''
        billing_amount = ''
        promotion_id = ''
        dailyBill = ''
        $.each(bills, function (index, obj) {
            var promotionId = obj.promoid;
            splitted = obj['date'].split(' ');
            parsed_date = splitted[0] + ' ' + splitted[2];
            month_name = splitted[1];
            if (splitted[1] == months[month] && splitted[3] == year) {
                console.log('This was added');
                dailyBill += '<li class="rowBill"><div class="collapsible-header"> <div class="row"> <div class="anything col s6"><span id="billingDate">' + parsed_date + '</span></div><div class="anything col s6"><span class="dailyBill">' + (0.167) + '</span></div></div></div><div class="collapsible-body" style="padding:10px;padding-left:25%;"><span>' + 'Billing for Promo ' + promotionId + '</span></div></li>';
            }
        });
        console.log('Daily bill is: ' + dailyBill);
        $('.cust-count').html(e.reqs.length);
        //        $('#billingDate').html(billing_string);
        //        $('#dailyBill').html(billing_amount);
        if (dailyBill == '') {
            $('#rowBIll').html('<li class="rowBill"><div class="collapsible-header"> No results found </div></li>');
        }
        else {
            $('#rowBIll').html(dailyBill);
        }
        //$('.month').html(month_name);
        var billcharges = parseFloat(e.reqs.length * 0.167).toFixed(3);
        console.log("Biliing charges----------->>" + billcharges)
        $('#serviceBillCharges').html(billcharges); =
        if (e.status == "ok") {
            console.log(e)
        }
        else {
            console.log("error");
        };
    });
}

function refreshCustomers() {
    doFetch({
        action: 'getServiceCustomers'
        , id: localStorage.getItem('soko-active-store')
    }).then(function (e) {
        $('.cust-count').html(e.customers.length);
        //        $('#serviceBillCharges').html(e.customers.length * 0.167);
        console.log("The customer count is " + (e.customers.length + 1));
        for (var i = 0; i < e.customers.length; i++) {
            //timeline.push({time:'',type:'cust',title:'Name',body:'',amount:''});
        };
        getObjectStore('data', 'readwrite').put(JSON.stringify(e.customers), 'soko-store-customers-' + id);
        addAllCust();
    }).catch(function (err) {
        addAllCust();
    });
}

function refreshProducts() {
    doFetch({
        action: 'getProducts'
        , id: localStorage.getItem('soko-active-store')
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

function refreshPromotions() {
    doFetch({
        action: 'getPromotions'
        , id: id
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

function addStore() {
    e = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store')));
    updateMerch(e);
    id = e.id;
    refreshCustomers();
    //refreshBills();
    doFetch({
        action: 'getServiceTrans'
        , id: id
    }).then(function (e) {
        if (e.status == "ok") {
            //document.querySelector('.soko-tran-count').style.display = 'block';
            //          document.querySelector('.soko-tran-count').innerHTML = e.transactions.length;
            localConverter().then(function (loCon) {
                var volFig = 0;
                for (var i = 0, volFig = volFig; i < e.transactions.length; i++) {
                    volFig = parseInt(e.transactions[i].amount) + volFig;
                };
                var infiat = Math.ceil(parseFloat(volFig) / 100000000 * loCon.xrate * loCon.rate);
                $('.vol-count').html(infiat + '/= ' + loCon.symbol);
            }).catch(function (err) {
                console.log(err);
            });
            getObjectStore('data', 'readwrite').put(JSON.stringify(e.transactions), 'bitsoko-merchant-transactions-' + id);
            salesUpdater();
        }
        else {
            noSalesUpdater();
        }
        //       addTransaction(e.transactions);
    }).catch(function (err) {
        salesUpdater();
    }); //addCustomer(e.customers);
    doFetch({
        action: 'getServiceReqs'
        , id: id
    }).then(function (e) {
        getObjectStore('data', 'readwrite').put(JSON.stringify(e.reqs), 'bitsoko-merchant-requests-' + id);
    });
    refreshBeacons();
    refreshProducts();
    refreshPromotions();
}

function refreshBeacons() {
    doFetch({
        action: 'getBeacons'
        , id: localStorage.getItem('soko-owner-id')
    }).then(function (e) {
        console.log(e);
        getObjectStore('data', 'readwrite').put(JSON.stringify(e.beacons), 'soko-owner-' + localStorage.getItem('soko-owner-id') + '-beacons');
        beaconsUpdater();
    }).catch(function (err) {
        beaconsUpdater();
    }); //addCustomer(e.customers);
}

function addTransaction(t) {
    var x = document.querySelector('link[type="trn-template"]');
    // Clone the <template> in the import.
    try {
        var template = x.import.querySelector('template');
        //template.content.querySelector('img').src = '../images/icon.png';
        //template.content.querySelector('.trans-name-holder').id ='trans-'+t.ID+'-name';
        // template.content.querySelector('.trans-amt-holder').id ='trans-'+t.ID+'-amt';
        for (var i = 0, template = template; i < t.length; ++i) {
            var transaction = t[i];
            Object.observe(transaction, Tobserver);
            template.content.querySelector('.trans-accno-holder').id = 'trans-' + transaction.ID + '-accno';
            var clone = document.importNode(template.content, true);
            document.querySelector('.trn-holder').appendChild(clone);
            transaction.accno = '1234567890';
        }
    }
    catch (err) {
        console.log('unable to import plugin templates', err);
    }
}

function addCustomer(c) {
    document.querySelector('.bits-cur-c-img').style.opacity = 1;
    document.querySelector('.custDet').style.height = 'auto';
    document.querySelector('.bits-cur-c-img').src = c.img.replace('50', '150');
    document.querySelector('.bits-cur-c-name').innerHTML = c.name;
    document.querySelector('.bits-cur-c-accno').innerHTML = c.servaccno;
    $('.msgCust').attr('uid', c.uid);
    $('.sendCust').attr('uid', c.uid);
    $('.recCust').attr('uid', c.uid);
    document.querySelector('.timeline').innerHTML = "";
    timeline = [];
    currCust = c.uid;
    Object.observe(timeline, timelineObserver);
    //START TODO
    //Insert promise for these events
    addCustomerReq(c);
    addCustomerTran(c);
    //instead of waiting three seconds
    setTimeout(function (e) {
        if (timeline.length == 0) {
            addTTL({
                time: 0
                , type: 'empty'
                , title: 'Nothing Found'
                , body: 'nothing to see here..'
            });
        }
        else {
            timeline.sort(function (a, b) {
                if (a.time > b.time) {
                    return -1;
                }
                if (a.time < b.time) {
                    return 1;
                }
                // a must be equal to b
                return 0; //sort by date ascending
            });
            timeline.forEach(function (evt, i) {
                addTTL(evt);
            });
            setTimeout(function (e) {
                $(".pending-trn").bind('touchstart click', function (e) {
                    console.log('trying to complete');
                    if (!flag) {
                        flag = true;
                        setTimeout(function () {
                            flag = false;
                        }, 300);
                        //
                        console.log($(this).attr('trnid'));
                        trnid = $(this).attr('trnid');
                        swal({
                            title: "Complete Transaction"
                            , customClass: "salertHm"
                            , text: ' enter transaction message to complete'
                            , type: "input"
                            , showCancelButton: true
                            , closeOnConfirm: false
                            , inputPlaceholder: "transaction message"
                        }, function (inputValue) {
                            if (inputValue === false) return false;
                            if (inputValue === "") {
                                swal.showInputError("You need to write something!");
                                return false
                            }
                            doFetch({
                                action: 'compTrn'
                                , trnid: trnid
                                , msg: inputValue
                                , to: 'user-' + currCust
                                , from: 'service-' + localStorage.getItem('bitsoko-merchant-id')
                            }).then(function (e) {
                                doFetch({
                                    action: 'getServiceTrans'
                                    , id: id
                                }).then(function (e) {
                                    swal({
                                        title: "transaction completed"
                                        , text: inputValue
                                        , timer: 5000
                                        , showConfirmButton: false
                                    });
                                });
                                getObjectStore('data', 'readwrite').put(JSON.stringify(e.transactions), 'bitsoko-merchant-transactions');
                                //       addTransaction(e.transactions);
                            });
                        });
                        //}
                    };
                });
            }, 3000);
        }
    }, 3000);
    //END TODO
}

function timelineObserver(changes) {
    changes.forEach(function (change, i) {
        if (change.type == 'add') {}
    });
}

function addTTL(e) {
    localConverter().then(function (loCon) {
        var infiat = parseInt(e.amount) / 100000000 * loCon.xrate * loCon.rate;
        var tl = $(".timeline");
        switch (e.type) {
        case 'cust':
            html = '<li class="clearfix"><time class="tl-time" style="text-align: right;"><h3 class="text-bitcl" style="text-align: right;width: 100%;margin: 10px 0px 10px 0px!important;"></h3><p></p></time><img src="' + e.amount + '" class="store-img tl-img" alt="..." uid="' + e.uid + '"><div class="tl-content"><div class="panel panel-primary"><div class="bg-bitcl panel-heading">' + e.title + '</div><div class="panel-body"><time class="tl-time" style="display: flex!important;text-align: left;width: 100%;"><h3 class="text-bitcl" style="">' + e.body + '</h3><p> </p></time></br></br>info</div></div></div></li>';
            break;
        case 'message':
            var tim = moment.unix(e.time);
            html = '<li class="clearfix"><time class="tl-time" style="text-align: right;"><h3 class="text-bitcl" style="text-align: right;width: 100%;margin: 10px 0px 10px 0px!important;">#</h3><p>transaction id</p></time><i class="fa fa-tags bg-bitcl tl-icon text-white"></i><div class="tl-content"><div class="panel panel-primary"><div class="bg-bitcl panel-heading">New Request</div><div class="panel-body"><time class="tl-time" style="display: flex!important;text-align: left;width: 100%;"><h3 class="text-bitcl" style="">' + Math.ceil(infiat) + '<span style="font-size:55%;">/= ' + loCon.symbol + '</span></h3><p> </p></time></br></br>' + tim.format("dddd, MMMM Do YYYY, h:mm:ss a") + '</div></div></div></li>';
            break;
        case 'rec':
            statCla = '';
            if (e.status == 'pending') {
                statCla = ' pending-trn pressable-pressing';
            }
            var tim = moment.unix(e.time);
            html = '<li class="clearfix"><time class="tl-time" style="text-align: right;"><h3 class="text-green" style="text-align: right;width: 100%;margin: 10px 0px 10px 0px!important;">#</h3><p>transaction id</p></time><i trnid="' + e.transid + '" class="fa fa-arrow-down bg-green tl-icon text-white' + statCla + '"></i><div class="tl-content"><div class="panel panel-primary"><div class="bg-green panel-heading">Received</div><div class="panel-body"><time class="tl-time" style="display: flex!important;text-align: left;width: 100%;"><h3 class="text-green" style="margin-top: 0px;">' + Math.ceil(infiat) + '<span style="font-size:55%;">/= ' + loCon.symbol + '</span></h3><p> </p></time></br></br>' + tim.format("dddd, MMMM Do YYYY, h:mm:ss a") + '</div></div></div></li>';
            break;
        case 'sent':
            statCla = '';
            if (e.status == 'pending') statCla = ' pending-trn pressable-pressing';
            var tim = moment.unix(e.time);
            html = '<li class="clearfix"><time class="tl-time" style="text-align: right;"><h3 class="text-red" style="text-align: right;width: 100%;margin: 10px 0px 10px 0px!important;">#</h3><p>transaction id</p></time><i class="fa fa-arrow-up bg-red tl-icon text-white' + statCla + '"></i><div class="tl-content"><div class="panel panel-primary"><div class="bg-red panel-heading">Sent</div><div class="panel-body"><time class="tl-time" style="display: flex!important;text-align: left;width: 100%;"><h3 class="text-red" style="margin-top: 0px;">' + Math.ceil(infiat) + '<span style="font-size:55%;">/= ' + loCon.symbol + '</span></h3><p> </p></time></br></br>' + tim.format("dddd, MMMM Do YYYY, h:mm:ss a") + '</div></div></div></li>';
            break;
        case 'empty':
            html = '<li class="clearfix"><time class="tl-time"><h3 class="text-gray">00:00</h3><p>time</p></time><i class="fa fa-question bg-gray tl-icon text-white"></i><div class="tl-content"><div class="panel panel-primary"><div class="bg-gray panel-heading">Nothing found..</div><div class="panel-body">nothing to see here..</div></div></div></li>';
            break;
        default:
        }
        tl.append($.parseHTML(html));
    });
}

function addCustomerReq(cid) {
    var data = {};
    data.cid = cid.uid;
    data.tl = timeline;
    getObjectStore('data', 'readwrite').get('bitsoko-merchant-requests').onsuccess = function (event) {
        cid = data.cid;
        timeline = data.tl;
        var reqs = event.target.result;
        reqs = JSON.parse(reqs);
        for (var i = 0, cid = cid, timeline = timeline; i < reqs.length; ++i) {
            if (cid == reqs[i].reqto) {
                timeline.push({
                    time: moment(reqs[i].time).unix()
                    , type: 'message'
                    , title: 'New Message'
                    , body: ''
                    , amount: reqs[i].amount
                });
            };
        }
    }
}

function addCustomerTran(cid) {
    var data = {};
    data.cid = cid.uid;
    data.accno = cid.servaccno;
    console.log(data);
    data.tl = timeline;
    getObjectStore('data', 'readwrite').get('bitsoko-merchant-transactions').onsuccess = function (event) {
        acno = data.accno;
        cid = data.cid;
        timeline = data.tl;
        var reqs = event.target.result;
        reqs = JSON.parse(reqs);
        for (var i = 0, acno = acno, cid = cid, timeline = timeline; i < reqs.length; ++i) {
            console.log(cid, reqs[i].user, acno, reqs[i].accno); //console.log(reqs[i].sender,localStorage.getItem('bitsoko-wallets-addr'));
            //   if((cid==reqs[i].user || reqs[i].user== localStorage.getItem('bitsoko-user-name') ) && acno==reqs[i].accno){
            if (acno == reqs[i].accno) {
                if (reqs[i].sender == localStorage.getItem('bitsoko-wallets-addr')) {
                    console.log(moment(reqs[i].posted).unix());
                    timeline.push({
                        time: moment(reqs[i].posted).unix()
                        , type: 'sent'
                        , title: 'Sent'
                        , body: ''
                        , amount: reqs[i].amount
                        , status: reqs[i].status
                        , transid: reqs[i].transid
                    });
                }
                else {
                    timeline.push({
                        time: moment(reqs[i].posted).unix()
                        , type: 'rec'
                        , title: 'Received'
                        , body: ''
                        , amount: reqs[i].amount
                        , status: reqs[i].status
                        , transid: reqs[i].transid
                    });
                    $('.bits-cur-c-addr').html(reqs[i].sender);
                }
            };
        }
    }
}

function addAllCust() {
    getObjectStore('data', 'readwrite').get('soko-store-customers-' + localStorage.getItem('soko-active-store')).onsuccess = function (event) {
        //    cid=data.cid;
        document.querySelector('.customers-holda').innerHTML = "";
        var reqs = event.target.result;
        reqs = JSON.parse(reqs);
        console.log(reqs);
        for (var i = 0; i < reqs.length; ++i) {
            // timeline.push({time:reqs[i].joined,uid:reqs[i].uid,type:'cust',title:reqs[i].name,body:reqs[i].servaccno,amount:reqs[i].img});
            var html = ' <li class="collection-item avatar">' + '<img src="' + reqs[i].img + '" alt="" class="circle">' + '<span class="title">' + reqs[i].name + '</span>' + '<p>customer since<br> ' + reqs[i].uid + '</p>' + '</li>';
            $(".customers-holda").append($.parseHTML(html));
        };
        //console.log(timeline);
    }
}

function searchCust(inp) {
    getObjectStore('data', 'readwrite').get("bitsoko-merchant-customers-" + localStorage.getItem('soko-active-store')).onsuccess = function (event) {
        var allCust = $.parseJSON(event.target.result);
        for (var i = 0; i < allCust.length; ++i) {
            var test = new RegExp(inp).test(allCust[i].uid);
            if (test) {
                addCustomer(allCust[i]);
                break;
            }
            else {
                continue;
            }
        };
    };
}

function getActvStoreCust(promoid, promoSubs) {
    console.log(promoid, promoSubs);
    return new Promise(function (resolve, reject) {
        console.log(promoid, promoSubs);
        getObjectStore('data', 'readwrite').get("soko-store-customers-" + localStorage.getItem('soko-active-store')).onsuccess = function (event) {
            console.log(promoid, promoSubs);
            var p = {};
            p.promoid = promoid;
            p.promoSubs = promoSubs;
            p.allCust = $.parseJSON(event.target.result);
            resolve(p);
        }
    });
}

function addPromoSubscribers(promoid, promoSubs) {
    console.log(promoid, promoSubs);
    promoSubs = promoSubs;
    getActvStoreCust(promoid, promoSubs).then(function (p) {
        console.log(p.promoid, p.promoSubs, p.allCust);
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
                }
                else {
                    continue;
                }
            };
        };
    });
}

function createService(p) {
    console.log(p);
    busDet = {
        image: "assets/images/icon.png"
    };
    swal({
        title: "Add Business Name"
        , text: 'add your business details below to start accepting payments.'
        , type: "input"
        , showCancelButton: false
        , closeOnConfirm: false
        , confirmButtonText: "next"
        , customClass: "salertHmInv"
        , inputPlaceholder: "name"
        , imageUrl: busDet.image
    }, function (inputValue) {
        if (inputValue === false) return false;
        if (inputValue === "") {
            swal.showInputError("You need to write something!");
            return false
        }
        else if (inputValue.length > 20) {
            swal.showInputError("thats too long!");
            return false
        }
        busDet.name = inputValue;
        swal({
            title: "Add Business Description"
            , text: 'add your business description below'
            , type: "input"
            , showCancelButton: false
            , closeOnConfirm: false
            , confirmButtonText: "next"
            , customClass: "salertHmInv"
            , inputPlaceholder: "description"
            , imageUrl: busDet.image
        }, function (inputValue) {
            if (inputValue === false) return false;
            if (inputValue === "") {
                swal.showInputError("You need to write something!");
                return false
            }
            else if (inputValue.length > 140) {
                swal.showInputError("thats too long!");
                return false
            }
            busDet.desc = inputValue;
            swal({
                title: "Add Business Logo"
                , text: 'add your business logo below'
                , cancelButtonText: "add"
                , confirmButtonText: "next"
                , showCancelButton: true
                , closeOnCancel: false
                , closeOnConfirm: false
                , customClass: "salertHmInv"
                , imageUrl: p.image.url.replace('50', '150')
            }, function () {
                //busDet.logo=inputValue
                swal({
                    title: busDet.name
                    , text: busDet.desc
                    , showCancelButton: false
                    , confirmButtonText: "create"
                    , closeOnConfirm: false
                    , customClass: "salertHmInv"
                    , imageUrl: p.image.url.replace('50', '150')
                }, function () {
                    busDet.desc = inputValue;
                    console.log(busDet);
                });
            });
        });
    });
}

function salesUpdater() {
    var gsl = getObjectStore('data', 'readwrite').get('soko-store-' + localStorage.getItem('soko-active-store') + '-transactions');
    gsl.onsuccess = function (event) {
        localConverter().then(function (loCon) {
            var reqs = event.target.result;
            try {
                reqs = JSON.parse(reqs);
            }
            catch (err) {
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
            }
            else {
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

function beaconsUpdater() {
    getObjectStore('data', 'readwrite').get('soko-owner-' + localStorage.getItem('soko-owner-id') + '-beacons').onsuccess = function (event) {
        var reqs = event.target.result;
        try {
            reqs = JSON.parse(reqs);
        }
        catch (err) {
            reqs = []
        };
        $(".beacons-holda-connected").html('');
        $(".beacons-holda-available").html('');
        if (reqs.length > 0) {
            var html = '<li class="collection-item avatar"><i class="mdi-action-settings-bluetooth green circle"></i>' + '<span class="collection-header">Connected Beacons</span><p>' + reqs.length + ' Found</p></li>';
            $(".beacons-holda-connected").append($.parseHTML(html));
            var html = '<li class="collection-item avatar"><i class="mdi-action-settings-bluetooth pink circle"></i>' + '<span class="collection-header">Available Beacons</span><p>' + reqs.length + ' Found</p></li>';
            $(".beacons-holda-available").append($.parseHTML(html));
        }
        else {
            var html = '<li class="collection-item avatar"><i class="mdi-action-settings-bluetooth cyan circle"></i>' + '<span class="collection-header">No Beacons Found</span><p>click here to add a beacon</p></li>';
            $(".beacons-holda-available").append($.parseHTML(html));
            return;
        }
        var st = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store')));
        for (var i = 0, st = st; i < reqs.length; ++i) {
            if (parseInt(reqs[i].service) == parseInt(localStorage.getItem('soko-active-store'))) {
                var html = '<li class="collection-item">' + '<div class="row"><div class="col s4">' + '<p class="collections-title"><strong>#' + reqs[i].name + '</strong> Connected</p></div><div class="col s5"><div class="select-wrapper initialized"><span class="caret">▼</span><select class="initialized" bid="' + reqs[i].id + '"><option selected="" value="' + st.id + '">' + st.name + '</option><option value="0">disabled</option></select></div></div></div></li>';
                $(".beacons-holda-connected").append($.parseHTML(html));
            }
            else if (parseInt(reqs[i].service) == parseInt('0')) {
                var html = '<li class="collection-item">' + '<div class="row"><div class="col s4">' + '<p class="collections-title"><strong>#' + reqs[i].name + '</strong> Not Connected</p></div><div class="col s5"><div class="select-wrapper initialized"><span class="caret">▼</span><select class="initialized" bid="' + reqs[i].id + '"><option value="0" selected="">disabled</option><option value="' + st.id + '">' + st.name + '</option></select></div></div></div></li>';
                $(".beacons-holda-available").append($.parseHTML(html));
            }
        }
        updateBeaconMonitor();
    }
}

function productsUpdater() {
    getObjectStore('data', 'readwrite').get('soko-store-' + localStorage.getItem('soko-active-store') + '-products').onsuccess = function (event) {
        var reqs = event.target.result;
        try {
            reqs = JSON.parse(reqs);
        }
        catch (err) {
            reqs = []
        };
        $(".products-collapsible").html('');
        if (reqs.length == 0) {
            var html = ' <li class="collection-item avatar" style="opacity: 0.6;"><i class="mdi-action-shopping-basket grey circle"></i><div class="row">' + '<p class="collections-title"><strong>No products found</strong></p><p class="collections-content">add a product to this store below</p></div>' + '</li>';
            $(".products-collapsible").append($.parseHTML(html));
            $("#promotions>.fixed-action-btn>a").attr('href', '#firstProdModal');
            $('#firstProdModal').modal({
                dismissible: false
                , complete: function () {
                    $('#add-product').modal({
                        dismissible: false
                    });
                }
            }).modal('open');
            return;
        }
        else {
            $("#promotions>.fixed-action-btn>a").attr('href', '#newPromoModal')
        }
        $(".allProdCount").html(reqs.length);
        for (var i = 0; i < reqs.length; ++i) {
            //  var saleAmount=Math.ceil(parseFloat(reqs[i].amount)/100000000 *loCon.xrate*loCon.rate)+'/= '+loCon.symbol;
            // var saleTime=moment(reqs[i].posted).fromNow();
            //var html = ''+saleAmount+'</h5><small class="noteC-time text-muted">'+saleTime+'</small></div></div></a>';
            var html = '<li prid="' + reqs[i].id + '" style="margin-bottom:10px; background: rgb(255, 255, 255);">' + '<div id="prodImg-holda-' + reqs[i].id + '" style="background-size: cover;background-repeat: no-repeat;background-position: center;background-image:url(' + reqs[i].imagePath + ');width: 90px;height: 86px;float: left;"></div><div class="collapsible-header" style="width: calc(100% - 90px);display:inline-block;">' + reqs[i].name + '<div class="divider"></div><span >' + '<i class="{{product.icon}}"></i>' + reqs[i].quantity + ' available</span></div><div class="collapsible-body"><div style="width: 100%;text-align: center;margin: 20px 0px 0px;color: rgba(0,0,0,0.4);">sale information</div>' + '<form class="col s12" style="padding: 20px 30px;"><div class="row"><div class="input-field col s12">' + '<input id="prodName-' + reqs[i].id + '" prnm="name" type="text" class="validate" prid="' + reqs[i].id + '" value="' + reqs[i].name + '"><label for="prodName-' + reqs[i].id + '" class="">Name</label></div></div>' + '<div class="row"><div class="input-field col s12"><input prnm="description" placeholder="" value="' + reqs[i].description + '" id="prodDesc-' + reqs[i].id + '" type="text" class="validate" prid="' + reqs[i].id + '" min="0">' + '<label for="description" class="">Description</label></div></div><div class="row">' + '<div class="file-field input-field"><div class="btn"><span>image</span><input id="prodImg-' + reqs[i].id + '" prid="' + reqs[i].id + '" prnm="image" type="file">' + '</div><div class="file-path-wrapper"><input class="file-path validate" type="text"></div></div>' + '<div class="input-field col s6"><input prnm="price" placeholder="" value="' + reqs[i].price + '" id="prodPrice-' + reqs[i].id + '" type="number" class="validate" prid="' + reqs[i].id + '" min="0">' + '<label for="prodPrice-' + reqs[i].id + '" class="active">Price</label></div><div class="input-field col s6">' + '<div class="select-wrapper initialized"><span class="caret">▼</span><select id="prodMetric-' + reqs[i].id + '" prnm="metric" class="initialized" >' + '<option value="" disabled="" selected="">measurement</option>' + '<option value="1">per Kilogram</option>' + '<option value="2">per Piece</option>' + '</select></div></div></div><div style="width: 100%;text-align: center;margin: 20px 0px 0px;color: rgba(0,0,0,0.4);">availability</div>' + '<div class="row"><div class="input-field col s6">' + '<input placeholder="" prnm="rstQuantity" id="prodRestNo-' + reqs[i].id + '" type="number" value="' + reqs[i].rstQuantity + '" class="validate" min="0" prid="' + reqs[i].id + '" max="1000">' + '<label for="prodRestNo-' + reqs[i].id + '" class="active"> Quantity</label></div>' + '<div class="input-field col s6"><div class="select-wrapper initialized"><span class="caret">▼</span>' + '<select id="prodRestDur-' + reqs[i].id + '" prnm="rstDuration" class="initialized">' + '<option value="" disabled="" selected="' + reqs[i].rstDuration + '">duration</option>' + '<option value="day">per Day</option>' + '<option value="week">per Week</option>' + '<option value="month">per Month</option>' + '</select></div></div></div>' + '<div class="row" style="text-align: right;margin: 20px 0px;"> <a prid="' + reqs[i].id + '" class="removeProduct waves-effect waves-light btn">remove product</a> </div>' + '</form></div></li>';
            $(".products-collapsible").append($.parseHTML(html));
        }
        $('.products-collapsible').collapsible();
        $('select').material_select();
        Materialize.updateTextFields();
        initProdCallback();
    }
}
//function serviceBillUpdater() {
//    getObjectStore('data', 'readwrite').get('soko-store-' + localStorage.getItem('soko-active-store') + '-products').onsuccess = function (event) {
//        var reqs = event.target.result;
//        try {
//            reqs = JSON.parse(reqs);
//        } catch (err) {
//            reqs = []
//        };
//        $(".billingTableRow").html('');
//        if (reqs.length == 0) {
//            var html = ' <td style="padding-left:10px;" data-th="Header">15th</td> <td style="padding-left:10px;" data-th="Header"> Ksh <span id="serviceBillCharges"></span></td>';
//            $(".billingTableRow").append($.parseHTML(html));
//        } else {
//            $("").attr('href', '#')
//        }
//    }
//}
function promoCreator() {
    getObjectStore('data', 'readwrite').get('soko-store-' + localStorage.getItem('soko-active-store') + '-products').onsuccess = function (event) {
        try {
            e = JSON.parse(event.target.result);
        }
        catch (err) {
            console.log('unable to access products list. ' + err);
            return;
        }
        console.log(e);
        if (e.length == 0) {
            var html = '<li class="collection-item avatar" style="opacity: 0.6;"><i class="mdi-action-redeem cyan circle"></i>' + '<span class="collection-header">No Product Found</span></li>';
            $(".promotions-holda").append($.parseHTML(html));
        }
        else {
            //setupPromos(e);
            $("select.promo-add-ProdList").html('');
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
                var html = '<option value="' + e[i].id + '" label="' + e[i].id + '" data-icon="' + e[i].imagePath + '" class="circle" selected>' + e[i].name + '</option>';
                $("select.promo-add-ProdList").append($.parseHTML(html));
            }
            $('select').material_select();
        }
    }
}

function promoUpdater() {
    getObjectStore('data', 'readwrite').get('soko-store-' + localStorage.getItem('soko-active-store') + '-promotions').onsuccess = function (event) {
        var reqs = event.target.result;
        try {
            reqs = JSON.parse(reqs);
        }
        catch (err) {
            console.log('unable to access promotions list. ' + err);
            return;
        }
        $(".promotions-holda").html('');
        //TO_DO MAKE SURE THERE EXISTS PRODUCTS TO PROMOTE FIRST!!
        if (reqs.length == 0) {
            var html = '<li class="collection-item avatar" style="opacity: 0.6;"><i class="mdi-action-redeem cyan circle"></i>' + '<span class="collection-header">No Promotions Found</span></li>';
            $(".promotions-holda").append($.parseHTML(html));
        }
        else {
            $(".promotions-holda").html('');
            var html = ' <li class="collection-item avatar" style="opacity: 0.6;"><i class="mdi-action-redeem grey circle"></i><div class="row">' + '<p class="collections-title"><strong>Add Promotion</strong></p><p class="collections-content">you can add ' + (3 - reqs.length) + ' more promotions</p></div>' + '</li>';
            $(".promotions-holda").append(html);
        }
        for (var i = 0; i < reqs.length; ++i) {
            //  var saleAmount=Math.ceil(parseFloat(reqs[i].amount)/100000000 *loCon.xrate*loCon.rate)+'/= '+loCon.symbol;
            // var saleTime=moment(reqs[i].posted).fromNow();
            //var html = ''+saleAmount+'</h5><small class="noteC-time text-muted">'+saleTime+'</small></div></div></a>';
            var html = '<div id="promo-card" class="card"><div class="card-image waves-effect waves-block waves-light">' + '<img class="activator" src="' + reqs[i].promoBanner + '" alt="user bg"></div><div class="card-content" style="padding: 0px 20px;">' + '<img src="' + reqs[i].promoLogo + '" alt="" class="circle responsive-img activator card-profile-image">' + '<a class="btn-floating activator btn-move-up waves-effect waves-light darken-2 right">' + '<i class="mdi-editor-mode-edit" ></i></a><p>' + reqs[i].promoName + '</p><p>' + reqs[i].promoDesc + '</p>' + '<p style="text-align: center;padding: 15px 20px;"><i style="float: left;" class="promo-state-icon mdi-notification-sync"> 0 shares</i>' + '<i class="promo-state-icon mdi-action-favorite"> 0 likes </i>' + '<i style="float: right;" class="promo-state-icon mdi-action-receipt"> 0 sales </i></p>' + '<label>offer subscribers</label><div class="divider" style="margin: 10px;"></div><div class="promo-' + reqs[i].id + '-subscribers"></div>' + '</div><div class="card-reveal">' + '<span class="grey-text text-darken-4"><i class="card-title mdi-navigation-close right"></i></span>' + '<div style="width: 100%;text-align: center;margin: 0px 0px 30px 0px;color: rgba(0,0,0,0.4);">promotion settings</div>' + '<div class="row"><div class="input-field col s6"><input placeholder="" id="discount" type="number" class="validate" min="0">' + '<label for="discount" class="active">% discount</label></div>' + '<div class="input-field col s6"><input placeholder="" id="offers" type="number" class="validate" min="0">' + '<label for="offers" class="active">minimum buyers</label></div></div>' + '<div class="input-field col s12 m6"><select class="icons promo-add-ProdList" multiple></select><label>add an item to this promotion</label></div>' + '<div class="row" style="text-align: center;margin: 20px 0px;"> <a class="removePromo waves-effect waves-light btn" style="margin-bottom:10px;">remove promotion</a><br><a class="backBtnPromo waves-effect waves-light btn">back</a> </div>' + '</div></div>';
            $(".promotions-holda").prepend($.parseHTML(html));
            addPromoSubscribers(reqs[i].id, reqs[i].promoSubs);
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
                    action: 'doProdUpdate'
                    , id: prid
                    , prop: name
                    , val: val
                }).then(function (e) {
                    if (e.status == 'ok') {
                        document.querySelector('#prodImg-holda-' + prid).src = val;
                        Materialize.toast('modified ' + name + '..', 3000);
                    }
                    else {
                        console.log(e);
                    }
                });
            };
            img.src = URL.createObjectURL(file);
        }
    }
    else {
        doFetch({
            action: 'doProdUpdate'
            , id: prid
            , prop: name
            , val: val
        }).then(function (e) {
            if (e.status == 'ok') {
                Materialize.toast('modified ' + name + '..', 3000);
            }
            else {
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

function editStoreCallback() {
    var forEach = function (array, callback, scope) {
        for (var i = 0; i < array.length; i++) {
            callback.call(scope, i, array[i]); // passes back stuff we need
        }
    };
    var myNodeList = document.querySelectorAll('#editStoreModal input,#editStoreModal textarea');
    forEach(myNodeList, function (index, value) {
        value.addEventListener("change", updateStore);
    });
}

function checkNotes() {
    console.log('should be checking for notes');
}

function openVideo() {
    var video = document.querySelector('video');
    var canvas = document.querySelector('canvas');
    var ctx = canvas.getContext('2d');
    var localMediaStream = null;

    function snapshot() {
        if (localMediaStream) {
            ctx.drawImage(video, 0, 0);
            // "image/webp" works in Chrome.
            // Other browsers will fall back to image/png.
            document.querySelector('img').src = canvas.toDataURL('image/webp');
        }
    }

    function errorCallback(err) {
        console.log(err);
    }
    video.addEventListener('click', snapshot, false);
    // Not showing vendor prefixes or code that works cross-browser.
    /*
  navigator.getUserMedia({
  video: {
    mandatory: {
      maxWidth: 360,
      maxHeight: 240
    }
  }
}, function(stream) {
    video.src = window.URL.createObjectURL(stream);
    localMediaStream = stream;
  }, errorCallback);
      var video = document.querySelector('video');
  var canvas = document.querySelector('canvas');
  var ctx = canvas.getContext('2d');
  var localMediaStream = null;

  function snapshot() {
    if (localMediaStream) {
      ctx.drawImage(video, 0, 0);
      // "image/webp" works in Chrome.
      // Other browsers will fall back to image/png.
      document.querySelector('img').src = canvas.toDataURL('image/webp');
    }
  }

  function errorCallback(err) {
    console.log(err);
  }

  video.addEventListener('click', snapshot, false);
 // Not showing vendor prefixes or code that works cross-browser.
	      /*
  navigator.getUserMedia({
  video: {
    mandatory: {
      maxWidth: 360,
      maxHeight: 240
    }
  }
}, function(stream) {
    video.src = window.URL.createObjectURL(stream);
    localMediaStream = stream;
  }, errorCallback);
      }});

    }, 200);
 */
}

function newStore() {
    $('.sidebar-collapse').sideNav('hide');
    setTimeout(function () {
        $('#newStoreModal').modal({
            dismissible: false
            , ready: function () {
                getLoc();
            }
        }).modal('open');
    }, 200);
}

function activeStore() {
    return JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store')));
}

function editStore() {
    $('.sidebar-collapse').sideNav('hide');
    setTimeout(function () {
        $('#editStoreModal').modal({
            dismissible: false
            , ready: function () {
                editStoreCallback();
                reqLoc();
                var xx = activeStore();
                document.querySelector('#editStoreModal #editStore-name').value = xx.name;
                document.querySelector('#editStoreModal #editStore-description').value = xx.description;
                document.querySelector('#editStoreModal #editStore-Phone').value = xx.phone;
                Materialize.updateTextFields();
            }
        }).modal('open');
    }, 200);
}

function switchStore() {
    $('.sidebar-collapse').sideNav('hide');
    setTimeout(function () {
        $('#switchStoreModal').modal({
            dismissible: false
            , ready: function () {}
        }).modal('open');
    }, 200);
}

function doSwitchStore() {
    localStorage.setItem('soko-active-store', $(this).attr('svid'));
    addStore();
    $('.chStoreUpdate').html('');
    var html = ' <li class="collection-item avatar" style="opacity: 0.6;"><i class="mdi-action-redeem grey circle"></i><div class="row">' + '<p class="collections-title"><strong>changing store</strong></p><p class="collections-content">...</p></div>' + '</li>';
    $('.chStoreUpdate').append(html);
    $('#switchStoreModal').modal({
        complete: function () {
            Materialize.toast('changing store..', 2000);
        }
    }).modal('close');
}

function doNewStore() {
    if (!$("#newStore-name").hasClass("valid")) {
        Materialize.toast('Ooops! your store needs a name!', 3000);
        return;
    }
    doFetch({
        action: 'doNewStore'
        , ownerid: localStorage.getItem('soko-owner-id')
        , name: document.querySelector('#newStore-name').value
        , desc: document.querySelector('#newStore-description').value
        , loc: document.querySelector('#newStore-Location').value
    }).then(function (e) {
        if (e.status == 'ok') {
            getObjectStore('data', 'readwrite').get('user-profile-' + localStorage.getItem("bits-user-name")).onsuccess = function (event) {
                try {
                    profileLoaded(JSON.parse(event.target.result));
                    $('#newStoreModal').modal({
                        complete: function () {
                            Materialize.toast('added new store..', 3000);
                        }
                    }).modal('close');
                }
                catch (err) {
                    console.log('no user profile found : ', err);
                }
            }
        }
        else {
            console.log(e);
        }
    });
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
            action: 'doCastPromo'
            , id: $(t.target).attr('pid')
            , to: precp
        }).then(function (e) {
            if (e.status == 'ok') {
                Materialize.toast('sent promotion', 3000);
            }
            else {
                console.log(e);
            }
        });
    }
}

function doNewPromo() {
    var items = [];
    var x = document.querySelector('.promo-add-ProdList select');
    var selcItms = document.querySelector('.promo-add-ProdList input').value.split(', ');
    var selcIds = new Array();
    var allItms = new Array();
    for (i = 0, allItms = allItms, selcIds = selcIds; i < x.length; i++) {
        allItms.push({
            name: x.options[i].text
            , id: x.options[i].getAttribute('value')
        });
    }
    for (ii = 0, allItms = allItms, selcIds = selcIds; ii < selcItms.length; ii++) {
        function findChosen(it) {
            return it.name === selcItms[ii];
        }
        selcIds.push(parseInt(allItms.find(findChosen).id));
    }
    doFetch({
        action: 'doNewPromo'
        , ownerid: activeStore().id
        , name: document.querySelector('#newPromo-name').value
        , desc: document.querySelector('#newPromo-desc').value
        , image: document.querySelector('#newPromo-image').value
        , items: selcIds
        , discount: document.querySelector('#newPromo-discount').value
        , offers: document.querySelector('#newPromo-offers').value
    }).then(function (e) {
        if (e.status == 'ok') {
            $('#newPromoModal').modal({
                complete: function () {
                    Materialize.toast('added new promotion..', 3000);
                    refreshPromotions();
                }
            }).modal('close');
        }
        else {
            console.log(e);
        }
    });
}

function updateStore(t) {
    console.log($(t.target));
    var name = $(t.target).attr('stitm');
    var val = $(t.target).val();
    if (name == 'banner') {
        var files = t.target.files;
        var file = files[0];
        if (files && file) {
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
                    action: 'doEditStore'
                    , id: localStorage.getItem('soko-active-store')
                    , prop: name
                    , val: val
                }).then(function (e) {
                    if (e.status == 'ok') {
                        //document.querySelector('#prodImg-holda-'+prid).src = val;
                        Materialize.toast('modified ' + name + '..', 3000);
                    }
                    else {
                        console.log(e);
                    }
                });
            };
            img.src = URL.createObjectURL(file);
        }
    }
    else {
        doFetch({
            action: 'doEditStore'
            , id: localStorage.getItem('soko-active-store')
            , prop: name
            , val: val
        }).then(function (e) {
            if (e.status == 'ok') {
                Materialize.toast('modified ' + name + '..', 3000);
            }
            else {
                console.log(e);
            }
        });
    }
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
        action: 'doNewProduct'
        , id: localStorage.getItem('soko-active-store')
        , prod: newProdDat
    }).then(function (e) {
        if (e.status == 'ok') {
            refreshProducts();
            Materialize.toast('added ..', 3000);
            $('#add-product').modal('close');
        }
        else {
            console.log(e);
        }
    });
}

function updateBeaconMonitor() {
    $('select').material_select();
    var forEach = function (array, callback, scope) {
        for (var i = 0; i < array.length; i++) {
            callback.call(scope, i, array[i]); // passes back stuff we need
        }
    };
    var myNodeList = document.querySelectorAll('.beacons select');
    forEach(myNodeList, function (index, value) {
        $(value).on('change', function (e) {
            var value = this;
            var val = $(value).attr('bid');
            doFetch({
                action: 'doSetBeacon'
                , id: val
                , to: $(value).val()
            }).then(function (e) {
                if (e.status == 'ok') {
                    Materialize.toast('beacon updated ..', 3000);
                    refreshBeacons();
                }
                else {
                    console.log(e);
                }
            });
        });
    });
}
/*
function doEditStore(){

	  doFetch({action: 'doEditStore', ownerid : localStorage.getItem('bitsoko-owner-id'), id : localStorage.getItem('bitsoko-merchant-id')
		   , name: document.querySelector('#editStore-name').value
		  , desc: document.querySelector('#editStore-description').value
		  , loc: document.querySelector('#editStore-Location').value}).then(function (e){
      if(e.status=='ok'){
         $('.store-name').html(document.querySelector('#editStore-name').value);
    $('.store-desc').html(document.querySelector('#editStore-description').value);



      $('#editStoreModal').closeModal({complete: function(){

    Materialize.toast('modified store..', 3000);
      }});

      }else{
      console.log(e);
      }

  });




}
*/
var shroot = document.querySelectorAll(".newStore");
for (var i = 0; i < shroot.length; ++i) {
    shroot[i].addEventListener("touchstart", newStore, false);
};
var shroot = document.querySelectorAll(".editStore");
for (var i = 0; i < shroot.length; ++i) {
    shroot[i].addEventListener("touchstart", editStore, false);
};
var shroot = document.querySelectorAll(".doAddNewStore");
for (var i = 0; i < shroot.length; ++i) {
    shroot[i].addEventListener("touchstart", doNewStore, false);
};
var shroot = document.querySelectorAll(".doAddNewPromo");
for (var i = 0; i < shroot.length; ++i) {
    shroot[i].addEventListener("touchstart", doNewPromo, false);
};
var shroot = document.querySelectorAll(".switchStore");
for (var i = 0; i < shroot.length; ++i) {
    shroot[i].addEventListener("touchstart", switchStore, false);
};
var shroot = document.querySelectorAll(".addProduct");
for (var i = 0; i < shroot.length; ++i) {
    shroot[i].addEventListener("touchstart", addProduct, false);
};
var shroot = document.querySelectorAll(".removeProduct");
for (var i = 0; i < shroot.length; ++i) {
    var id = $(this).attr('prid');
    shroot[i].addEventListener("touchstart", function () {
        doFetch({
            action: 'doProdRemove'
            , id: id
        }).then(function (e) {
            if (e.status == 'ok') {
                //document.querySelector('#prodImg-holda-'+prid).src = val;
                //  Materialize.toast('modified '+name+'..', 3000);
            }
            else {
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
        }
        else {
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
document.addEventListener('visibilitychange', function (event) {
    if (!document.hidden) {
        // The page is visible.
        checkNotes();
    }
    else {
        // The page is hidden.
    }
});
//calenderfunction myFunction() {
$(document).ready(function () {});
$(document).ready(function () {
    var month = new Array();
    month[0] = "January";
    month[1] = "February";
    month[2] = "March";
    month[3] = "April";
    month[4] = "May";
    month[5] = "June";
    month[6] = "July";
    month[7] = "August";
    month[8] = "September";
    month[9] = "October";
    month[10] = "November";
    month[11] = "December";
    var d = new Date();
    var n = month[d.getMonth()];
    document.getElementById("month").innerHTML = n;
    var year = 2017;
    var currMonth = 0;
    $('#month').text(month[0]);
    $('#year').text(year);
    $('#right').click(function () {
        if (currMonth === 11) {
            currMonth = 0;
            $('#month').text(month[currMonth]);
            year++;
            $('#year').text(year);
            refreshBills(currMonth, year);
        }
        else {
            currMonth++;
            $('#month').text(month[currMonth]);
            refreshBills(currMonth, year);
        }
    })
    $('#left').click(function () {
        if (currMonth === 0) {
            currMonth = 11;
            $('#month').text(month[currMonth]);
            year--;
            $('#year').text(year);
            refreshBills(currMonth, year);
        }
        else {
            currMonth--;
            $('#month').text(month[currMonth]);
            refreshBills(currMonth, year);
        }
    })
})