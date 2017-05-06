/**
 * Builds PaymentRequest for credit cards, but does not show any UI yet.
 *
 * @return {PaymentRequest} The PaymentRequest oject.
 */
function initPaymentRequest() {
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
                value: '10.00'
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
        onBuyClicked(request);
        request = initPaymentRequest3();
    });
    payButton3.setAttribute('style', 'display: inline;');
    payButton3.addEventListener('click', function () {
        onBuyClicked(request);
        request = initPaymentRequest2();
    });
} else {
    ChromeSamples.setStatus('This browser does not support web payments');
}
