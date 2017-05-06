function onBuyClicked() {
        if (!window.PaymentRequest) {
            // PaymentRequest API is not available. Forwarding to
            // legacy form based experience.
            location.href = '/checkout';
            return;
        }

        // Supported payment methods
        var supportedInstruments = [{
            supportedMethods: ['basic-card']
            data: {
                supportedNetworks: [
              'visa', 'mastercard', 'amex', 'discover',
              'diners', 'jcb', 'unionpay'
            ]
            }
      }];

        // Checkout details
        var details = {
            displayItems: [{
                label: 'Original donation amount',
                amount: {
                    currency: 'USD',
                    value: '65.00'
                }
        }, {
                label: 'Friends and family discount',
                amount: {
                    currency: 'USD',
                    value: '-10.00'
                }
        }],
            total: {
                label: 'Total due',
                amount: {
                    currency: 'USD',
                    value: '55.00'
                }
            }
        };

        // 1. Create a `PaymentRequest` instance
        var request = new PaymentRequest(supportedInstruments, details);

        // 2. Show the native UI with `.show()`
        request.show()
            // 3. Process the payment
            .then(result => {
                // POST the payment information to the server
                return fetch('/pay', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(result.toJSON())
                }).then(response => {
                    // 4. Display payment results
                    if (response.status === 200) {
                        // Payment successful
                        return result.complete('success');
                    } else {
                        // Payment failure
                        return result.complete('fail');
                    }
                }).catch(() => {
                    return result.complete('fail');
                });
            });
}

document.querySelector('#buy100').addEventListener('click', onBuyClicked);
