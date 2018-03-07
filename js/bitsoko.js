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
    M.toast({
        html: 'Signing in...',
        displayLength: 3000
    })
    $("#signingIn").html("Signing In. Please Wait");
    updateStores();
    doFetch({
        action: 'getMadr',
        id: p.bitsokoUserID
    }).then(function (e) {
        if (e.status == "ok") {
            localStorage.setItem('bitsoko-wallets-addr', e.adr)
        } else {
            console.log('Error: unable to load merchant info');
        }
    });

    sponsoredProdListener();
    loadTheme();
    walletFunctions(localStorage.getItem("bits-user-name"))
}

function loadTheme() {
    //load store name + user name
    var userName = localStorage.getItem("bits-user-name");
    var storeName = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).name;

    for (var i in deliveryGuys) {
        var name = deliveryGuys[i].name;
        var id = deliveryGuys[i].id;
        if (userName == id) {
            document.title = name + " " + storeName
        }
    }

    //load store theme theme
    var storeColor = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).theme
    if (storeColor == "") {
        $('.selectedColor').css('cssText', 'background: #0F5F76 !important');
        $('head').append('<meta name="theme-color" content="#0F5F76" />');
        $('nav').css("box-shadow", "none");
        $('.opacitySelectedColor').css({
            background: '#0F5F76',
            filter: 'brightness(1.3)'
        });
    } else if (storeColor == null) {
        $('.selectedColor').css('cssText', 'background: #0F5F76 !important');
        $('head').append('<meta name="theme-color" content="#0F5F76" />');
        $('nav').css("box-shadow", "none");
        $('.opacitySelectedColor').css({
            background: '#0F5F76',
            filter: 'brightness(1.3)'
        });
    } else {
        $('.selectedColor').css('cssText', 'background: ' + storeColor + ' !important');
        $('head').append('<meta name="theme-color" content="' + storeColor + '" />');
        $('nav').css("box-shadow", "none");
        $('.opacitySelectedColor').css({
            background: '' + storeColor + '',
            filter: 'brightness(1.3)'
        });
    }
    //load store URL

    storeOwner();
    editStoreContent();
}


function updateStores() {
    doFetch({
        action: 'merchantServiceLoader',
        id: localStorage.getItem('bits-user-name')
    }).then(function (e) {
        if (e.status == "ok") {
            $('#login').modal('close');

            $('#newStoreModal').modal('close');
            getObjectStore('data', 'readwrite').put(JSON.stringify(e.services), 'soko-stores');
            var xx = e.settings
            var xxx = xx.prodCategories
            for (var i = 0; i < xxx.length; i++) {
                console.log(xxx[i].name);
                $(".categorySelect").append('<option value="' + xxx[i].id + '">' + xxx[i].name + '</option>');
            }
            $('.categoriesRow select').on('change', function () {
                var inputVal = $(".categoriesRow input").val()
                console.log(inputVal)
                for (var i in xxx) {
                    var name = xxx[i].name;
                    var id = xxx[i].id;
                    if (inputVal == name) {
                        doFetch({
                            action: 'doEditStore',
                            id: localStorage.getItem('soko-active-store'),
                            prop: "category",
                            val: id
                        }).then(function (e) {
                            if (e.status == 'ok') {
                                M.toast({
                                    html: 'Store category selected successfully',
                                    displayLength: 3000
                                })
                            } else {}
                        });
                    }
                }
            });
            localStorage.setItem('bitsoko-stores', 'true');
            loadPOS();
        } else if (e.msg == "no services") {
            getObjectStore('data', 'readwrite').put(JSON.stringify([]), 'soko-stores');
            $('#firstStoreModal').modal({
                dismissible: false,
                complete: function () {
                    $('#newStoreModal').modal({
                        dismissible: false
                    }).modal('open');
                }
            });
            $('#firstStoreModal').modal('open');
        }
    }).catch(function (err) {
        loadPOS();
    });
}

function reqMsg(data) {
    getObjectStore('data', 'readwrite').get("bitsoko-merchant-customers").onsuccess = function (event) {
        cid = data;
        var allCust = $.parseJSON(event.target.result);
        for (var i = 0, cid = cid; i < allCust.length; ++i) {
            var test = new RegExp(cid).test(allCust[i].uid);
            if (test) {
                swal({
                    title: "Message " + allCust[i].name,
                    text: 'send a short message to ',
                    type: "input",
                    customClass: "salertHm",
                    showCancelButton: true,
                    closeOnConfirm: false,
                    confirmButtonText: "Send",
                    animation: "slide-from-top",
                    inputPlaceholder: "message",
                    imageUrl: allCust[i].img.replace('50', '150')
                }, function (inputValue) {
                    if (inputValue === false) return false;
                    if (inputValue === "") {
                        swal.showInputError("You need to write something!");
                        return false
                    }
                    doFetch({
                        action: 'sendMessage',
                        to: 'user-' + allCust[i].uid,
                        from: 'service-' + localStorage.getItem('bitsoko-merchant-id'),
                        msg: inputValue
                    }).then(function (e) {
                        swal({
                            title: "Message Sent",
                            text: inputValue,
                            timer: 5000,
                            showConfirmButton: false
                        });
                    });
                });
                break;
            } else {
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
                    title: "Send to " + allCust[i].name,
                    text: 'request a transfer from admin ',
                    type: "input",
                    customClass: "salertHm",
                    showCancelButton: true,
                    closeOnConfirm: false,
                    confirmButtonText: "Request",
                    animation: "slide-from-top",
                    inputPlaceholder: "amount",
                    imageUrl: allCust[i].img.replace('50', '150')
                }, function (inputValue) {
                    if (inputValue === false) return false;
                    if (inputValue === "" || isNaN(inputValue)) {
                        swal.showInputError("You need to enter an amount!");
                        return false
                    }
                    doFetch({
                        action: 'sendTranReq',
                        to: 'user-' + allCust[i].uid,
                        from: 'service-' + localStorage.getItem('bitsoko-merchant-id'),
                        amount: inputValue
                    }).then(function (e) {
                        swal({
                            title: "Request Sent",
                            text: inputValue,
                            timer: 5000,
                            showConfirmButton: false
                        });
                    });
                });
                break;
            } else {
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
    cast: 'connect',
    user: 'serviceHandler'
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
/*

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
    } catch (err) {
        console.log('unable to import plugin templates', err);
    }
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

function createService(p) {
    console.log(p);
    busDet = {
        image: "assets/images/icon.png"
    };
    swal({
        title: "Add Business Name",
        text: 'add your business details below to start accepting payments.',
        type: "input",
        showCancelButton: false,
        closeOnConfirm: false,
        confirmButtonText: "next",
        customClass: "salertHmInv",
        inputPlaceholder: "name",
        imageUrl: busDet.image
    }, function (inputValue) {
        if (inputValue === false) return false;
        if (inputValue === "") {
            swal.showInputError("You need to write something!");
            return false
        } else if (inputValue.length > 20) {
            swal.showInputError("thats too long!");
            return false
        }
        busDet.name = inputValue;
        swal({
            title: "Add Business Description",
            text: 'add your business description below',
            type: "input",
            showCancelButton: false,
            closeOnConfirm: false,
            confirmButtonText: "next",
            customClass: "salertHmInv",
            inputPlaceholder: "description",
            imageUrl: busDet.image
        }, function (inputValue) {
            if (inputValue === false) return false;
            if (inputValue === "") {
                swal.showInputError("You need to write something!");
                return false
            } else if (inputValue.length > 140) {
                swal.showInputError("thats too long!");
                return false
            }
            busDet.desc = inputValue;
            swal({
                title: "Add Business Logo",
                text: 'add your business logo below',
                cancelButtonText: "add",
                confirmButtonText: "next",
                showCancelButton: true,
                closeOnCancel: false,
                closeOnConfirm: false,
                customClass: "salertHmInv",
                imageUrl: p.image.url.replace('50', '150')
            }, function () {
                //busDet.logo=inputValue
                swal({
                    title: busDet.name,
                    text: busDet.desc,
                    showCancelButton: false,
                    confirmButtonText: "create",
                    closeOnConfirm: false,
                    customClass: "salertHmInv",
                    imageUrl: p.image.url.replace('50', '150')
                }, function () {
                    busDet.desc = inputValue;
                    console.log(busDet);
                });
            });
        });
    });
}
*/
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



document.addEventListener('visibilitychange', function (event) {
    if (!document.hidden) {
        // The page is visible.
        checkNotes();
    } else {
        // The page is hidden.
    }
});



//Input Initiallization
var deliveryGuys = {}
[{
        id: 66,
        active: 'true'
}]

function userNamesInput(elmID) {
    var fetchedData = doFetch({
        action: 'getAllUsers',
        data: $('#' + elmID).val()
    }).then(function (e) {
        var dat = {}
        deliveryGuys = e.users;
        for (var iii in e.users) {
            var nm = e.users[iii].name;
            var icn = e.users[iii].icon;
            //var id = e.users[iii].id;
            dat[nm] = icn;

        }
        $('#' + elmID).autocomplete({
            data: dat
        });

    });
}


//Input Initiallization
var sponProds = {}

function sponpProdNamesInput(elmID) {
    var fetchedData = doFetch({
        action: 'getAllProducts',
        data: $('#' + elmID).val(),
        filter: 'sponsored'
    }).then(function (e) {
        var dat = {}
        sponProds = e.products;
        for (var iii in e.products) {
            var nm = e.products[iii].name + " - " + e.products[iii].price;
            var icn = e.products[iii].icon;
            //var id = e.users[iii].id;
            dat[nm] = icn;

        }
        $('#' + elmID).autocomplete({
            data: dat
        });

    });
}

function transferListener() {
    var forEach = function (array, callback, scope) {
        for (var i = 0; i < array.length; i++) {
            callback.call(scope, i, array[i]); // passes back stuff we need
        }
    };
    var myNodeList = document.querySelectorAll('#transfer-shop');
    forEach(myNodeList, function (index, value) {
        value.addEventListener("change", userNamesInput('transfer-shop'));
    });
}


//
function managerListener() {
    var forEach = function (array, callback, scope) {
        for (var i = 0; i < array.length; i++) {
            callback.call(scope, i, array[i]); // passes back stuff we need
        }
    };
    var myNodeList = document.querySelectorAll('#storeManagers');
    forEach(myNodeList, function (index, value) {
        value.addEventListener("change", userNamesInput('storeManagers'));
    });
}
managerListener();



//
function deliveryListener() {
    var forEach = function (array, callback, scope) {
        for (var i = 0; i < array.length; i++) {
            callback.call(scope, i, array[i]); // passes back stuff we need
        }
    };
    var myNodeList = document.querySelectorAll('#delivery-members');
    forEach(myNodeList, function (index, value) {
        value.addEventListener("change", userNamesInput('delivery-members'));
    });
}


//
function sponsoredProdListener() {
    var forEach = function (array, callback, scope) {
        for (var i = 0; i < array.length; i++) {
            callback.call(scope, i, array[i]); // passes back stuff we need
        }
    };
    var myNodeList = document.querySelectorAll('#check-prod-input');
    forEach(myNodeList, function (index, value) {
        value.addEventListener("change", sponpProdNamesInput('check-prod-input'));
    });
}



function persistentFunc() {
    if (navigator.storage && navigator.storage.persist)
        navigator.storage.persisted().then(persistent => {
            if (persistent)
                console.log("Storage will not be cleared except by explicit user action");
            else
                console.log("Storage may be cleared by the UA under storage pressure.");
        });
}
persistentFunc();


//Box Shadow On Specific Pages
$(".pageBoxShadow").click(function () {
    $('.navbar-fixed nav').css({
        'box-shadow': '0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12), 0 3px 1px -2px rgba(0,0,0,0.2)',
    });
});
$(".clickPromo").click(function () {
    $('.navbar-fixed nav').css({
        'box-shadow': 'none',
    });
});


//Sign out
$(".signOut").click(function () {
    localStorage.clear();
    setTimeout(location.reload(), 2000)
});
