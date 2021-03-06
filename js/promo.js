function refreshPromotions() {
    doFetch({
        action: 'getPromotions',
        id: localStorage.getItem('soko-active-store')
    }).then(function(e) {
        //Subscribers Id
        promoSubsId = e.promotions;
        promotionLength = promoSubsId.length

        for (var i = 0; i < promoSubsId.length; i++) {
            var allPromo = promoSubsId[i].promoSubs;

            for (var s = 0; s < allPromo.length; s++) {
                // console.log('[++++++++++++++]' + promoSubsId[i].id + allPromo[s].id)
            }
        }
        if (e.status == 'ok') {
            getObjectStore('data', 'readwrite').put(JSON.stringify(e.promotions), 'soko-store-' + localStorage.getItem('soko-active-store') + '-promotions');
        } else {

            getObjectStore('data', 'readwrite').put('[]', 'soko-store-' + id + '-promotions');
        }
        promoUpdater();
        getActiveStoreProd();
        addPromoItems();
    }).catch(function(err) {
        promoUpdater();
        getActiveStoreProd();

    });
}

function addPromoItems() {
    var allItemIds = new Array()
    for (itemId in getAllProducts) {
        allItemIds.push(getAllProducts[itemId].id)
    }
    var array = allItemIds
    for (items in promoSubsId) {
        var promoItems = JSON.parse(promoSubsId[items].promoItems)
        for (item in promoItems) {
            var index = array.indexOf(promoItems[item]);
            if (index !== -1) array.splice(index, 1);
        }
    }
    $(".promo-add-new-promotion2").html('');
    for (itemsIDs in getAllProducts) {
        for (x in array) {
            if (getAllProducts[itemsIDs].id == array[x]) {
                $(".promo-add-new-promotion2").append('<li value="' + getAllProducts[itemsIDs].id + '" label="' + getAllProducts[itemsIDs].id + '" data-icon="' + getAllProducts[itemsIDs].imagePath + '" class="circle" selected>' + '<p><div class="row col s12" style="padding:0px;"> <div class="col s6"><form action="#"> <label for="' + getAllProducts[itemsIDs].id + '"><input class="newPromoItems" name="promoItems" type="checkbox" id="' + getAllProducts[itemsIDs].id + '" pid="' + getAllProducts[itemsIDs].id + '"/><span>' + getAllProducts[itemsIDs].name + '</span></label></form></div> <div class="col s4" style="float: right;    float: right;width: auto;height: 30px;padding:0px;"><div style="display:inline-flex;"><button style="width: 30px; height: 30px; background: #299288; border-radius: 50%; content: ' + '; border: none; color: white; margin-left: 10px;" href="#" class="counter-left" id="plus-' + getAllProducts[itemsIDs].id + '" disabled>-</button><input class="' + getAllProducts[itemsIDs].id + '" type="number" value="0" style="width:30px;text-align:center;margin-top:-6px;"><button style="width: 30px; height: 30px; background: #299288; border-radius: 50%; content: ' + '; border: none; color: white; margin-left: 10px;" href="#" class="counter-right" id="minus-' + getAllProducts[itemsIDs].id + '" disabled>+</button></div></div></div></p>' + '</li>' + '</li>');

            }
        }
    }
    $('.counter-left').click(function(event) {
        event.preventDefault()
        minus = $(this).next('input')
        minus_ = minus.val()
        if (minus_ !== '1') {
            minus_ = parseInt(minus_) - 1
        }
        minus.val(minus_)
    })

    $('.counter-right').click(function(event) {
        event.preventDefault()
        add = $(this).prev('input')
        add_ = add.val()
        add_ = parseInt(add_) + 1
        add.val(add_)
    })
    $(document).on('click touchstart', '.newPromoItems', function(e) {
        var clickedId = $(this).attr('id')
        var status = $(this).prop('checked')
        if (status == true) {
            $('#plus-' + clickedId).prop('disabled', false)
            $('#minus-' + clickedId).prop('disabled', false)
        } else {
            $('#plus-' + clickedId).prop('disabled', true)
            $('#minus-' + clickedId).prop('disabled', true)
        }
    })
}

function checkedProdsInPromo() {
    getObjectStore('data', 'readwrite').get('soko-store-' + localStorage.getItem('soko-active-store') + '-promotions').onsuccess = function(event) {

        try {
            var reqs = JSON.parse(event.target.result);
        } catch (err) {
            var reqs = [];
        };

        for (var i = 0; i < reqs.length; ++i) {
            var tt = JSON.parse(reqs[i].promoItems);

            //Unique count
            uniqueCount = tt;
            var count = {};
            uniqueCount.forEach(function(i) {
                count[i] = (count[i] || 0) + 1;
            });
            // console.log(Object.keys(count))
            // console.log(Object.values(count))
            promoID = reqs[i].id;
            for (var prop in tt) {
                var checked = "#prod" + tt[prop] + "-" + promoID;

                $(checked).prop('checked', true);
                $("#" + tt[prop]).prop("disabled", true);
                $("#editPlus-" + tt[prop] + "-" + promoID).prop("disabled", false);
                $("#editMinus-" + tt[prop] + "-" + promoID).prop("disabled", false);
                //                $("#prod" + tt[prop] + "-" + promoID).prop("disabled", true);

                inputVal = count[$(checked).attr("prod_id")];
                for (var s in tt) {
                    $("#prodEdit_" + tt[prop] + "-" + promoID).val(inputVal);
                }

            }
        }
    }
}

function promoUpdater() {
    getObjectStore('data', 'readwrite').get('soko-store-' + localStorage.getItem('soko-active-store') + '-promotions').onsuccess = function(event) {
        var reqs = event.target.result;
        try {
            reqs = JSON.parse(reqs);
        } catch (err) {
            console.log('unable to access promotions list. ' + err);
            setTimeout(refreshPromotions, 3000);
            return;
        }

        $(".allPromosCount").html(reqs.length);
        $(".promotions-holda").html('');
        //TO_DO MAKE SURE THERE EXISTS PRODUCTS TO PROMOTE FIRST!!
        if (reqs.length == 0) {
            var html = '<li class="collection-item avatar" style="opacity: 0.6;"><i class="mdi-action-redeem cyan circle"></i>' + '<span class="collection-header">No Promotions Found</span></li>';
            $(".promotions-holda").append($.parseHTML(html));
        }

        function logArrayElements(element, index, array) {
            console.log('a[' + index + '] = ' + element);
        }

        for (var i = 0; i < reqs.length; ++i) {
            //  var saleAmount=Math.ceil(parseFloat(reqs[i].amount)/100000000 *loCon.xrate*loCon.rate)+'/= '+loCon.symbol;
            // var saleTime=moment(reqs[i].posted).fromNow();
            //var html = ''+saleAmount+'</h5><small class="noteC-time text-muted">'+saleTime+'</small></div></div></a>';

            $(".promotions-holda").prepend('<div id="promo-card-' + reqs[i].id + '" class="p-card card"> <div class="card-image"> <img id="promoImage-' + reqs[i].id + '" src="' + reqs[i].promoBanner + '" alt="user bg" style="height:165px"> <span class="card-title"></span> </div><div class="card-content" style="padding-top:0px;padding-bottom:0px;"> <h5 style="font-size:1.4rem;pointer-events: none;">' + reqs[i].promoName + '<span class="right promo-' + reqs[i].promoStatus + '" style="font-size: 0.75em;">' + reqs[i].promoStatus + '</span></h5> <p>' + reqs[i].promoDesc + '</p></div><div id="promoMenu" style="padding:10px;text-align: center;/* background: #ffffff; */"> <div class="row" style="margin-bottom:0px;"> <div class="col s4" style="">  <p class="subsribersNumb" style="margin:0px;font-size:0.8rem;line-height:1;padding-bottom:3px;pointer-events: none;">0<br> like<span id="subPlural">s</span></p><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 478.2 478.2" style="enable-background:new 0 0 478.2 478.2;width:15px;" xml:space="preserve"> <path d="M457.575,325.1c9.8-12.5,14.5-25.9,13.9-39.7c-0.6-15.2-7.4-27.1-13-34.4c6.5-16.2,9-41.7-12.7-61.5 c-15.9-14.5-42.9-21-80.3-19.2c-26.3,1.2-48.3,6.1-49.2,6.3h-0.1c-5,0.9-10.3,2-15.7,3.2c-0.4-6.4,0.7-22.3,12.5-58.1 c14-42.6,13.2-75.2-2.6-97c-16.6-22.9-43.1-24.7-50.9-24.7c-7.5,0-14.4,3.1-19.3,8.8c-11.1,12.9-9.8,36.7-8.4,47.7 c-13.2,35.4-50.2,122.2-81.5,146.3c-0.6,0.4-1.1,0.9-1.6,1.4c-9.2,9.7-15.4,20.2-19.6,29.4c-5.9-3.2-12.6-5-19.8-5h-61 c-23,0-41.6,18.7-41.6,41.6v162.5c0,23,18.7,41.6,41.6,41.6h61c8.9,0,17.2-2.8,24-7.6l23.5,2.8c3.6,0.5,67.6,8.6,133.3,7.3 c11.9,0.9,23.1,1.4,33.5,1.4c17.9,0,33.5-1.4,46.5-4.2c30.6-6.5,51.5-19.5,62.1-38.6c8.1-14.6,8.1-29.1,6.8-38.3 c19.9-18,23.4-37.9,22.7-51.9C461.275,337.1,459.475,330.2,457.575,325.1z M48.275,447.3c-8.1,0-14.6-6.6-14.6-14.6V270.1 c0-8.1,6.6-14.6,14.6-14.6h61c8.1,0,14.6,6.6,14.6,14.6v162.5c0,8.1-6.6,14.6-14.6,14.6h-61V447.3z M431.975,313.4 c-4.2,4.4-5,11.1-1.8,16.3c0,0.1,4.1,7.1,4.6,16.7c0.7,13.1-5.6,24.7-18.8,34.6c-4.7,3.6-6.6,9.8-4.6,15.4c0,0.1,4.3,13.3-2.7,25.8 c-6.7,12-21.6,20.6-44.2,25.4c-18.1,3.9-42.7,4.6-72.9,2.2c-0.4,0-0.9,0-1.4,0c-64.3,1.4-129.3-7-130-7.1h-0.1l-10.1-1.2 c0.6-2.8,0.9-5.8,0.9-8.8V270.1c0-4.3-0.7-8.5-1.9-12.4c1.8-6.7,6.8-21.6,18.6-34.3c44.9-35.6,88.8-155.7,90.7-160.9 c0.8-2.1,1-4.4,0.6-6.7c-1.7-11.2-1.1-24.9,1.3-29c5.3,0.1,19.6,1.6,28.2,13.5c10.2,14.1,9.8,39.3-1.2,72.7 c-16.8,50.9-18.2,77.7-4.9,89.5c6.6,5.9,15.4,6.2,21.8,3.9c6.1-1.4,11.9-2.6,17.4-3.5c0.4-0.1,0.9-0.2,1.3-0.3 c30.7-6.7,85.7-10.8,104.8,6.6c16.2,14.8,4.7,34.4,3.4,36.5c-3.7,5.6-2.6,12.9,2.4,17.4c0.1,0.1,10.6,10,11.1,23.3 C444.875,295.3,440.675,304.4,431.975,313.4z"></path> </svg> </div><div class="col s4" style="">  <p class="subsribersNumb" style="margin:0px;font-size:0.8rem;line-height:1;padding-bottom:3px;pointer-events: none;"> 0<br> share<span id="subPlural">s</span></p><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 58.995 58.995" style="enable-background:new 0 0 58.995 58.995;height: 17px;margin-left: 0px;" xml:space="preserve"><path d="M39.927,41.929c-0.524,0.524-0.975,1.1-1.365,1.709l-17.28-10.489c0.457-1.144,0.716-2.388,0.716-3.693 c0-1.305-0.259-2.549-0.715-3.693l17.284-10.409C40.342,18.142,43.454,20,46.998,20c5.514,0,10-4.486,10-10s-4.486-10-10-10 s-10,4.486-10,10c0,1.256,0.243,2.454,0.667,3.562L20.358,23.985c-1.788-2.724-4.866-4.529-8.361-4.529c-5.514,0-10,4.486-10,10 s4.486,10,10,10c3.495,0,6.572-1.805,8.36-4.529L37.661,45.43c-0.43,1.126-0.664,2.329-0.664,3.57c0,2.671,1.04,5.183,2.929,7.071 c1.949,1.949,4.51,2.924,7.071,2.924s5.122-0.975,7.071-2.924c1.889-1.889,2.929-4.4,2.929-7.071s-1.04-5.183-2.929-7.071 C50.169,38.029,43.826,38.029,39.927,41.929z M46.998,2c4.411,0,8,3.589,8,8s-3.589,8-8,8s-8-3.589-8-8S42.586,2,46.998,2z M11.998,37.456c-4.411,0-8-3.589-8-8s3.589-8,8-8s8,3.589,8,8S16.409,37.456,11.998,37.456z M52.654,54.657 c-3.119,3.119-8.194,3.119-11.313,0c-1.511-1.511-2.343-3.521-2.343-5.657s0.832-4.146,2.343-5.657 c1.56-1.56,3.608-2.339,5.657-2.339s4.097,0.779,5.657,2.339c1.511,1.511,2.343,3.521,2.343,5.657S54.166,53.146,52.654,54.657z"></path></svg></div><div class="col s4" style="">    <p class="subsribersNumb" style="margin:0px;font-size:0.8rem;line-height:1;padding-bottom:3px;"><span class="cusLen"></span><br> subsriber<span id="subPlural">s</span></p> <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;width: 20px;" xml:space="preserve"><g><g><path d="M392.531,221.867c-6.229,0-12.134,1.775-17.229,4.83c-1.877-21.803-20.224-38.963-42.505-38.963 c-10.829,0-20.736,4.062-28.271,10.735c-6.042-16.222-21.692-27.802-39.996-27.802c-11.042,0-21.129,4.224-28.715,11.136 L221.813,41.737C217.836,5.419,196.418,0,184.002,0c-22.562,0-38.938,17.946-38.929,42.974l8.533,238.933 c0.162,4.702,3.977,8.363,8.832,8.226c4.702-0.179,8.388-4.13,8.226-8.841l-8.533-238.626c0-12.74,6.758-25.6,21.871-25.6 c4.437,0,17.937,0,20.838,26.453l17.067,170.667c0.452,4.523,4.275,8.047,8.917,7.671c4.54-0.23,8.107-3.977,8.107-8.525 c0-14.114,11.486-25.6,25.6-25.6c14.114,0,25.6,11.486,25.6,25.6V230.4c0,4.71,3.823,8.533,8.533,8.533 c4.71,0,8.533-3.823,8.533-8.533c0-14.114,11.486-25.6,25.6-25.6s25.6,11.486,25.6,25.6V256c0,4.71,3.823,8.533,8.533,8.533 c4.71,0,8.533-3.823,8.533-8.533c0-8.934,8.132-17.067,17.067-17.067c8.61,0,17.067,8.457,17.067,17.067v110.933 c0,37.026-7.902,55.714-16.273,75.494c-6.204,14.66-12.604,29.773-16.606,52.506H186.092 c-9.429-41.216-31.249-91.332-64.939-149.111c-3.644-6.255-7.305-12.373-10.931-18.33c-9.301-15.24-10.402-35.499-2.679-49.254 c3.507-6.255,10.419-13.705,23.39-13.705c4.71,0,8.533-3.823,8.533-8.533s-3.823-8.533-8.533-8.533 c-16.563,0-30.157,7.962-38.272,22.417c-10.769,19.183-9.574,45.909,2.995,66.5c3.567,5.862,7.168,11.887,10.761,18.031 c34.62,59.401,56.294,110.106,64.418,150.724c0.794,3.994,4.292,6.861,8.363,6.861h204.8c4.25,0,7.842-3.123,8.448-7.322 c3.533-24.73,10.172-40.422,16.597-55.603c8.661-20.48,17.621-41.651,17.621-82.142V256 C426.664,238.14,410.391,221.867,392.531,221.867z"></path></g></g></svg></div></div></div><div style=" background: #26A69A; color: white;"><div id="myNav' + reqs[i].id + '" class="overlay promoSettings" style="width: 0%;"> <a href="javascript:void(0)" class="closebtn"  id="myNav' + reqs[i].id + '" onclick="refreshPromotions();"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 31.494 31.494" style="enable-background:new 0 0 31.494 31.494;width: 30px;" xml:space="preserve"><path xmlns="http://www.w3.org/2000/svg" style="fill:white;" d="M21.205,5.007c-0.429-0.444-1.143-0.444-1.587,0c-0.429,0.429-0.429,1.143,0,1.571l8.047,8.047H1.111  C0.492,14.626,0,15.118,0,15.737c0,0.619,0.492,1.127,1.111,1.127h26.554l-8.047,8.032c-0.429,0.444-0.429,1.159,0,1.587  c0.444,0.444,1.159,0.444,1.587,0l9.952-9.952c0.444-0.429,0.444-1.143,0-1.571L21.205,5.007z"/></svg></a> <div class="overlay-content"> <div style="background:linear-gradient(rgba(0, 0, 0, 0.61), transparent, rgba(0, 0, 0, 0.26));"><img class="promoBanner" src="' + reqs[i].promoBanner + '" style="height:200px;width:100%;position:relative; z-index:-1;display: block;"></div><div class="row" style="margin-top:-40px;"><div class="col s8"><h5 style=";margin-left:20px;pointer-events: none;     text-overflow: ellipsis; width: 95%; overflow: hidden; height: 25px;">' + reqs[i].promoName + '</h5></div><div class="col s4"></div></div><div style="padding: 20px 10%;"><div><div class="radio-group" gid="' + reqs[i].id + '" style="border-radius:5px;"><input type="radio" id="private' + reqs[i].id + '" name="selector' + reqs[i].id + '" pritm="private" fid="' + reqs[i].id + '"><label id="private_' + reqs[i].id + '" class="radioPad" for="private' + reqs[i].id + '" style="width:33.3%; text-align:center;border-left:solid 1px; border-radius:5px; border-bottom-right-radius: 0px; border-top-right-radius: 0px;">Private</label><input type="radio" id="semi_public' + reqs[i].id + '" name="selector' + reqs[i].id + '"  pritm="semi-public" fid="' + reqs[i].id + '"><label class="radioPad" for="semi_public' + reqs[i].id + '" style="width:33.3%; text-align:center;">Semi-Public</label><input type="radio" id="publicSwitch' + reqs[i].id + '" name="selector' + reqs[i].id + '" pritm="public" fid="' + reqs[i].id + '"><label id="public_' + reqs[i].id + '" class="radioPad" for="publicSwitch' + reqs[i].id + '" style="width:33.3%; text-align:center;border-radius:5px; border-right:solid 1px; border-bottom-left-radius: 0px; border-top-left-radius: 0px;" > Public </label></div></div><div class="promo-' + reqs[i].id + '-subscribers"></div><form class="col s12" fid="' + reqs[i].id + '" style="color:black;margin-bottom:20px;"> <div class="row"> <div class="input-field col s12"> <input id="newPromo-name" type="text" class="validate js-loc-button-notification-input" value="' + reqs[i].promoName + '" pritm="name" required> <label for="newPromo-name" class="">Name</label> </div></div><div class="row"> <div class="input-field col s12"> <input id="newPromo-desc" type="text" class="validate js-loc-button-notification-input" value="' + reqs[i].promoDesc + '" pritm="msg" required> <label for="newPromo-desc" class="">Desc</label> </div></div><div class="row"> <div class="file-field input-field" style="    position: absolute; top: 145px; right: -25px;"> <div id="editImgBtn" class="btn opacitySelectedColor" style="    background: transparent; filter: brightness(1.3); box-shadow: none;"><span><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 21.069 21.069" style="enable-background:new 0 0 21.069 21.069; width: 23px; float: right;margin-right: 15px; margin-top: 10px;" xml:space="preserve"><g><g><path style="fill:white;" d="M19.212,10.316l-2.37-2.371l-5.146,5.145l-1.38,4.164l4.124-1.419l5.145-5.146L19.212,10.316 L19.212,10.316z M11.132,16.428l0.762-2.433l1.647,1.649L11.132,16.428z"/><path style="fill:white;" d="M21.01,8.977l-2.455-2.458c-0.081-0.079-0.209-0.079-0.288,0l-0.979,0.98 c-0.079,0.08-0.079,0.207,0,0.287l2.457,2.457c0.079,0.079,0.208,0.078,0.287,0l0.978-0.98C21.089,9.184,21.089,9.056,21.01,8.977 z"/><path style="fill:white;" d="M1.409,13.494V5.213h12.648v3.702l1.152-1.152v-3.64c0-0.169-0.137-0.307-0.309-0.307H0.309 C0.138,3.816,0,3.954,0,4.123v12.628c0,0.169,0.138,0.307,0.309,0.307H9.47l1.183-3.564C10.653,13.494,1.409,13.494,1.409,13.494z "/><path style="fill:white;" d="M5.368,11.314C3.156,6.877,1.684,12.5,1.684,12.5h3.292h0.908h4.766 C8.098,5.838,6.16,9.255,5.368,11.314z"/><circle style="fill:white;" cx="10.921" cy="7.105" r="1.243"/></g></g></svg></span> <input id="newPromo-image" type="file" pritm="customImage" required> </div></div></div><div class="row"> <div class="input-field col s6"> <input placeholder="' + reqs[i].discount + '" id="newPromo-discount" type="number" class="validate" min="0" max="90" pritm="discount" disabled> <label for="newPromo-discount" class="">% discount</label> </div><div class="input-field col s6"> <input placeholder="" id="newPromo-offers" type="number" class="validate" min="0" pritm="offers" disabled> <label for="newPromo-offers" class="">miximum buyers</label> </div></div><div class="row"> <h6 style="text-align:center;pointer-events: none;">Promotion Items</h6><ul class="promoItems-' + reqs[i].id + '"></ul> <ul class="promo-add-new-promotion-' + reqs[i].id + '" id="promoEdit"></ul> </div><div class="row" style="text-align: center;margin: 20px 0px;"> <a class="removePromo waves-effect waves-light btn opacitySelectedColor" style="margin-bottom:10px;float: left;" id="myNav' + reqs[i].id + '">remove</a><a class="backBtnPromo waves-effect waves-light btn opacitySelectedColor" style="margin-bottom:10px;float: right;"  id = "myNav' + reqs[i].id + '" onclick="refreshPromotions();">back</a> </div></form></div></div></div><span style="font-size:30px;cursor:pointer"><p style=" TEXT-ALIGN: CENTER; FONT-SIZE: 14px; padding: 9px; margin: 0px;" class="editPromoBtn opacitySelectedColor" id = "myNav' + reqs[i].id + '">EDIT PROMOTION</p></span></div></div>');


            if (reqs[i].promoBanner == null || reqs[i].promoBanner == '') {
                $("#promoImage--" + reqs[i].id).attr("src", "https://bitsoko.co.ke/soko/images/no-image-icon-15.png");
                console.log("No Image")
            }

            var promoSubscribers = reqs[i].promoSubs
            var promoSubId = reqs[i].id
            for (var ps = 0, promoSubscribers = promoSubscribers; ps < promoSubscribers.length; ++ps) {
                promoIdArray = promoSubscribers[ps].id


                for (var dg in deliveryGuys) {
                    var name = deliveryGuys[dg].name;
                    var id = deliveryGuys[dg].id;
                    if (promoIdArray == id) {
                        $(".promo-" + promoSubId + "-subscribers").append('<div class="chip" style="margin:5px;">' + name + '</div>')
                    }
                }

            }


            //            $(".promotions-holda").prepend($.parseHTML(html));
            $(".editPromoBtn").click(function() {
                if ($(window).innerWidth() > 751) {
                    uniqueId = $(this).attr('id')
                    $("#" + uniqueId).width("35%")
                    $("#" + uniqueId).scroll(function() {
                        $(".promoBanner").css("opacity", 1 - $("#" + uniqueId).scrollTop() / 150);;
                    });
                } else {
                    uniqueId = $(this).attr('id')
                    $("#" + uniqueId).width("100%")
                    $("#" + uniqueId).scroll(function() {
                        $(".promoBanner").css("opacity", 1 - $("#" + uniqueId).scrollTop() / 150);;
                    });
                }
            })
            $(document).on('click', '#myNav' + reqs[i].id + '', function(event) {
                checkedBoxes = $(this).attr("id").replace(/\D+/g, "");
                var checkerState = $(".itemsChecker" + checkedBoxes).selector;
                checkedItemsState = $("" + checkerState + ":checked");
                allChecked = $("" + checkerState + "")
                if (checkedItemsState.length >= 5) {
                    $("" + checkerState + "").prop("disabled", true);
                    for (var v = 0; v < checkedItemsState.length; ++v) {
                        $("#" + checkedItemsState[v].id).prop("disabled", false);
                    }
                } else {}

            })

            $(".closebtn").click(function() {
                uniqueId = $(this).attr('id')
                $("#" + uniqueId).width("0%")
            });
            $(".removePromo").click(function() {
                uniqueId = $(this).attr('id')
                $("#" + uniqueId).width("0%")
            });
            $(".backBtnPromo").click(function() {
                uniqueId = $(this).attr('id')
                $("#" + uniqueId).width("0%")
            });
            promoCreator(reqs[i].id);
            loadTheme();
        }
        if (cusLen == 1) {
            document.getElementById('subPlural').innerHTML = '';
        }
        //$('.products-collapsible').collapsible();;
        $('select').formSelect();
        M.updateTextFields();
        initProdCallback();
        var shroot = document.querySelectorAll(".castPromo");
        for (var i = 0; i < shroot.length; ++i) {
            shroot[i].addEventListener("touchstart", castPromo, false);
        };
        editPromoCallback();
    }
    refreshCustomers()
}

function getActiveStoreProd(p) {
    return new Promise(function(resolve, reject) {

        getObjectStore('data', 'readwrite').get('soko-store-' + localStorage.getItem('soko-active-store') + '-products').onsuccess = function(event) {

            try {
                resolve({
                    plist: $.parseJSON(event.target.result),
                    ret: p
                });
            } catch (err) {
                // refreshBilling();
            }
        }
    });

}

function promoCreator(proId) {
    //    console.log(proId);
    //$("#prod" + tt[prop] + "-" + promoID).prop("disabled", true);

    getActiveStoreProd(proId).then(function(ee) {
        var proId = ee.ret;
        var e = ee.plist;
        //        console.log(proId);
        if (e.length == 0) {
            var html = '<li class="collection-item avatar" style="opacity: 0.6;"><i class="mdi-action-redeem cyan circle"></i>' + '<span class="collection-header">No Product Found</span></li>';
            $(".promotions-holda").append($.parseHTML(html));
        } else {
            //setupPromos(e);
            // $(".promo-add-new-promotion-" + proId).html('');

            for (var i = 0, proId = proId; i < e.length; ++i) {
                try {
                    var itemsInPromo = JSON.parse(promoSubsId[i].promoItems)
                    $('.promoItems-' + promoSubsId[i].id).html('')
                    for (items in itemsInPromo) {
                        for (var ii = 0; ii < getAllProducts.length; ii++) {
                            var prdId = getAllProducts[ii].id
                            var prodName = getAllProducts[ii].name
                            if (prdId == itemsInPromo[items]) {
                                $('.promoItems-' + promoSubsId[i].id).append('<li style="display: inline-block;"><div class="chip">' + prodName + '</div></li>')
                            }
                        }
                    }
                } catch (err) {
                    console.log(err)
                }

                $("#prodEdit_" + e[i].id).change(function() {
                    var inputId = $(this).attr("prodedit");
                    var selcIds = new Array();
                    var boxes = $('#promoEdit input[name=promoItems]:checked');

                    for (i = 0; i < boxes.length; i++) {
                        console.log('ID is: ' + boxes[i].id);
                        var productID = boxes[i].id;
                        console.log('The item is added ' + $('li.circle input.' + productID).val() + ' times');
                        var times = $('li.circle input.' + productID).val();
                        for (w = 0; w < times; w++) {
                            var ret = productID.replace('prod', '');
                            console.log(ret);
                            console.log('Product is: ' + ret);
                            selcIds.push(parseInt(inputId));
                            doFetch({
                                action: 'doEditPromo',
                                id: inputId,
                                prop: "items",
                                value: selcIds
                            }).then(function(e) {
                                if (e.status == 'ok') {
                                    M.toast({
                                        html: 'Promotion item added successfully',
                                        displayLength: 3000
                                    })
                                } else {
                                    console.log(e);
                                    M.toast({
                                        html: 'Error! Please try again',
                                        displayLength: 3000
                                    })
                                }
                            });
                        }
                    }
                })

                $('#' + e[i].id).click(function() {
                    var checkerID = $(this).attr('pid');
                    console.log(checkerID)
                    $('#plus-' + checkerID).attr('disabled', !this.checked)
                    $('#minus-' + checkerID).attr('disabled', !this.checked)
                });
                $('#prod' + e[i].id + "-" + proId).click(function() {
                    var checkerID = $(this).attr('name');
                    $('#editPlus-' + checkerID).attr('disabled', !this.checked)
                    $('#editMinus-' + checkerID).attr('disabled', !this.checked)
                });
                $('#editPlus-' + +e[i].id + '-' + proId).click(function() {
                    $('.counter').remove();
                    var selectedItem = $(this).attr("checkedID")
                    var checkBox = "itemsChecker" + $(this).attr("pid");
                    var checkBoxSelected = $("." + checkBox);
                    var checkBoxClass = this.name;
                    var checkBoxId = $(this).attr("class").replace(/\D+/g, "");
                    console.log(checkBoxId)
                    var selectedId = new Array();
                    for (a = 0, selectedId = selectedId; a < checkBoxSelected.length; a++) {
                        var checkerState = checkBoxSelected;

                        if (checkerState[a].checked == true) {
                            itemsInput = checkerState[a].id.replace(/\prod/, '');
                            checkerInputVal = $("#prodEdit_" + itemsInput).val();
                            checkerInputId = $("#prodEdit_" + itemsInput).attr("prodedit");
                            for (tt = 0, selectedId = selectedId; tt < checkerInputVal; tt++) {
                                selectedId.push(parseInt(checkerInputId));
                            }
                        } else {
                            console.log("unchecked")
                        }
                    }
                    selectedId.push(JSON.parse(selectedItem));
                    doFetch({
                        action: 'doEditPromo',
                        id: checkBoxId,
                        prop: "items",
                        val: JSON.stringify(selectedId)
                    }).then(function(e) {
                        if (e.status == 'ok') {
                            M.toast({
                                html: 'Promotion modified successfully',
                                displayLength: 3000
                            })
                        } else {
                            console.log(e);
                            M.toast({
                                html: 'Error! Please try again',
                                displayLength: 3000
                            })
                        }
                    });
                })
                $('#editMinus-' + +e[i].id + '-' + proId).click(function() {
                    $('.counter').remove();
                    var selectedItem = JSON.parse($(this).attr("checkedID"));
                    var checkBox = "itemsChecker" + $(this).attr("pid");
                    var checkBoxSelected = $("." + checkBox);
                    var checkBoxClass = this.name;
                    var checkBoxId = $(this).attr("class").replace(/\D+/g, "");
                    console.log(checkBoxId)
                    var selectedId = new Array();
                    for (a = 0, selectedId = selectedId; a < checkBoxSelected.length; a++) {
                        var checkerState = checkBoxSelected;

                        if (checkerState[a].checked == true) {
                            itemsInput = checkerState[a].id.replace(/\prod/, '');
                            checkerInputVal = $("#prodEdit_" + itemsInput).val();
                            checkerInputId = $("#prodEdit_" + itemsInput).attr("prodedit");
                            for (tt = 0, selectedId = selectedId; tt < checkerInputVal; tt++) {
                                selectedId.push(parseInt(checkerInputId));
                            }
                        } else {}
                    }
                    if (!Array.prototype.remove) {
                        Array.prototype.remove = function(val) {
                            var i = this.indexOf(val);
                            return i > -1 ? this.splice(i, 1) : [];
                        };
                    }
                    var array = selectedId;
                    array.remove(selectedItem);
                    doFetch({
                        action: 'doEditPromo',
                        id: checkBoxId,
                        prop: "items",
                        val: JSON.stringify(selectedId)
                    }).then(function(e) {
                        if (e.status == 'ok') {
                            M.toast({
                                html: 'Promotion modified successfully',
                                displayLength: 3000
                            })
                        } else {
                            console.log(e);
                            M.toast({
                                html: 'Error! Please try again',
                                displayLength: 3000
                            })
                        }
                    });
                })
                $('#prod' + e[i].id + '-' + proId).click(function() {
                    $('.counter').remove();
                    var checkBoxSelected = $("." + this.className);
                    var checkBoxClass = this.name;
                    var checkBoxId = $(this).attr("class").replace(/\D+/g, "");
                    var selectedId = new Array();
                    for (a = 0, selectedId = selectedId; a < checkBoxSelected.length; a++) {
                        var checkerState = checkBoxSelected;

                        if (checkerState[a].checked == true) {
                            itemsInput = checkerState[a].id.replace(/\prod/, '');
                            checkerInputVal = $("#prodEdit_" + itemsInput).val();
                            checkerInputId = $("#prodEdit_" + itemsInput).attr("prodedit");
                            for (tt = 0, selectedId = selectedId; tt < checkerInputVal; tt++) {
                                selectedId.push(parseInt(checkerInputId));
                            }
                        } else {
                            console.log("unchecked")
                        }
                    }
                    promoArray = selectedId;
                    var rmvDuplicates = uniqueArray = promoArray.filter(function(item, pos, self) {
                        return self.indexOf(item) == pos;
                    });
                    if (rmvDuplicates.length >= 5) {

                        var thisClass = $("" + checkBoxSelected.selector + "");
                        for (var i = 0; i < thisClass.length; ++i) {
                            if (thisClass[i].checked == false) {
                                enableId = thisClass[i].id;
                                $("#" + enableId).prop("disabled", true)
                            }
                        }
                    } else {
                        $("" + checkBoxSelected.selector + "").prop("disabled", false)
                    }
                    doFetch({
                        action: 'doEditPromo',
                        id: checkBoxId,
                        prop: "items",
                        val: JSON.stringify(selectedId)
                    }).then(function(e) {
                        if (e.status == 'ok') {
                            M.toast({
                                html: 'Promotion modified successfully',
                                displayLength: 3000
                            })
                        } else {
                            console.log(e);
                            M.toast({
                                html: 'Error! Please try again',
                                displayLength: 3000
                            })
                        }
                    });
                });
            }
            $('select').formSelect();

            $('.counter-left').click(function(event) {
                event.preventDefault()
                minus = $(this).next('input')
                minus_ = minus.val()
                if (minus_ !== '1') {
                    minus_ = parseInt(minus_) - 1
                }
                minus.val(minus_)
            })

            $('.counter-right').click(function(event) {
                event.preventDefault()
                add = $(this).prev('input')
                add_ = add.val()
                add_ = parseInt(add_) + 1
                add.val(add_)
            })
        }
    })

}

function castPromo(t) {
    getObjectStore('data', 'readwrite').get('soko-store-' + localStorage.getItem('soko-active-store')).onsuccess = function(event) {
        var reqs = event.target.result;
        var precp = [];
        reqs = JSON.parse(reqs);
        console.log(reqs);
        for (var i = 0; i < reqs.length; ++i) {
            precp.push(reqs[i].uid);
        }
        doFetch({
            action: 'doCastPromo',
            id: $(t.target).attr('pid'),
            to: precp
        }).then(function(e) {
            if (e.status == 'ok') {
                M.toast({
                    html: 'Sent promotion',
                    displayLength: 3000
                })
            } else {
                console.log(e);
            }
        });
    }
}

//Promotion image to b4
var imgB4 = ""

function readFile() {

    if (this.files && this.files[0]) {

        var FR = new FileReader();

        FR.addEventListener("load", function(e) {
            imgB4 = e.target.result;
        });

        FR.readAsDataURL(this.files[0]);
    }

}

document.getElementById("newPromo-image").addEventListener("change", readFile);

function doNewPromo() {
    var items = [];
    var x = document.querySelector('.promo-add-new-promotion2 ul');
    var selcItms = document.querySelector('.promo-add-new-promotion2 input').value.split(', ');
    var selcIds = new Array();
    var allItms = new Array();
    var boxes = $('#newPromoModal input[name=promoItems]:checked');

    var prodSum = 0
    for (i = 0; i < boxes.length; i++) {
        // console.log('ID is: ' + boxes[i].id);
        var productID = boxes[i].id;
        selcIds.push(parseInt(productID));
        // console.log('The item is added ' + $('li.circle input.' + productID).val() + ' times');
        var times = $('li.circle input.' + productID).val();
        for (j = 0; j < times; j++) {
            // console.log('Product is: ' + productID);
            for (product in getAllProducts) {
                if (getAllProducts[product].id == productID) {
                    prodSum += parseInt(getAllProducts[product].price)
                }
            }
        }
    }
    $('.promoState').each(function() {
        var selectState = this.checked;
        if (selectState == true) {
            selectedState = this.id;
        }
    });

    M.toast({
        html: 'Adding promotion. Please wait',
        classes: 'promoWaitToast',
        displayLength: 5000
    })
    if (prodSum > shopBalance) {
        M.toast({
            html: 'Error! Insufficient funds'
        })
        getInsufficientFundsOrderbook(JSON.stringify(prodSum))
    } else {
        productList = getAllProducts;
        plAr = [];
        for (var i = 0, plAr = plAr; i < productList.length; ++i) {
            plAr.push(productList[i].name)
        }
        if (plAr.indexOf(document.querySelector('#newPromo-name').value) == -1) {
            doFetch({
                action: 'doNewPromo',
                ownerid: JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).id,
                name: document.querySelector('#newPromo-name').value,
                desc: document.querySelector('#newPromo-desc').value,
                image: imgB4,
                items: selcIds,
                discount: document.querySelector('#newPromo-discount').value,
                offers: document.querySelector('#newPromo-offers').value,
                state: selectedState
            }).then(function(e) {
                if (e.status == 'ok') {
                    M.toast({
                        html: 'Added new promotion successfully',
                        displayLength: 3000
                    })
                    refreshPromotions();
                    $('#newPromoModal').modal('close');
                } else {
                    console.log(e);
                }
            });

        } else {
            M.toast({
                html: 'Ooops! Seems you have a similar promotion',
                displayLength: 3000
            })
            $('.prodWaitToast').remove();
        }
    }

}

//Remove Promotion
$(document).on('touchstart click', '.removePromo', function(event) {
    parent_div = $(this).parent().parent().parent().parent().parent().parent().parent().remove();
    id = $(this).parent().parent().attr("fid");
    M.toast({
        html: 'Removing promotion. Please wait',
        classes: 'promoWaitToast',
        displayLength: 10000
    })
    doFetch({
        action: 'removePromotion',
        id: id
    }).then(function(e) {
        if (e.status == 'ok') {
            $('.promoWaitToast').remove();
            M.toast({
                html: 'Promotion Removed Successfully',
                displayLength: 3000
            })
            refreshPromotions();
            parent_div
        } else {
            console.log(e);
        }
    });
});




//Promotion Form Validation
$('.doAddNewPromo').click(function(e) {
    promo_name = $('#newPromo-name').val();
    promo_description = $('#newPromo-desc').val();
    promo_image = $('#newPromo-image').val();
    promo_discount = $('#newPromo-discount').val();
    promo_minBuyer = $('#newPromo-offers').val();
    isValid = true;
    if (promo_name == '' || promo_name == null) {
        M.toast({
            html: 'Ooops! Please enter promotion name',
            displayLength: 3000
        })
    } else if (promo_description == '' || promo_description == null) {
        M.toast({
            html: 'Ooops! Please enter promotion description',
            displayLength: 3000
        })
    } else if (promo_discount == '' || promo_discount == null) {
        M.toast({
            html: 'Ooops! Please enter discount',
            displayLength: 3000
        })
    } else if (promo_minBuyer == '' || promo_minBuyer == null) {
        M.toast({
            html: 'Ooops! Please enter minimum buyers',
            displayLength: 3000
        })
    } else {
        if (promotionLength >= 3) {
            alert(promotionLength)
            M.toast({
                html: 'Maximum number of promotions reached!',
                displayLength: 3000
            })
        } else {
            doNewPromo();
        }
    }
});


//Check Store Balance
$(document).on("click", "#promoTab", function() {
    doFetch({
        action: "getPromotions",
        id: localStorage.getItem("soko-active-store")
    }).then(function(e) {
        var promoLength = e.promotions.length
        var promoStatus = e.promotions[0].promoStatus
        if (promoLength != 0) {
            if (promoStatus == "inactive") {
                M.toast({
                    html: 'Promotions are inactive<span id="openStoreTokenModal" class="right" style="color: yellow; border: solid yellow 1px; padding: 0px 10px; border-radius: 3px;">activate</span>',
                    displayLength: 3000,
                    classes: "tokenToast"
                })

            }
        }
        console.log(e.promotions.length)
    })
    addPromoItems();
});


$(document).on('touchstart click', '.clickPromo', function() {
    $(".activePage").html("")
});

//Hide Card Reveal on Promotion Page
//$(document).on('touchstart click', '.backBtnPromo', function (event) {
//    $(this).parent().parent().hide();
//});

//Prevent dropdown content on Promotion page closing on touchstart
$(document).on('touchstart click', '.multiple-select-dropdown', function(event) {
    event.stopPropagation();
});

//var shroot = document.querySelectorAll(".doAddNewPromo");
//for (var i = 0; i < shroot.length; ++i) {
//    shroot[i].addEventListener("touchstart", doNewPromo, false);
//};

$(document).on('touchstart click', '#openStoreTokenModal', function() {
    creditTopup = "1000 " + baseCd;
    getInsufficientFundsOrderbook();
});

//Update promo
function updateProm(t) {
    console.log($(t.target));
    var name = $(t.target).attr('pritm');
    var val = $(t.target).val();
    var switchID = $(t.target).attr('id')
    var value = document.getElementById(switchID).checked

    //console.log(value)
    if (name == "public") {
        doFetch({
            action: 'doEditPromo',
            id: $(t.target).attr('fid'),
            prop: "public",
            val: name
        }).then(function(e) {
            if (e.status == 'ok') {
                M.toast({
                    html: 'Modified ' + name + '..',
                    displayLength: 3000
                })
            } else {
                M.toast({
                    html: 'Please try again..',
                    displayLength: 2000
                })
            }
        });

    } else if (name == "semi-public") {
        doFetch({
            action: 'doEditPromo',
            id: $(t.target).attr('fid'),
            prop: "public",
            val: name
        }).then(function(e) {
            if (e.status == 'ok') {
                M.toast({
                    html: 'Modified ' + name + '..',
                    displayLength: 3000
                })
            } else {
                M.toast({
                    html: 'Please try again..',
                    displayLength: 2000
                })
            }
        });

    } else if (name == "private") {
        doFetch({
            action: 'doEditPromo',
            id: $(t.target).attr('fid'),
            prop: "public",
            val: name
        }).then(function(e) {
            if (e.status == 'ok') {
                M.toast({
                    html: 'Modified ' + name + '..',
                    displayLength: 3000
                })
            } else {
                M.toast({
                    html: 'Please try again..',
                    displayLength: 2000
                })
            }
        });

    } else if (name == "customImage") {
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
            img.onload = function() {
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
                    action: 'doEditPromo',
                    id: $(t.target).parents('form[class^="col"]').attr('fid'),
                    prop: name,
                    val: val
                }).then(function(e) {
                    if (e.status == 'ok') {
                        // document.querySelector('#prodImg-holda-' + prid).src = val;
                        M.toast({
                            html: 'Modified ' + name + '..',
                            displayLength: 3000
                        })
                    } else {
                        M.toast({
                            html: 'Please try again..',
                            displayLength: 2000
                        })
                    }
                });
            };
            img.src = URL.createObjectURL(file);
        }

    } else {
        doFetch({
            action: 'doEditPromo',
            id: $(t.target).parents('form[class^="col"]').attr('fid'),
            prop: name,
            val: val
        }).then(function(e) {
            if (e.status == 'ok') {
                M.toast({
                    html: 'Modified ' + name + '..',
                    displayLength: 3000
                })
            } else {
                M.toast({
                    html: 'Please try again..',
                    displayLength: 2000
                })
            }
        });
    }
}
