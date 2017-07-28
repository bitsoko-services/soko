function refreshBeacons() {
    doFetch({
        action: 'getBeacons',
        id: localStorage.getItem('soko-owner-id')
    }).then(function (e) {
        console.log(e);
        getObjectStore('data', 'readwrite').put(JSON.stringify(e.beacons), 'soko-owner-' + localStorage.getItem('soko-owner-id') + '-beacons');
        beaconsUpdater();
    }).catch(function (err) {
        beaconsUpdater();
    }); //addCustomer(e.customers);
}

function beaconsUpdater() {
    getObjectStore('data', 'readwrite').get('soko-owner-' + localStorage.getItem('soko-owner-id') + '-beacons').onsuccess = function (event) {
        var reqs = event.target.result;
        try {
            reqs = JSON.parse(reqs);
        } catch (err) {
            reqs = []
        };
        $(".beacons-holda-connected").html('');
        $(".beacons-holda-available").html('');
        if (reqs.length > 0) {
            var html = '<li class="collection-item avatar"><i class="mdi-action-settings-bluetooth green circle"></i>' + '<span class="collection-header" style="pointer-events: none;">Connected Beacons</span><p>' + reqs.length + ' Found</p></li>';
            $(".beacons-holda-connected").append($.parseHTML(html));
            var html = '<li class="collection-item avatar"><i class="mdi-action-settings-bluetooth pink circle"></i>' + '<span class="collection-header" style="pointer-events: none;">Available Beacons</span><p>' + reqs.length + ' Found</p></li>';
            $(".beacons-holda-available").append($.parseHTML(html));
        } else {
            var html = '<li class="collection-item avatar"><i class="mdi-action-settings-bluetooth cyan circle"></i>' + '<span class="collection-header">No Beacons Found</span><p>click here to add a beacon</p></li>';
            $(".beacons-holda-available").append($.parseHTML(html));
            return;
        }
        var st = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store')));
        for (var i = 0, st = st; i < reqs.length; ++i) {
            if (parseInt(reqs[i].service) == parseInt(localStorage.getItem('soko-active-store'))) {
                var html = '<li class="collection-item">' + '<div class="row"><div class="col s4">' + '<p class="collections-title"><strong>#' + reqs[i].name + '</strong> Connected</p><div class="switch"> <label><input type="checkbox" class="toggleBeacon" id="toggleBeacon_' + reqs[i].id + '" bid="' + reqs[i].id + '"> <span class="lever" bid="' + reqs[i].id + '"></span> </label> </div></div><div class="col s8"><div class="input-field col s12"> <select id="promoSubSelect_' + reqs[i].id + '"><option value="1">Option 1</option></select> <label>Materialize Select</label> </div></div></div></li>';
                $(".beacons-holda-connected").append($.parseHTML(html));
                $("#toggleBeacon_" + reqs[i].id).prop("checked", true);
            } else if (parseInt(reqs[i].service) == parseInt('0')) {
                var html = '<li class="collection-item">' + '<div class="row"><div class="col s4">' + '<p class="collections-title"><strong>#' + reqs[i].name + '</strong> Not Connected</p><div class="switch"> <label><input type="checkbox" class="toggleBeacon" id="toggleBeacon_' + reqs[i].id + '" bid="' + reqs[i].id + '"> <span class="lever" bid="' + reqs[i].id + '"></span></label> </div></div><div class="col s5"><div class="select-wrapper initialized"><span class="caret">▼</span><select class="initialized" bid="' + reqs[i].id + '"><option value="0" selected="">disabled</option><option value="' + st.id + '">' + st.name + '</option></select></div></div></div></li>';
                $(".beacons-holda-available").append($.parseHTML(html));
                $("#toggleBeacon_" + reqs[i].id).prop("checked", false);
            }

            $('.toggleBeacon ').unbind().click(function () {
                var value = this;
                var val = $(value).attr('bid')
                if ($(value).prop("checked") == true) {
                    var value = document.getElementsByClassName("toggleBeacon").checked
                    var val = this.getAttribute('bid');
                    doFetch({
                        action: 'doSetBeacon',
                        id: val,
                        to: localStorage.getItem("soko-active-store")
                    }).then(function (e) {
                        if (e.status == 'ok') {
                            Materialize.toast('beacon updated ..', 3000);
                            refreshBeacons();
                        } else {
                            console.log(e);
                        }
                    });
                } else {
                    var value = document.getElementsByClassName("toggleBeacon").checked
                    var val = this.getAttribute('bid');
                    doFetch({
                        action: 'doSetBeacon',
                        id: val,
                        to: 0
                    }).then(function (e) {
                        if (e.status == 'ok') {
                            Materialize.toast('beacon updated ..', 3000);
                            refreshBeacons();
                        } else {
                            console.log(e);
                        }
                    });
                }
            });

            getBeaconStatus()
        }
        updateBeaconMonitor();
    }
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
                action: 'doSetBeacon',
                id: val,
                to: $(value).val()
            }).then(function (e) {
                if (e.status == 'ok') {
                    Materialize.toast('beacon updated ..', 3000);
                    refreshBeacons();
                } else {
                    console.log(e);
                }
            });
        });
    });
}

function getBeaconStatus() {
    ////Active beacon 
    $('.toggleBeacon').click(function () {
        var value = document.getElementsByClassName("toggleBeacon").checked
        var val = $(this).attr('bid');
    });
}


//Write Descriptor
var myDescriptor;

function onReadButtonClick() {
    let serviceUuid = "000000ff-0000-1000-8000-00805f9b34fb";
    if (serviceUuid.startsWith('0x')) {
        serviceUuid = parseInt(serviceUuid);
    }

    let characteristicUuid = "0000ff01-0000-1000-8000-00805f9b34fb";
    if (characteristicUuid.startsWith('0x')) {
        characteristicUuid = parseInt(characteristicUuid);
    }

    console.log('Requesting any Bluetooth Device...');
    navigator.bluetooth.requestDevice({
            // filters: [...] <- Prefer filters to save energy & show relevant devices.
            acceptAllDevices: true,
            optionalServices: [serviceUuid]
        })
        .then(device => {
            console.log('Connecting to GATT Server...');
            return device.gatt.connect();
        })
        .then(server => {
            console.log('Getting Service...');
            return server.getPrimaryService(serviceUuid);
        })
        .then(service => {
            console.log('Getting Characteristic...');
            return service.getCharacteristic(characteristicUuid);
        })
        .then(characteristic => {
            console.log('Getting Descriptor...');
            return characteristic.getDescriptor(0x2902);
        })
        .then(descriptor => {
            //            document.querySelector('#writeButton').disabled = !descriptor.characteristic.properties.write;
            myDescriptor = descriptor;
            console.log('Reading Descriptor...');
            return descriptor.readValue();
        })
        .then(value => {
            let decoder = new TextDecoder('utf-8');
            console.log('> Characteristic User Description: ' + decoder.decode(value));
            onWriteButtonClick()
        })
        .catch(function (error) {
            //            document.querySelector('#writeButton').disabled = true;
            console.log('Argh! ' + error);
        });
}

function onWriteButtonClick() {
    if (!myDescriptor) {
        return;
    }
    let encoder = new TextEncoder('utf-8');
    let value = "";
    console.log('Setting Characteristic User Description...');
    myDescriptor.writeValue(encoder.encode(value))
        .then(_ => {
            console.log('> Characteristic User Description changed to: ' + value);
        })
        .catch(error => {
            console.log('Argh! ' + error);
        });
}
