var cusLen = ''

function refreshCustomers() {
    doFetch({
        action: 'getServiceCustomers',
        id: localStorage.getItem('soko-active-store')
    }).then(function (e) {
        $('.cust-count').html(e.customers.length);
        //        $('#serviceBillCharges').html(e.customers.length * 0.167);
        console.log("The customer count is " + (e.customers.length + 1));
        cusLen = e.customers.length;
        $(".cusLen").html(cusLen)
        console.log(cusLen)
        for (var i = 0; i < e.customers.length; i++) {
            //timeline.push({time:'',type:'cust',title:'Name',body:'',amount:''});
        };
        getObjectStore('data', 'readwrite').put(JSON.stringify(e.customers), 'soko-store-customers-' + id);
        addAllCust();
    }).catch(function (err) {
        addAllCust();
    });
    checkedProdsInPromo()
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
                time: 0,
                type: 'empty',
                title: 'Nothing Found',
                body: 'nothing to see here..'
            });
        } else {
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
                            title: "Complete Transaction",
                            customClass: "salertHm",
                            text: ' enter transaction message to complete',
                            type: "input",
                            showCancelButton: true,
                            closeOnConfirm: false,
                            inputPlaceholder: "transaction message"
                        }, function (inputValue) {
                            if (inputValue === false) return false;
                            if (inputValue === "") {
                                swal.showInputError("You need to write something!");
                                return false
                            }
                            doFetch({
                                action: 'compTrn',
                                trnid: trnid,
                                msg: inputValue,
                                to: 'user-' + currCust,
                                from: 'service-' + localStorage.getItem('bitsoko-merchant-id')
                            }).then(function (e) {
                                doFetch({
                                    action: 'getServiceTrans',
                                    id: id
                                }).then(function (e) {
                                    swal({
                                        title: "transaction completed",
                                        text: inputValue,
                                        timer: 5000,
                                        showConfirmButton: false
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
                    time: moment(reqs[i].time).unix(),
                    type: 'message',
                    title: 'New Message',
                    body: '',
                    amount: reqs[i].amount
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
                        time: moment(reqs[i].posted).unix(),
                        type: 'sent',
                        title: 'Sent',
                        body: '',
                        amount: reqs[i].amount,
                        status: reqs[i].status,
                        transid: reqs[i].transid
                    });
                } else {
                    timeline.push({
                        time: moment(reqs[i].posted).unix(),
                        type: 'rec',
                        title: 'Received',
                        body: '',
                        amount: reqs[i].amount,
                        status: reqs[i].status,
                        transid: reqs[i].transid
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
        try {
            var reqs = event.target.result;
            reqs = JSON.parse(reqs);
            //            console.log(reqs);
            for (var i = 0; i < reqs.length; ++i) {
                // timeline.push({time:reqs[i].joined,uid:reqs[i].uid,type:'cust',title:reqs[i].name,body:reqs[i].servaccno,amount:reqs[i].img});
                var html = ' <li class="collection-item avatar">' + '<img src="' + reqs[i].img + '" alt="" class="circle">' + '<span class="title">' + reqs[i].name + '</span>' + '<p>customer since<br> ' + reqs[i].uid + '</p>' + '</li>';
                $(".customers-holda").append($.parseHTML(html));
            };
        } catch (err) {
            console.log(err);
        }
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
            } else {
                continue;
            }
        };
    };
}


function getActvStoreCust(promoid, promoSubs) {
    //    console.log(promoid, promoSubs);
    return new Promise(function (resolve, reject) {
        //        console.log(promoid, promoSubs);
        getObjectStore('data', 'readwrite').get("soko-store-customers-" + localStorage.getItem('soko-active-store')).onsuccess = function (event) {
            //            console.log(promoid, promoSubs);
            var p = {};
            p.promoid = promoid;
            p.promoSubs = promoSubs;
            try {
                p.allCust = $.parseJSON(event.target.result);
            } catch (err) {
                return;
            }

            resolve(p);
        }
    });
}
