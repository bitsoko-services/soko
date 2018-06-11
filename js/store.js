//Open Store Settings
$(document).on("click", "#openStoreSet", function () {
    $('.sidenav').sidenav('close');
    $('#content > .container > div').css('display', 'none');
    $('#content > .container > .editStorePage').css('display', 'block');
    $(".activePage").html("Store Settings")
});

$(document).on("click touchstart keypress", "#categoryName", function (event) {
    var k = event ? event.which : window.event.keyCode;
    if (k == 32) return false;
})

function loadPOS() {
    screen.keepAwake = true;

    if (getBitsOpt('pan') == "ent") {
        $('#content > .container > div').css('display', 'none');
        $('#content > .container > .settingsPage').css('display', 'block');
        $(".activePage").html("")

    }
    var stCb = getObjectStore('data', 'readwrite').get('soko-stores');
    stCb.onsuccess = function (event) {
        try {
            var svcs = event.target.result;
            var services = JSON.parse(svcs);
            localStorage.services_test = JSON.stringify(services)
        } catch (err) {
            $('#newStoreModal').modal({
                dismissible: false,
                onOpenEnd: getLoc(),
                onOpenStart: loadCat()
            }).modal('open');
            return;
        }
        $("#storeNo").text(services.length)
        if (services.length == 0) {
            $('#firstStoreModal').modal({
                dismissible: false,
                complete: function () {
                    $('#newStoreModal').modal({
                        dismissible: false,
                        onOpenEnd: getLoc(),
                        onOpenStart: loadCat()
                    }).modal('open');
                }
            });
            $('#firstStoreModal').modal('open');
            return;
        } else if (services.length > 50) {
            $("#addStoreLimit").hide();
        }
        $("#switchStoreContent").html('');

        for (var i = 0, services = services; i < services.length; ++i) {
            localStorage.setItem('soko-store-id-' + services[i].id, JSON.stringify(services[i]));

            var bitsUserName = localStorage.getItem("bits-user-name");
            var sokoOwner = JSON.parse(localStorage.getItem('soko-store-id-' + services[i].id + '')).owner;
            if (bitsUserName != sokoOwner) {
                var notOwned = ' <li class="collection-item avatar" style="" svid="' + services[i].id + '"><img src="' + services[i].bannerPath + '" alt="" class="circle closeSwitchStore" svid="' + services[i].id + '"><div class="row closeSwitchStore" svid="' + services[i].id + '" style="width:75%;float:left;">' + '<p class="collections-title">' + services[i].name + '</strong></p><p class="collections-content">...</p></div>' + '</li>';
                $("#switchStoreContent").append(notOwned);
            } else {
                var owned = ' <li class="collection-item avatar" style="" svid="' + services[i].id + '"><img src="' + services[i].bannerPath + '" alt="" class="circle closeSwitchStore" svid="' + services[i].id + '"><div class="row closeSwitchStore" svid="' + services[i].id + '" style="width:100%;float:left; margin-bottom:0px;">' + '<div class="row"><div class="col s9"><p class="collections-title">' + services[i].name + '</strong></p><p class="collections-content">...</p></div><div class="col s3"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 268.765 268.765" style="margin-top: 15px;enable-background:new 0 0 268.765 268.765;width: 20px;height: 20px;" xml:space="preserve"><g id="Settings"><g><path style="fill-rule:evenodd;clip-rule:evenodd;fill: #5d5b5b;" d="M267.92,119.461c-0.425-3.778-4.83-6.617-8.639-6.617 c-12.315,0-23.243-7.231-27.826-18.414c-4.682-11.454-1.663-24.812,7.515-33.231c2.889-2.641,3.24-7.062,0.817-10.133 c-6.303-8.004-13.467-15.234-21.289-21.5c-3.063-2.458-7.557-2.116-10.213,0.825c-8.01,8.871-22.398,12.168-33.516,7.529 c-11.57-4.867-18.866-16.591-18.152-29.176c0.235-3.953-2.654-7.39-6.595-7.849c-10.038-1.161-20.164-1.197-30.232-0.08 c-3.896,0.43-6.785,3.786-6.654,7.689c0.438,12.461-6.946,23.98-18.401,28.672c-10.985,4.487-25.272,1.218-33.266-7.574 c-2.642-2.896-7.063-3.252-10.141-0.853c-8.054,6.319-15.379,13.555-21.74,21.493c-2.481,3.086-2.116,7.559,0.802,10.214 c9.353,8.47,12.373,21.944,7.514,33.53c-4.639,11.046-16.109,18.165-29.24,18.165c-4.261-0.137-7.296,2.723-7.762,6.597 c-1.182,10.096-1.196,20.383-0.058,30.561c0.422,3.794,4.961,6.608,8.812,6.608c11.702-0.299,22.937,6.946,27.65,18.415 c4.698,11.454,1.678,24.804-7.514,33.23c-2.875,2.641-3.24,7.055-0.817,10.126c6.244,7.953,13.409,15.19,21.259,21.508 c3.079,2.481,7.559,2.131,10.228-0.81c8.04-8.893,22.427-12.184,33.501-7.536c11.599,4.852,18.895,16.575,18.181,29.167 c-0.233,3.955,2.67,7.398,6.595,7.85c5.135,0.599,10.301,0.898,15.481,0.898c4.917,0,9.835-0.27,14.752-0.817 c3.897-0.43,6.784-3.786,6.653-7.696c-0.451-12.454,6.946-23.973,18.386-28.657c11.059-4.517,25.286-1.211,33.281,7.572 c2.657,2.89,7.047,3.239,10.142,0.848c8.039-6.304,15.349-13.534,21.74-21.494c2.48-3.079,2.13-7.559-0.803-10.213 c-9.353-8.47-12.388-21.946-7.529-33.524c4.568-10.899,15.612-18.217,27.491-18.217l1.662,0.043 c3.853,0.313,7.398-2.655,7.865-6.588C269.044,139.917,269.058,129.639,267.92,119.461z M134.595,179.491 c-24.718,0-44.824-20.106-44.824-44.824c0-24.717,20.106-44.824,44.824-44.824c24.717,0,44.823,20.107,44.823,44.824 C179.418,159.385,159.312,179.491,134.595,179.491z" fill="#FFFFFF"></path></g></g></svg></div></div></div>' + '</li>';
                $("#switchStoreContent").append(owned);
            }

            if (getBitsOpt('s') != undefined) {
                localStorage.setItem('soko-active-store', getBitsOpt('s'));

            } else if (localStorage.getItem('soko-active-store')) {
                //use the already set store

            } else {
                localStorage.setItem('soko-active-store', services[0].id);

            }
            // initialisePush('soko-store-id-' + services[i].id);
        }
        var shroot = document.querySelectorAll(".closeSwitchStore");
        for (var i = 0; i < shroot.length; ++i) {
            shroot[i].addEventListener("click", doSwitchStore, false);
        };
        addStore();
    }
    stCb.onerror = function (event) {
        $('#newStoreModal').modal({
            dismissible: false,
            onOpenEnd: getLoc(),
            onOpenStart: loadCat()
        }).modal('open');
    }
    //  appMaster.animateScript();
    //setInterval(noteChecker,30000);
    verifyNo();
    addManagers()
}



function addStore() {
    e = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store')));
    updateMerch(e);
    id = e.id;
    //orderUpdater();
    //productsUpdater();
    refreshPromotions();
    //promoUpdater();
    //beaconsUpdater();
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
    loadProdCategory();
    //promoUpdater();
}

function editStoreCallback() {
    var forEach = function (array, callback, scope) {
        for (var i = 0; i < array.length; i++) {
            callback.call(scope, i, array[i]); // passes back stuff we need
        }
    };
    var myNodeList = document.querySelectorAll('#storeSettings input,#editStoreModal textarea');
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
    $('.sidebar-collapse').sidenav('close');
    setTimeout(function () {
        $('#newStoreModal').modal({
            dismissible: false,
            onOpenEnd: getLoc(),
            onOpenStart: loadCat()
        }).modal('open');
    }, 200);
}

function activeStore() {
    return JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store')));
}

function allTokenCoins() {
    $("#tokenSelect").html("")
    var tokens = allTokens['allTokens'];
    for (var v = 0; v < tokens.length; v++) {
        //        $("#tokenSelect").append('<option value="2">' + tokens[v] + '</option>');
        $("#tokenSelect").append('<option value="" data-icon="https://bitsoko.co.ke/bitsAssets/images/currencies/' + tokens[v] + '.png" class="left circle">' + tokens[v] + '</option>');
    }
    setTimeout(function () {
        $(".tokenSelect").find("li").click(function () {
            var inputVal = $(".tokenSelect input").val();
            selectedToken = Object.keys(tokens).find(key => tokens[key] === inputVal);

            doFetch({
                action: 'doEditStore',
                id: localStorage.getItem('soko-active-store'),
                prop: "token",
                val: selectedToken
            }).then(function (e) {
                if (e.status == 'ok') {} else {}
            });
        });
    }, 5000);
    $('select').material_select();
}

function editStore() {
    $('.sidenav').sidenav("close");;
    setTimeout(function () {
        $('#editStoreModal').modal({
            dismissible: false,
            ready: function () {
                editStoreContent();
                allTokenCoins()
            }
        }).modal('open');
    }, 200);
}

function editStoreContent() {
    editStoreCallback();
    reqLoc();
    //    transferListener();
    var xx = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store')));
    document.querySelector('#editStore-name').value = xx.name;
    document.querySelector('#editStore-description').value = xx.description;
    document.querySelector('#editStore-Phone').value = xx.phone;
    document.querySelector('#colorChosen').value = xx.theme;
    M.updateTextFields();
}

function switchStore() {
    $('.sidenav').sidenav("close");
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
            M.toast({
                html: 'changing store..',
                displayLength: 2000
            })
            beaconsUpdater();
            promoUpdater();
            billingUpdater();
            productsUpdater();
            storeOwner();
            loadTheme();
            verifyNo();
            addManagers()
        }
    }).modal('close');
}

//Verify Phone Number
function userNoPromp() {
    var $justtest = $('<span>Please verify phone number<span style="color:#eeff41;position: absolute; right: 0; margin-right: 20px; font-weight: bold; font-size: 1.2em;" id="verifyPhn">VERIFY</span></span>');

    M.toast({
        html: $justtest,
        classes: "toast",
        displayLength: 10000
    })

    $("#verifyPhn").click(function () {
        $(".toast").remove()
        $('#content > .container > div').css('display', 'none');
        $('#content > .container > .settingsPage').css('display', 'block');
        document.getElementById("editStore-Phone").classList.add("glow");
        setTimeout(function (e) {
            document.getElementById("editStore-Phone").classList.remove("glow");
        }, 4000)
    });
}

function verifyNo() {
    if (localStorage.getItem("soko-owner-id") == localStorage.getItem("bits-user-name")) {
        try {
            var checkPhoneNo = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store') + '')).phone
        } catch (err) {
            console.log(err)
        }
        if (checkPhoneNo == "") {
            userNoPromp()
        } else if (checkPhoneNo == null) {
            userNoPromp()
        }
    }
}

//Get Store Location
$("#storeLoc").click(function () {
    myLoc();
    setTimeout(function () {
        var locationField = document.getElementById('newStore-Location').value
        if (locationField == "location not found") {
            console.log("error getting location");
            M.toast({
                html: 'Error getting location. Please try again!',
                displayLength: 3000
            })
        } else {
            doFetch({
                action: 'doEditStore',
                id: localStorage.getItem('soko-active-store'),
                prop: "lonlat",
                val: locationField
            }).then(function (e) {
                if (e.status == 'ok') {
                    M.toast({
                        html: 'Location updated successfully',
                        displayLength: 3000
                    })
                }
            });

        }
    }, 3000);
});

function doNewStore() {
    var locationField = document.getElementById('newStore-Location').value
    if (!$("#newStore-name").hasClass("valid")) {
        M.toast({
            html: 'Ooops! your store needs a name!',
            displayLength: 3000
        })
        return;
    }
    //    else if (locationField == "location not found") {
    //        Materialize.toast('Ooops! set your store location', 3000);
    //        return;
    //    }
    doFetch({
        action: 'doNewStore',
        ownerid: localStorage.getItem('soko-owner-id'),
        name: document.querySelector('#newStore-name').value,
        desc: document.querySelector('#newStore-description').value,
        category: document.querySelector('.newStoreCatgry input').value,
        loc: document.querySelector('#newStore-Location').value
    }).then(function (e) {
        if (e.status == 'ok') {
            getObjectStore('data', 'readwrite').get('user-profile-' + localStorage.getItem("bits-user-name")).onsuccess = function (event) {
                try {
                    profileLoaded(JSON.parse(event.target.result));
                    $('#newStoreModal').modal({
                        onCloseEnd: function () {
                            M.toast({
                                html: 'Added new store..',
                                displayLength: 3000
                            })
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
                val = canvas.toDataURL("image/png");
                doFetch({
                    action: 'doEditStore',
                    id: localStorage.getItem('soko-active-store'),
                    prop: name,
                    val: val
                }).then(function (e) {
                    if (e.status == 'ok') {
                        //document.querySelector('#prodImg-holda-'+prid).src = val;
                        M.toast({
                            html: 'Modified ' + name + '...',
                            displayLength: 3000
                        })
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
    } else if (name == "buyStoreTokens") {
        //TO-DO
        //move the shop transfer function
    } else if (name == "skip") {
        //Do nothing
    } else if (name == "addProdCategory") {
        M.toast({
            html: 'Adding category. Please wait',
            classes: 'categoryName',
            displayLength: 3000
        })
        doFetch({
            action: 'manageCategories',
            store: localStorage.getItem('soko-active-store'),
            do: "add",
            name: val
        }).then(function (e) {
            if (e.status == 'ok') {
                //document.querySelector('#prodImg-holda-'+prid).src = val;
                M.toast({
                    html: 'Modified ' + name + '...',
                    displayLength: 3000
                })
            } else {
                console.log(e);
            }
        });
    } else {
        doFetch({
            action: 'doEditStore',
            id: localStorage.getItem('soko-active-store'),
            prop: name,
            val: val
        }).then(function (e) {
            if (e.status == 'ok') {
                M.toast({
                    html: 'modified ' + name + '..',
                    displayLength: 3000
                })
            } else {
                console.log(e);
            }
        });
    }
}

//Dominant Color
function dominantColor() {

    try {
        var activeStoreTheme = activeStore().theme
    } catch (err) {
        console.log(err);
        var activeStoreTheme = null
    }
    if (activeStoreTheme == null) {
        var _URL = window.URL || window.webkitURL;
        $("#editStore-image").change(function (e) {
            var image, file;
            if ((file = this.files[0])) {
                image = new Image();
                image.onload = function () {
                    var sourceImage = image;
                    var colorThief = new ColorThief();
                    var color = colorThief.getColor(sourceImage);
                    finalCol = "rgba(" + color + ")"

                    function rgb2hex(rgb) {
                        rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
                        return (rgb && rgb.length === 4) ? "#" +
                            ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
                            ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
                            ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
                    }

                    var hex = rgb2hex(finalCol);
                    doFetch({
                        action: 'doEditStore',
                        id: localStorage.getItem('soko-active-store'),
                        prop: "theme",
                        val: hex
                    }).then(function (e) {
                        if (e.status == 'ok') {} else {
                            console.log(e);
                        }
                    });
                }
            };
            image.src = _URL.createObjectURL(file);
        });
    }
}
dominantColor()

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
var transferShopVal = ""
$(document).on('click', $('ul.autocomplete-content li'), function (e) {
    var value = $('#transfer-shop').val();
    if (value != '') {
        var selectedId = value;
        console.log(selectedId)
        for (var i in deliveryGuys) {
            var name = deliveryGuys[i].name;
            var id = deliveryGuys[i].id;
            if (selectedId == name) {
                transferShopVal = id;
                $("#transferShopModal").show();
                $("#transferName").html(name);
            }
        }
    }
});
$('#transferYesBtn').on('click', function (event) {
    $('#transfer-shop').val("");
    $("#transferShopModal").hide();
    doFetch({
        action: 'transferStore',
        store: localStorage.getItem('soko-active-store'),
        data: transferShopVal
    }).then(function (e) {
        if (e.status == 'ok') {
            location.reload();
        } else {}
    });
});
$('#transferNoBtn').on('click', function (event) {
    $('#transfer-shop').val("");
    $("#transferShopModal").hide();
});

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
        action: 'deleteStore',
        store: storeId
    }).then(function (e) {
        if (e.status == 'ok') {
            $('#editStoreModal').modal('close');
            M.toast({
                html: 'Store deleted successfully',
                displayLength: 3000
            });
            location.reload()
        } else {
            M.toast({
                html: 'Error! Please try again later',
                displayLength: 3000
            });
        }
    });
})

//update location
$("#updateLoc").click(function () {
    myLoc();
    setTimeout(function () {
        var locationField = document.getElementById('editStore-Location').value
        if (locationField == "location not found") {
            console.log("error getting location");
            M.toast({
                html: 'Error getting location. Please try again!',
                displayLength: 3000
            })
        } else {
            doFetch({
                action: 'doEditStore',
                id: localStorage.getItem('soko-active-store'),
                prop: "lonlat",
                val: document.querySelector('#editStore-Location').value
            }).then(function (e) {
                if (e.status == 'ok') {
                    M.toast({
                        html: 'Location updated successfully',
                        displayLength: 3000
                    })
                }
            });

        }
    }, 3000);
});

//update theme color
$("#themeUpdate").click(function () {
    doFetch({
        action: 'doEditStore',
        id: localStorage.getItem('soko-active-store'),
        prop: "theme",
        val: document.querySelector('#colorChosen').value
    }).then(function (e) {
        if (e.status == 'ok') {
            M.toast({
                html: 'Theme color changed successfully',
                displayLength: 3000
            })
        }
    });
});

//Open New Store Modal
$(document).on("click", "#addStoreLimit", function () {
    $('#newStoreModal').modal({
        dismissible: false,
        onOpenEnd: getLoc(),
        onOpenStart: loadCat()
    }).modal('open');
});
//Close New Store Modal
$(document).on("click", "#closeNewStoreModal", function () {
    $("#newStoreModal").modal("close")
});

//Hide Settings If Owner Do Not Much
function storeOwner() {
    var bitsUserName = localStorage.getItem("bits-user-name");
    var sokoOwner = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).owner;
    if (bitsUserName != sokoOwner) {
        $("#checkStoreOwner").css('display', 'block')
        $("#storeSettings").css("display", "none");

    } else {
        $("#storeSettings").css('display', 'block')
        $("#checkStoreOwner").css('display', 'none')
    }
}

//Share
function shareStore() {
    var storeName = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).name
    if (navigator.share) {
        navigator.share({
                title: 'Bitsoko',
                text: storeName,
                url: 'https://bitsoko.co.ke/bits/?s=' + localStorage.getItem('soko-active-store') + '',
            })
            .then(() => console.log('Successful share'))
            .catch((error) => console.log('Error sharing', error));
    }
}


//Save Working Hours
$('.workingHrs input').change(function () {
    var workingHrs = $(this).attr("id");
    var workingHrsVal = $(this).val();

    if (workingHrs == "mon-fri") {
        doFetch({
            action: 'WorkingHours',
            id: localStorage.getItem('soko-active-store'),
            prop: "weekDay",
            val: workingHrsVal
        }).then(function (e) {
            if (e.status == 'ok') {
                M.toast({
                    html: 'Working hours set successfully.',
                    displayLength: 3000
                })
            } else {
                M.toast({
                    html: 'Error!!! Please try again later.',
                    displayLength: 3000
                })
            }
        });
    } else if (workingHrs == "wkndSat") {
        doFetch({
            action: 'WorkingHours',
            id: localStorage.getItem('soko-active-store'),
            prop: "saturday",
            val: workingHrsVal
        }).then(function (e) {
            if (e.status == 'ok') {
                M.toast({
                    html: 'Working hours set successfully.',
                    displayLength: 3000
                })
            } else {
                M.toast({
                    html: 'Error!!! Please try again later.',
                    displayLength: 3000
                })
            }
        });
    } else {
        doFetch({
            action: 'WorkingHours',
            id: localStorage.getItem('soko-active-store'),
            prop: "sunday",
            val: workingHrsVal
        }).then(function (e) {
            if (e.status == 'ok') {
                M.toast({
                    html: 'Working hours set successfully.',
                    displayLength: 3000
                })
            } else {
                M.toast({
                    html: 'Error!!! Please try again later.',
                    displayLength: 3000
                })
            }
        });
    }
});



var shroot = document.querySelectorAll(".newStore");
for (var i = 0; i < shroot.length; ++i) {
    shroot[i].addEventListener("touchstart", newStore, false);
};
var shroot = document.querySelectorAll(".editStore");
for (var i = 0; i < shroot.length; ++i) {
    shroot[i].addEventListener("touchstart", editStore, false);
};
//var shroot = document.querySelectorAll(".doAddNewStore");
//for (var i = 0; i < shroot.length; ++i) {
//    shroot[i].addEventListener("touchstart", doNewStore, false);
//};
var shroot = document.querySelectorAll(".switchStore");
for (var i = 0; i < shroot.length; ++i) {
    shroot[i].addEventListener("click", switchStore, false);
};
