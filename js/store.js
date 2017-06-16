function loadPOS() {
    screen.keepAwake = true;
    var stCb = getObjectStore('data', 'readwrite').get('soko-stores');
    stCb.onsuccess = function (event) {
        try {
            var svcs = event.target.result;
            var services = JSON.parse(svcs);
            localStorage.services_test = JSON.stringify(services)
        } catch (err) {
            $('#newStoreModal').modal({
                dismissible: false
            });
            $('#newStoreModal').modal('open');
            return;
        }
        if (services.length == 0) {
            $('#firstStoreModal').modal({
                dismissible: false,
                complete: function () {
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
            var html = ' <li class="collection-item avatar" style="" svid="' + services[i].id + '"><img src="' + services[i].bannerPath + '" alt="" class="circle closeSwitchStore" svid="' + services[i].id + '"><div class="row closeSwitchStore" svid="' + services[i].id + '" style="width:50%;float:left;">' + '<p class="collections-title">' + services[i].name + '</strong></p><p class="collections-content">...</p></div>' + '</li>';
            $("#switchStoreContent").append(html);
            localStorage.setItem('soko-store-id-' + services[i].id, JSON.stringify(services[i]));

            if (getBitsOpt('s') == undefined) {
                localStorage.setItem('soko-active-store', services[0].id);

            } else {
                localStorage.setItem('soko-active-store', getBitsOpt('s'));

            }
            // initialisePush('soko-store-id-' + services[i].id);
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

function addStore() {
    e = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store')));
    updateMerch(e);
    id = e.id;
    orderUpdater();
    productsUpdater();
    promoUpdater();
    beaconsUpdater();
    refreshCustomers();
    //refreshBills();
    doFetch({
        action: 'getServiceTrans',
        id: id
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
        } else {
            noSalesUpdater();
        }
        //       addTransaction(e.transactions);
    }).catch(function (err) {
        salesUpdater();
    }); //addCustomer(e.customers);
    doFetch({
        action: 'getServiceReqs',
        id: id
    }).then(function (e) {
        getObjectStore('data', 'readwrite').put(JSON.stringify(e.reqs), 'bitsoko-merchant-requests-' + id);
    });

    refreshSalesOrders();
    refreshBeacons();
    refreshProducts();
    refreshPromotions();
    promoUpdater();
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


function editPromoCallback() {
    var forEach = function (array, callback, scope) {
        for (var i = 0; i < array.length; i++) {
            callback.call(scope, i, array[i]); // passes back stuff we need
        }
    };
    var myNodeList = document.querySelectorAll('.p-card input,.p-card textarea');
    forEach(myNodeList, function (index, value) {
        value.addEventListener("change", updateProm);
    });
}

function newStore() {
    $('.sidebar-collapse').sideNav('hide');
    setTimeout(function () {
        $('#newStoreModal').modal({
            dismissible: false,
            ready: function () {
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
            dismissible: false,
            ready: function () {
                editStoreCallback();
                reqLoc();
                transferListener();
                var xx = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store')));
                document.querySelector('#editStoreModal #editStore-name').value = xx.name;
                document.querySelector('#editStoreModal #editStore-description').value = xx.description;
                document.querySelector('#editStoreModal #editStore-Phone').value = xx.phone;
                document.querySelector('#editStoreModal #colorChosen').value = xx.theme;
                Materialize.updateTextFields();
            }
        }).modal('open');
    }, 200);
}

function switchStore() {
    $('.sidebar-collapse').sideNav('hide');
    setTimeout(function () {
        $('#switchStoreModal').modal({
            ready: function () {}
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
            beaconsUpdater();
            promoUpdater();
            billingUpdater();
            productsUpdater();
        }
    }).modal('close');
}

function doNewStore() {
    if (!$("#newStore-name").hasClass("valid")) {
        Materialize.toast('Ooops! your store needs a name!', 3000);
        return;
    }
    doFetch({
        action: 'doNewStore',
        ownerid: localStorage.getItem('soko-owner-id'),
        name: document.querySelector('#newStore-name').value,
        desc: document.querySelector('#newStore-description').value,
        loc: document.querySelector('#newStore-Location').value
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
                } catch (err) {
                    console.log('no user profile found : ', err);
                }
            }
        } else {
            console.log(e);
        }
    });
}

function updateProm(t) {
    console.log($(t.target));
    var name = $(t.target).attr('pritm');
    var val = $(t.target).val();
    doFetch({
        action: 'doEditPromo',
        id: $(t.target).parents('form[class^="col"]').attr('fid'),
        prop: name,
        val: val
    }).then(function (e) {
        if (e.status == 'ok') {
            Materialize.toast('modified ' + name + '..', 3000);
        } else {

            Materialize.toast('please try again..', 2000);
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
                    action: 'doEditStore',
                    id: localStorage.getItem('soko-active-store'),
                    prop: name,
                    val: val
                }).then(function (e) {
                    if (e.status == 'ok') {
                        //document.querySelector('#prodImg-holda-'+prid).src = val;
                        Materialize.toast('modified ' + name + '..', 3000);
                    } else {
                        console.log(e);
                    }
                });
            };
            img.src = URL.createObjectURL(file);
        }
    } else if (name == "notifyDays") {
        var dayData = JSON.stringify({
            mon: document.getElementsByClassName("notifyDays-mon")[0].checked,
            tue: document.getElementsByClassName("notifyDays-tue")[0].checked,
            wed: document.getElementsByClassName("notifyDays-wed")[0].checked,
            thur: document.getElementsByClassName("notifyDays-thur")[0].checked,
            fri: document.getElementsByClassName("notifyDays-fri")[0].checked,
            sat: document.getElementsByClassName("notifyDays-sat")[0].checked,
            sun: document.getElementsByClassName("notifyDays-sun")[0].checked
        })
        doFetch({
            action: 'doEditStore',
            id: localStorage.getItem('soko-active-store'),
            prop: name,
            val: dayData
        }).then(function (e) {});
    } else if (name == "shopTransfer") {
        //TO-DO
        //move the shop transfer function
    } else {
        doFetch({
            action: 'doEditStore',
            id: localStorage.getItem('soko-active-store'),
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

//Edit Store On Window Size
$(document).ready(function () {
    if ($(window).width() > 992) {
        $('.editStore').click(function () {
            $("#editStoreModal").modal('open');
        })
    }
})
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

/*
//switch store desktop version
$("#collection_dskt").html('');
screen.keepAwake = true;
var stCb = getObjectStore('data', 'readwrite').get('soko-stores');
stCb.onsuccess = function (event) {
    try {
        var svcs = event.target.result;
        var services = JSON.parse(svcs);
        localStorage.services_test = JSON.stringify(services)
    } catch (err) {
        console.log(err);
    }
    $("#collection_dskt").html('');
    console.log(services);

    for (var i = 0; i < services.length; ++i) {
        var html = ' <li style="cursor:pointer" class="collection-item avatar closeSwitchStore" style="" svid="' + services[i].id + '"><img src="' + services[i].bannerPath + '" alt="" class="circle"><div class="row">' + '<p class="collections-title">' + services[i].name + '</strong></p><p class="collections-content">...</p></div>' + '</li>';
        $("#collection_dskt").append(html);
        localStorage.setItem('soko-store-id-' + services[i].id, JSON.stringify(services[i]));
        localStorage.setItem('soko-active-store', services[0].id);
    }
    var shroot = document.querySelectorAll(".closeSwitchStore");
    for (var i = 0; i < shroot.length; ++i) {
        shroot[i].addEventListener("click", doSwitchStore, false);
    };
    addStore();
}
*/

//Shop Transfer
$('document').ready(function () {
    $('body').on('click', $('#transfer-shop ul.autocomplete-content li'), function () {
        var value = $('#transfer-shop').val();
        if (value != '') {
            var transferStore = $('#transfer-shop').val()
            doFetch({
                action: 'transferStore',
                store: localStorage.getItem('soko-active-store'),
                data: transferStore
            }).then(function (e) {
                if (e.status == 'ok') {} else {}
            });
        }
    });
});

//function storeTheme() {
//    var initialTheme = $('#colorChosen').val();
//    $(".selectedColor").css("background-color", initialTheme);
//    $(".opacitySelectedColor").css({
//        'background-color': initialTheme,
//        'filter': 'brightness(1.3)'
//    })
//}
//storeTheme();

//Notification Days If Checked
$(".editStore").click(function () {
    function notifyCheckbox() {
        try {
            var ifChecked = JSON.parse(JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).notifyDays);
            if (ifChecked.mon == true) {
                document.getElementById("mon").checked = true;
            }
        } catch (err) {
            var nullChecked = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).notifyDays;
            if (nullChecked == "") {
                document.getElementById("mon").checked = false;
            }
        }
        try {
            var ifChecked = JSON.parse(JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).notifyDays);
            if (ifChecked.tue == true) {
                document.getElementById("tue").checked = true;
            }
        } catch (err) {
            var nullChecked = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).notifyDays;
            if (nullChecked == "") {
                document.getElementById("tue").checked = false;
            }
        }
        try {
            var ifChecked = JSON.parse(JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).notifyDays);
            if (ifChecked.wed == true) {
                document.getElementById("wed").checked = true;
            }
        } catch (err) {
            var nullChecked = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).notifyDays;
            if (nullChecked == "") {
                document.getElementById("wed").checked = false;
            }
        }
        try {
            var ifChecked = JSON.parse(JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).notifyDays);
            if (ifChecked.thur == true) {
                document.getElementById("thur").checked = true;
            }
        } catch (err) {
            var nullChecked = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).notifyDays;
            if (nullChecked == "") {
                document.getElementById("thur").checked = false;
            }
        }
        try {
            var ifChecked = JSON.parse(JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).notifyDays);
            if (ifChecked.fri == true) {
                document.getElementById("fri").checked = true;
            }
        } catch (err) {
            var nullChecked = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).notifyDays;
            if (nullChecked == "") {
                document.getElementById("fri").checked = false;
            }
        }
        try {
            var ifChecked = JSON.parse(JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).notifyDays);
            if (ifChecked.sat == true) {
                document.getElementById("sat").checked = true;
            }
        } catch (err) {
            var nullChecked = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).notifyDays;
            if (nullChecked == "") {
                document.getElementById("sat").checked = false;
            }
        }
        try {
            var ifChecked = JSON.parse(JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).notifyDays);
            if (ifChecked.sun == true) {
                document.getElementById("sun").checked = true;
            }
        } catch (err) {
            var nullChecked = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).notifyDays;
            if (nullChecked == "") {
                document.getElementById("sun").checked = false;
            }
        }
    }
    notifyCheckbox()
});

//Delete Store
$(".deleteStore").click(function () {
    storeId = localStorage.getItem('soko-active-store');
    doFetch({
        action: 'deleterStore',
        store: storeId
    }).then(function (e) {
        if (e.status == 'ok') {
            $('#editStoreModal').modal('close');
            Materialize.toast('Store deleted successfully', 3000);
        }
    });
})


//Hide Settings If Owner Do Not Much
var bitsUserName = localStorage.getItem("bits-user-name");
var sokoOwner = localStorage.getItem("soko-owner-id");
if (bitsUserName != sokoOwner) {
    $(".settingsIcon").hide();
}

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
var shroot = document.querySelectorAll(".switchStore");
for (var i = 0; i < shroot.length; ++i) {
    shroot[i].addEventListener("touchstart", switchStore, false);
    shroot[i].addEventListener("click", switchStore, false);
};
