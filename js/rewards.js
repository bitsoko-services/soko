//Fetch rate
function fetchRate() {
    fetchRates().then(function (e) {
        if (e.status == "ok") {
            coinList = e.data.data;
            for (var i in coinList) {
                var rate = coinList[i].coinRate;
                var roundOff = rate * e.data.baseEx;
                var mKobo = roundOff * 1000
                var xKobo = roundOff * 10000
                var cKobo = roundOff * 100000

                $("#fetchedRate").html(roundOff.toFixed(2));
                $("#M-kobo").html(mKobo.toFixed(0));
                $("#X-kobo").html(xKobo.toFixed(0));
                $("#C-kobo").html(cKobo.toFixed(0));
            }

        } else {
            console.log("error");
        }
    });
}

//Enable Loyalty
$('.loyaltyCls').click(function () {
    $('#loyaltyModal').modal('close');
});

function updateRewardpoints(t) {
    var rwditm = $(t.target).attr('rwditm');
    var name = $(t.target).attr('rwditm');
    var val = $(t.target).val();
    if (rwditm == "visitState") {
        if ($(this).prop("checked") == false) {
            $(".visitsCard").prop('disabled', true);
        } else {
            $(".visitsCard").prop('disabled', false);
        }
        doFetch({
            action: 'storeRewards',
            value: $(this).prop("checked"),
            prop: name,
        }).then(function (e) {
            if (e.status == 'ok') {} else {}
        });
    } else if (rwditm == "shareState") {
        if ($(this).prop("checked") == false) {
            $(".shareCard").prop('disabled', true);
        } else {
            $(".shareCard").prop('disabled', false);
        }
        doFetch({
            action: 'storeRewards',
            value: $(this).prop("checked"),
            prop: name,
        }).then(function (e) {
            if (e.status == 'ok') {} else {}
        });
    } else if (rwditm == "purchaseState") {
        if ($(this).prop("checked") == false) {
            $(".purchaseCard").prop('disabled', true);
        } else {
            $(".purchaseCard").prop('disabled', false);
        }
        doFetch({
            action: 'storeRewards',
            value: $(this).prop("checked"),
            prop: name,
        }).then(function (e) {
            if (e.status == 'ok') {} else {}
        });
    } else if (rwditm == "deliveryState") {
        if ($(this).prop("checked") == false) {
            $(".deliveryCard").prop('disabled', true);
        } else {
            $(".deliveryCard").prop('disabled', false);
        }
        doFetch({
            action: 'storeRewards',
            value: $(this).prop("checked"),
            prop: name,
        }).then(function (e) {
            if (e.status == 'ok') {} else {}
        });
    } else {
        doFetch({
            action: 'storeRewards',
            value: val,
            prop: name,
        }).then(function (e) {
            if (e.status == 'ok') {} else {}
        });
    }
}


//Call Back
function rewardsCallback() {
    var forEach = function (array, callback, scope) {
        for (var i = 0; i < array.length; i++) {
            callback.call(scope, i, array[i]); // passes back stuff we need
        }
    };
    var myNodeList = document.querySelectorAll('#rewardsPoints input');
    forEach(myNodeList, function (index, value) {
        value.addEventListener("change", updateRewardpoints);
    });
}

rewardsCallback()


//Buy Points
function initPaymentRequest() {
    let networks = ['mastercard', 'visa'];
    let types = ['debit', 'credit', 'prepaid'];
    let supportedInstruments = [{
        supportedMethods: networks,
  }, {
        supportedMethods: ['basic-card'],
        data: {
            supportedNetworks: networks,
            supportedTypes: types
        },
  }];

    let details = {
        total: {
            label: 'Loyalty Points',
            amount: {
                currency: 'KES',
                value: '100.00'
            }
        },
        displayItems: [
            {
                label: '10 points = ',
                amount: {
                    currency: 'KES',
                    value: '1.00'
                },
      },
    ],
    };

    return new PaymentRequest(supportedInstruments, details);
}

function initPaymentRequest2() {
    let networks = ['amex', 'diners', 'discover', 'jcb', 'mastercard', 'unionpay',
      'visa', 'mir'];
    let types = ['debit', 'credit', 'prepaid'];
    let supportedInstruments = [{
        supportedMethods: networks,
  }, {
        supportedMethods: ['basic-card'],
        data: {
            supportedNetworks: networks,
            supportedTypes: types
        },
  }];

    let details = {
        total: {
            label: 'Loyalty Points',
            amount: {
                currency: 'KES',
                value: '1000.00'
            }
        },
        displayItems: [
            {
                label: '10 points = ',
                amount: {
                    currency: 'KES',
                    value: '1.00'
                },
      },
    ],
    };

    return new PaymentRequest(supportedInstruments, details);
}

function initPaymentRequest3() {
    let networks = ['amex', 'diners', 'discover', 'jcb', 'mastercard', 'unionpay',
      'visa', 'mir'];
    let types = ['debit', 'credit', 'prepaid'];
    let supportedInstruments = [{
        supportedMethods: networks,
  }, {
        supportedMethods: ['basic-card'],
        data: {
            supportedNetworks: networks,
            supportedTypes: types
        },
  }];

    let details = {
        total: {
            label: 'Loyalty Points',
            amount: {
                currency: 'KES',
                value: '10000.00'
            }
        },
        displayItems: [
            {
                label: '10 points = ',
                amount: {
                    currency: 'KES',
                    value: '1.00'
                },
      },
    ],
    };

    return new PaymentRequest(supportedInstruments, details);
}

/**
 * Invokes PaymentRequest for credit cards.
 *
 * @param {PaymentRequest} request The PaymentRequest object.
 */
function onBuyClicked(request) {
    request.show().then(function (instrumentResponse) {
            sendPaymentToServer(instrumentResponse);
        })
        .catch(function (err) {
            ChromeSamples.setStatus(err);
        });
}

/**
 * Simulates processing the payment data on the server.
 *
 * @param {PaymentResponse} instrumentResponse The payment information to
 * process.
 */
function sendPaymentToServer(instrumentResponse) {
    // There's no server-side component of these samples. No transactions are
    // processed and no money exchanged hands. Instantaneous transactions are not
    // realistic. Add a 2 second delay to make it seem more real.
    window.setTimeout(function () {
        instrumentResponse.complete('success')
            .then(function () {
                document.getElementById('result').innerHTML =
                    instrumentToJsonString(instrumentResponse);
            })
            .catch(function (err) {
                ChromeSamples.setStatus(err);
            });
    }, 2000);
}

/**
 * Converts the payment instrument into a JSON string.
 *
 * @private
 * @param {PaymentResponse} instrument The instrument to convert.
 * @return {string} The JSON string representation of the instrument.
 */
function instrumentToJsonString(instrument) {
    let details = instrument.details;
    details.cardNumber = 'XXXX-XXXX-XXXX-' + details.cardNumber.substr(12);
    details.cardSecurityCode = '***';

    return JSON.stringify({
        methodName: instrument.methodName,
        details: details,
    }, undefined, 2);
}

const payButton = document.getElementById('buy100');
const payButton2 = document.getElementById('buy1000');
const payButton3 = document.getElementById('buy10000');

payButton.setAttribute('style', 'display: none;');
payButton2.setAttribute('style', 'display: none;');
payButton3.setAttribute('style', 'display: none;');
if (window.PaymentRequest) {
    let request = initPaymentRequest();
    let request2 = initPaymentRequest2();
    let request3 = initPaymentRequest3();
    payButton.setAttribute('style', 'display: inline;');
    payButton.addEventListener('click', function () {
        onBuyClicked(request);
        request = initPaymentRequest();
    });
    payButton2.setAttribute('style', 'display: inline;');
    payButton2.addEventListener('click', function () {
        onBuyClicked(request2);
        request2 = initPaymentRequest2();
    });
    payButton3.setAttribute('style', 'display: inline;');
    payButton3.addEventListener('click', function () {
        onBuyClicked(request3);
        request3 = initPaymentRequest3();
    });
} else {
    console.log('This browser does not support web payments');
}
$(document).on("click", "#rewardsPage", function () {
    $(".navbar-color").css("box-shadow", "none");
});
