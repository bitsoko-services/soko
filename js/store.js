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
        $("#storeNo").text(services.length)
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
        } else if (services.length > 5) {
            $("#addStoreLimit").hide();
        }
        $("#switchStoreContent").html('');
        for (var i = 0, services = services; i < services.length; ++i) {
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
            shroot[i].addEventListener("click", doSwitchStore, false);
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
                allTokenCoins();
                workingHours()
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
            storeOwner();
            loadTheme();
        }
    }).modal('close');
}
//Get Store Location
$("#storeLoc").click(function () {
    myLoc();
    setTimeout(function () {
        var locationField = document.getElementById('newStore-Location').value
        if (locationField == "location not found") {
            console.log("error getting location");
            Materialize.toast('Error getting location. Please try again!', 3000);
        } else {
            doFetch({
                action: 'doEditStore',
                id: localStorage.getItem('soko-active-store'),
                prop: "lonlat",
                val: document.querySelector('#editStore-Location').value
            }).then(function (e) {
                if (e.status == 'ok') {
                    Materialize.toast('Location updated successfully', 3000);
                }
            });

        }
    }, 3000);
});

function doNewStore() {
    var locationField = document.getElementById('newStore-Location').value
    if (!$("#newStore-name").hasClass("valid")) {
        Materialize.toast('Ooops! your store needs a name!', 3000);
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

//Dominant Color
function dominantColor() {
    if (activeStore().theme == "") {
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
        action: 'deleterStore',
        store: storeId
    }).then(function (e) {
        if (e.status == 'ok') {
            $('#editStoreModal').modal('close');
            Materialize.toast('Store deleted successfully', 3000);
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
            Materialize.toast('Error getting location. Please try again!', 3000);
        } else {
            doFetch({
                action: 'doEditStore',
                id: localStorage.getItem('soko-active-store'),
                prop: "lonlat",
                val: document.querySelector('#editStore-Location').value
            }).then(function (e) {
                if (e.status == 'ok') {
                    Materialize.toast('Location updated successfully', 3000);
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
            Materialize.toast('Theme color changed successfully', 3000);
        }
    });
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
        $(".settingsIcon").hide();
    } else {
        $(".settingsIcon").css("display", "block");
        $("#settingsOpt").css("display", "block");
    }
}


// Working Hours
function workingHours() {
    $('.pm').hide();
    $('.AmPm').on('click',
        function () {
            $(this).siblings("p").toggle()
        }
    );

    $(document).on("click", "#wkDayBtn", function () {
        $("#wkDayModal").show();
    });
    $(document).on("click", "#satBtn", function () {
        $("#satModal").show();
    });
    $(document).on("click", "#sunBtn", function () {
        $("#sunModal").show();
    });
    $(document).on("click", ".closeModal", function () {
        $(".modal2").hide();
    });

    $('.counterUp').click(function (event) {
        //        console.log($(this).siblings("input").attr("max"))
        //        console.log(JSON.parse($(this).siblings("input").val()) + 1)
        if ($(this).siblings("input").attr("class") == "hrs") {
            if (JSON.parse($(this).siblings("input").val()) + 1 == 13) {
                $(this).siblings("input").val(0)
            } else {
                event.preventDefault()
                add = $(this).siblings("input")
                add_ = add.val()
                add_ = parseInt(add_) + 1
                add.val(add_)
            }
        } else if ($(this).siblings("input").attr("class") == "min") {
            if (JSON.parse($(this).siblings("input").val()) + 1 == 60) {
                $(this).siblings("input").val(0)
            } else {
                event.preventDefault()
                add = $(this).siblings("input")
                add_ = add.val()
                add_ = parseInt(add_) + 1
                add.val(add_)
            }
        }
    })
    $('.counterDown').click(function (event) {
        if ($(this).siblings("input").attr("class") == "hrs") {
            if (JSON.parse($(this).siblings("input").val()) - 1 == -1) {
                $(this).siblings("input").val(12)
            } else {
                event.preventDefault()
                add = $(this).siblings("input")
                add_ = add.val()
                add_ = parseInt(add_) - 1
                add.val(add_)
            }
        } else if ($(this).siblings("input").attr("class") == "min") {
            if (JSON.parse($(this).siblings("input").val()) - 1 == -1) {
                $(this).siblings("input").val(59)
            } else {
                event.preventDefault()
                add = $(this).siblings("input")
                add_ = add.val()
                add_ = parseInt(add_) - 1
                add.val(add_)
            }
        }
    })
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
    shroot[i].addEventListener("click", switchStore, false);
};
