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

// Play oscillators at certain frequency and for a certain time
var playNote = function (frequency, startTime, duration) {
    var osc1 = context.createOscillator(),
        osc2 = context.createOscillator(),
        volume = context.createGain();
 
    // Set oscillator wave type
    osc1.type = 'triangle';
    osc2.type = 'triangle';
 
    volume.gain.value = 0.1;    
 
    // Set up node routing
    osc1.connect(volume);
    osc2.connect(volume);
    volume.connect(context.destination);
 
    // Detune oscillators for chorus effect
    osc1.frequency.value = frequency + 1;
    osc2.frequency.value = frequency - 2;
 
    // Fade out
    volume.gain.setValueAtTime(0.1, startTime + duration - 0.05);
    volume.gain.linearRampToValueAtTime(0, startTime + duration);
 
    // Start oscillators
    osc1.start(startTime);
    osc2.start(startTime);
 
    // Stop oscillators
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
};

var playPendingOrders = function () {
    // Play a 'B' now that lasts for 0.116 seconds
    playNote(493.883, context.currentTime, 0.116);
 
    // Play an 'E' just as the previous note finishes, that lasts for 0.232 seconds
    playNote(659.255, context.currentTime + 0.116, 0.232);
};


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
            loadTheme();
        } else {
            console.log('Error: unable to load merchant info');
        }
    });
    //    walletFunctions(localStorage.getItem("bits-user-name")).then(function (e) {
    //    })
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
                        dismissible: false,
                        onOpenStart: loadCat()
                    }).modal('open');
                }
            });
            $('#firstStoreModal').modal('open');
        }
        //Load Ent Settings Info
        var stringifiedEntInfo = JSON.stringify(e.settings.entSettings);
        console.log(JSON.parse(stringifiedEntInfo))

        //Check if shop is enterprised
        var enterprised = stringifiedEntInfo.enterprised

        if (enterprised != true) {
            $('.entSettingsContainer').css('display', 'none')
        }
        if (enterprised == true) {
            $('.entApplication').css('display', 'none')
        }

        $("#entAboutBody").val(JSON.parse(stringifiedEntInfo).entAboutBody)
        $("#entAboutHeader").val(JSON.parse(stringifiedEntInfo).entAboutTitle)
        if (JSON.parse(stringifiedEntInfo).showManagers == 1) {
            $("#showHideMngr").prop("checked", true)
        }
        if (JSON.parse(stringifiedEntInfo).showTokens == 1) {
            $("#tkSaleSet").prop("checked", true)
        }
        var parsedEntInfo = JSON.parse(stringifiedEntInfo);
        try {
            var serviceOne = JSON.parse(parsedEntInfo.entIconList)
        } catch (err) {

            var serviceOne = [];
        }
        try {
            var serviceTwo = JSON.parse(parsedEntInfo.entImageList)

        } catch (err) {
            var serviceTwo = [];
        }

        //Append Service One
        $(".entServiceOne").html('');
        for (var i = 0; i < serviceOne.length; ++i) {
            var servOne = serviceOne[i]
            $(".entServiceOne").append('<div class="row entServicesCardOne entServiceOneCards" count="' + i + '"> <form getVal="' + servOne.icon + '"  action="#"> <div class="file-field input-field" style="position: relative; background: url(' + servOne.icon + ');background-size: contain; background-repeat: no-repeat; background-position: 50% 50%;"> <div style="text-align: center"> <span> <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512; width: 50px;margin: 15px;" xml:space="preserve"> <path d="M479.5,113.5h-66v-9.775c0-10.12-5.534-19.397-14.441-24.209C367.564,62.496,331.928,53.5,296,53.5 c-35.928,0-71.564,8.996-103.059,26.015c-8.907,4.813-14.441,14.09-14.441,24.21v9.775h-45V106c0-12.407-10.094-22.5-22.5-22.5H51 c-12.406,0-22.5,10.093-22.5,22.5v7.755C12.461,115.734,0,129.435,0,146c0,9.723,0,238.057,0,250c0,17.92,14.579,32.5,32.5,32.5 h161.759c30.324,19.63,65.449,30,101.741,30s71.417-10.37,101.741-30H479.5c17.921,0,32.5-14.58,32.5-32.5 c0-10.01,0-204.959,0-215v-35C512,128.08,497.421,113.5,479.5,113.5z M193.5,103.725c0-4.603,2.519-8.823,6.572-11.013 C229.383,76.872,262.555,68.5,296,68.5s66.617,8.372,95.928,24.212c4.054,2.19,6.572,6.41,6.572,11.013v10.27 C368.004,94.044,332.596,83.5,296,83.5c-36.292,0-71.418,10.37-101.742,30H193.5V103.725z M43.5,106c0-4.136,3.364-7.5,7.5-7.5h60 c4.136,0,7.5,3.364,7.5,7.5v7.5h-75V106z M32.5,413.5c-9.649,0-17.5-7.851-17.5-17.5c0-11.69,0-240.272,0-250 c0-9.649,7.851-17.5,17.5-17.5h141.69c-15.038,12.883-28.058,28.133-38.355,45H37c-4.143,0-7.5,3.358-7.5,7.5 c0,4.142,3.357,7.5,7.5,7.5h90.599C115.077,214.056,108.5,242.323,108.5,271s6.577,56.945,19.099,82.5H37 c-4.143,0-7.5,3.358-7.5,7.5c0,4.142,3.357,7.5,7.5,7.5h98.834c10.298,16.867,23.319,32.116,38.356,45H32.5z M391.361,414.755 c-0.011,0.007-0.022,0.014-0.033,0.021c-0.004,0.003-0.008,0.005-0.012,0.008C363.038,433.57,330.08,443.5,296,443.5 c-34.08,0-67.038-9.93-95.316-28.716c-0.004-0.003-0.008-0.005-0.012-0.008c-0.011-0.007-0.022-0.014-0.033-0.021 c-22.1-14.691-40.793-34.578-54.06-57.509C131.48,331.146,123.5,301.323,123.5,271c0-30.322,7.98-60.146,23.079-86.245 c13.266-22.932,31.959-42.818,54.06-57.51c0.011-0.007,0.022-0.014,0.033-0.021c0.004-0.003,0.008-0.005,0.012-0.008 C228.962,108.43,261.92,98.5,296,98.5c34.098,0,67.073,9.94,95.361,28.746c22.101,14.691,40.794,34.578,54.06,57.51 C460.52,210.854,468.5,240.678,468.5,271c0,30.323-7.98,60.146-23.079,86.245C432.154,380.177,413.461,400.063,391.361,414.755z M497,173.5h-13.087c-4.143,0-7.5,3.358-7.5,7.5c0,4.142,3.357,7.5,7.5,7.5H497v165h-13.087c-4.143,0-7.5,3.358-7.5,7.5 c0,4.142,3.357,7.5,7.5,7.5H497V396c0,9.649-7.851,17.5-17.5,17.5h-61.691c16.144-13.831,29.975-30.384,40.596-48.744 C474.822,336.377,483.5,303.957,483.5,271c0-32.957-8.678-65.376-25.095-93.755c-10.621-18.36-24.451-34.913-40.595-48.745h61.69 c9.649,0,17.5,7.851,17.5,17.5V173.5z"></path> <path d="M296,143.5c-70.304,0-127.5,57.196-127.5,127.5S225.696,398.5,296,398.5S423.5,341.304,423.5,271S366.304,143.5,296,143.5 z M296,383.5c-62.032,0-112.5-50.467-112.5-112.5S233.968,158.5,296,158.5S408.5,208.967,408.5,271S358.032,383.5,296,383.5z"></path> <path d="M296,113.5c-36.205,0-71.588,12.645-99.63,35.605c-3.205,2.625-3.676,7.35-1.052,10.555 c2.624,3.205,7.35,3.674,10.554,1.051C231.242,139.939,263.25,128.5,296,128.5c78.575,0,142.5,63.925,142.5,142.5 c0,32.75-11.439,64.758-32.211,90.127c-2.624,3.205-2.153,7.93,1.052,10.555c3.201,2.621,7.927,2.156,10.554-1.052 c22.96-28.043,35.605-63.425,35.605-99.63C453.5,184.154,382.846,113.5,296,113.5z"></path> <path d="M396.682,382.34c-2.625-3.206-7.352-3.675-10.554-1.052C360.758,402.061,328.75,413.5,296,413.5 c-78.575,0-142.5-63.925-142.5-142.5c0-32.75,11.439-64.758,32.211-90.127c2.624-3.205,2.153-7.93-1.052-10.555 c-3.204-2.624-7.93-2.154-10.554,1.052C151.145,199.413,138.5,234.795,138.5,271c0,86.846,70.654,157.5,157.5,157.5 c36.205,0,71.588-12.645,99.63-35.605C398.835,390.27,399.306,385.545,396.682,382.34z"></path> </svg> </span> <input type="file" id="serviceImage" class="serviceImage serviceSection serviceImageOne" entinpt="serviceImage"> </div><div class="file-path-wrapper" style="display:none;"> <input class="file-path validate" type="text" entinpt="serviceImageNoN"> </div><div style="position: absolute; bottom: 0px; background: #353333b8; width: 100%; text-align: center; color: white;">Change Image</div></div></form> <form getVal="' + servOne.title + '"  class="col s12"> <div class="row"> <div class="input-field col s12"> <input type="text" class="validate serviceHeader serviceSection serviceHeaderOne" entinpt="skipInput" value="' + servOne.title + '"> <label for="email">Service Header</label> </div></div></form> <form getVal="' + servOne.body + '"  class="col s12"> <div class="row"> <div class="input-field col s12"> <input type="text" class="validate serviceBody serviceSection serviceBodyOne" entinpt="skipInput" value="' + servOne.body + '"> <label for="email">Service Body</label> </div></form> </div><div class="row" style="text-align: center; padding-bottom: 10px;"> <button class="btn opacitySelectedColor deleteServiceOne" style="margin-right: 25px; background: rgb(35, 31, 31); filter: brightness(1.3);"> delete </button> <button class="btn opacitySelectedColor saveServiceOne" style="padding: 0px 25px; background: rgb(35, 31, 31); filter: brightness(1.3);">Save</button> </div></div>')
        }

        if (serviceOne.length == 0) {
            $(".entServiceOne").html('nothing found :-(');
        }

        //Append Service Two
        $(".entServiceTwo").html('')
        for (var i = 0; i < serviceTwo.length; ++i) {
            var servTwo = serviceTwo[i]
            $(".entServiceTwo").append('<div class="row entServicesCardTwo entServiceTwoCards"> <form getVal="' + servTwo.icon + '"  action="#"> <div class="file-field input-field" style="position: relative; background: url(' + servTwo.icon + ');background-size: contain; background-repeat: no-repeat; background-position: 50% 50%;"> <div style="text-align: center"> <span> <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512; width: 50px;margin: 15px;" xml:space="preserve"> <path d="M479.5,113.5h-66v-9.775c0-10.12-5.534-19.397-14.441-24.209C367.564,62.496,331.928,53.5,296,53.5 c-35.928,0-71.564,8.996-103.059,26.015c-8.907,4.813-14.441,14.09-14.441,24.21v9.775h-45V106c0-12.407-10.094-22.5-22.5-22.5H51 c-12.406,0-22.5,10.093-22.5,22.5v7.755C12.461,115.734,0,129.435,0,146c0,9.723,0,238.057,0,250c0,17.92,14.579,32.5,32.5,32.5 h161.759c30.324,19.63,65.449,30,101.741,30s71.417-10.37,101.741-30H479.5c17.921,0,32.5-14.58,32.5-32.5 c0-10.01,0-204.959,0-215v-35C512,128.08,497.421,113.5,479.5,113.5z M193.5,103.725c0-4.603,2.519-8.823,6.572-11.013 C229.383,76.872,262.555,68.5,296,68.5s66.617,8.372,95.928,24.212c4.054,2.19,6.572,6.41,6.572,11.013v10.27 C368.004,94.044,332.596,83.5,296,83.5c-36.292,0-71.418,10.37-101.742,30H193.5V103.725z M43.5,106c0-4.136,3.364-7.5,7.5-7.5h60 c4.136,0,7.5,3.364,7.5,7.5v7.5h-75V106z M32.5,413.5c-9.649,0-17.5-7.851-17.5-17.5c0-11.69,0-240.272,0-250 c0-9.649,7.851-17.5,17.5-17.5h141.69c-15.038,12.883-28.058,28.133-38.355,45H37c-4.143,0-7.5,3.358-7.5,7.5 c0,4.142,3.357,7.5,7.5,7.5h90.599C115.077,214.056,108.5,242.323,108.5,271s6.577,56.945,19.099,82.5H37 c-4.143,0-7.5,3.358-7.5,7.5c0,4.142,3.357,7.5,7.5,7.5h98.834c10.298,16.867,23.319,32.116,38.356,45H32.5z M391.361,414.755 c-0.011,0.007-0.022,0.014-0.033,0.021c-0.004,0.003-0.008,0.005-0.012,0.008C363.038,433.57,330.08,443.5,296,443.5 c-34.08,0-67.038-9.93-95.316-28.716c-0.004-0.003-0.008-0.005-0.012-0.008c-0.011-0.007-0.022-0.014-0.033-0.021 c-22.1-14.691-40.793-34.578-54.06-57.509C131.48,331.146,123.5,301.323,123.5,271c0-30.322,7.98-60.146,23.079-86.245 c13.266-22.932,31.959-42.818,54.06-57.51c0.011-0.007,0.022-0.014,0.033-0.021c0.004-0.003,0.008-0.005,0.012-0.008 C228.962,108.43,261.92,98.5,296,98.5c34.098,0,67.073,9.94,95.361,28.746c22.101,14.691,40.794,34.578,54.06,57.51 C460.52,210.854,468.5,240.678,468.5,271c0,30.323-7.98,60.146-23.079,86.245C432.154,380.177,413.461,400.063,391.361,414.755z M497,173.5h-13.087c-4.143,0-7.5,3.358-7.5,7.5c0,4.142,3.357,7.5,7.5,7.5H497v165h-13.087c-4.143,0-7.5,3.358-7.5,7.5 c0,4.142,3.357,7.5,7.5,7.5H497V396c0,9.649-7.851,17.5-17.5,17.5h-61.691c16.144-13.831,29.975-30.384,40.596-48.744 C474.822,336.377,483.5,303.957,483.5,271c0-32.957-8.678-65.376-25.095-93.755c-10.621-18.36-24.451-34.913-40.595-48.745h61.69 c9.649,0,17.5,7.851,17.5,17.5V173.5z"></path> <path d="M296,143.5c-70.304,0-127.5,57.196-127.5,127.5S225.696,398.5,296,398.5S423.5,341.304,423.5,271S366.304,143.5,296,143.5 z M296,383.5c-62.032,0-112.5-50.467-112.5-112.5S233.968,158.5,296,158.5S408.5,208.967,408.5,271S358.032,383.5,296,383.5z"></path> <path d="M296,113.5c-36.205,0-71.588,12.645-99.63,35.605c-3.205,2.625-3.676,7.35-1.052,10.555 c2.624,3.205,7.35,3.674,10.554,1.051C231.242,139.939,263.25,128.5,296,128.5c78.575,0,142.5,63.925,142.5,142.5 c0,32.75-11.439,64.758-32.211,90.127c-2.624,3.205-2.153,7.93,1.052,10.555c3.201,2.621,7.927,2.156,10.554-1.052 c22.96-28.043,35.605-63.425,35.605-99.63C453.5,184.154,382.846,113.5,296,113.5z"></path> <path d="M396.682,382.34c-2.625-3.206-7.352-3.675-10.554-1.052C360.758,402.061,328.75,413.5,296,413.5 c-78.575,0-142.5-63.925-142.5-142.5c0-32.75,11.439-64.758,32.211-90.127c2.624-3.205,2.153-7.93-1.052-10.555 c-3.204-2.624-7.93-2.154-10.554,1.052C151.145,199.413,138.5,234.795,138.5,271c0,86.846,70.654,157.5,157.5,157.5 c36.205,0,71.588-12.645,99.63-35.605C398.835,390.27,399.306,385.545,396.682,382.34z"></path> </svg> </span> <input type="file" id="serviceImage" class="serviceImage serviceSection serviceImageTwo" entinpt="serviceImage"> </div><div class="file-path-wrapper" style="display:none;"> <input class="file-path validate" type="text" entinpt="serviceImageNoN"> </div><div style="position: absolute; bottom: 0px; background: #353333b8; width: 100%; text-align: center; color: white;">Change Image</div></div></form> <form getVal="' + servTwo.title + '"  class="col s12"> <div class="row"> <div class="input-field col s12"> <input type="text" class="validate serviceHeader serviceSection serviceHeaderTwo" entinpt="skipInput" value="' + servTwo.title + '"> <label for="email">Service Header</label> </div></div></form> <form getVal="' + servTwo.body + '"  class="col s12"> <div class="row"> <div class="input-field col s12"> <input type="text" class="validate serviceBody serviceSection serviceBodyTwo" entinpt="skipInput" value="' + servTwo.body + '"> <label for="email">Service Body</label> </div></form> </div><div class="row" style="text-align: center; padding-bottom: 10px;"> <button class="btn opacitySelectedColor deleteServiceTwo" style="margin-right: 25px; background: rgb(35, 31, 31); filter: brightness(1.3);"> delete </button> <button class="btn opacitySelectedColor saveServiceTwo" style="padding: 0px 25px; background: rgb(35, 31, 31); filter: brightness(1.3);">Save</button> </div></div>')
        }

        if (serviceTwo.length == 0) {
            $(".entServiceTwo").html('nothing found :-(');
        }
    }).catch(function (err) {
        loadPOS();
    });
    userNamesInput();
    loadWalletBal();
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
    if (s.credit == "") {
        $('.loadStoreBal').html("0");
    } else {
        fetchRates().then(function (e) {
            if (e.status == "ok") {
                console.log((baseX * allTokens["0xb72627650f1149ea5e54834b2f468e5d430e67bf"].rate))
            }
        });
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

function userNamesInput() {
    var inputVal = $("#transfer-shop,#delivery-members,#storeManagers").val();
    var fetchedData = doFetch({
        action: 'getAllUsers',
        data: inputVal
    }).then(function (e) {
        var dat = {}
        deliveryGuys = e.users;
        for (var iii in e.users) {
            var nm = e.users[iii].name;
            var icn = e.users[iii].icon;
            //var id = e.users[iii].id;
            dat[nm] = icn;

        }
        $("#transfer-shop").autocomplete({
            data: dat
        });
        $("#storeManagers").autocomplete({
            data: dat
        });
        $("#delivery-members").autocomplete({
            data: dat
        });
    });
}


//Input Initiallization
var sponProds = {}

function sponpProdNamesInput() {
    var inputVal = $("#check-prod-input").val();
    var fetchedData = doFetch({
        action: 'getAllProducts',
        data: inputVal,
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
        $("#check-prod-input").autocomplete({
            data: dat
        });

    });
}
sponpProdNamesInput()

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

//Select wallet
$(document).on("click", ".selectedWallet", function (e) {
    $(this).html('<div class="preloader-wrapper active" style="width: 20px; height: 20px; margin: 5px 15px;"> <div class="spinner-layer spinner-blue-only"> <div class="circle-clipper left"> <div class="circle"></div></div><div class="gap-patch"> <div class="circle"></div></div><div class="circle-clipper right"> <div class="circle"></div></div></div></div>')
})

//Sign out
$(".signOut").click(function () {
    localStorage.clear();
    setTimeout(location.reload(), 2000)
});
