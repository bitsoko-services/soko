//Fetch rate
var finalRate;
var cKobo = ""
var xKobo = ""

function fetchRate() {
    var storeRwrdCoin = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).rewardCoin
    fetchRates().then(function (e) {
        if (e.status == "ok") {
            coinList = e.data.data;
            if (storeRwrdCoin == "") {
                var rate = coinList[0].coinRate;
                var bankCharges = 5; // %
                finalRate = rate * (e.data.baseEx + ((e.data.baseEx * bankCharges) / 100)); //inclusive bank charges

                $("#fetchedRate").html(finalRate.toFixed(2));
            } else {}

            if (window.PaymentRequest) {
                payButton.setAttribute('style', 'display: inline;');
                payButton.addEventListener('click', function () {
                    initPaymentRequest().show().then(function (instrumentResponse) {
                            sendPaymentToServer(instrumentResponse);
                        })
                        .catch(function (err) {
                            ChromeSamples.setStatus(err);
                        });
                });
            } else {
                console.log('This browser does not support web payments');
            }

        } else {
            console.log("error");
        }
    });
}
fetchRate()

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
                value: document.getElementById('buyPoints').value * finalRate
            }
        },
        displayItems: [
            {
                label: '1 point = ',
                amount: {
                    currency: 'KES',
                    value: finalRate.toFixed(2);
                },
      },
    ],
    };

    return new PaymentRequest(supportedInstruments, details);
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

payButton.setAttribute('style', 'display: none;');

$(document).on("click", "#rewardsPage", function () {
    $(".navbar-color").css("box-shadow", "none");
});
