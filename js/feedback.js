$(document).on("click", "#feedBack", function () {
    $('#content > .container > div').css('display', 'none');
    $('#content > .container > .feedbackPage').css('display', 'block');
    $(".activePage").html("Feedback")
});

function storeFeed() {
    doFetch({
        action: 'getStoreFeed',
        store: localStorage.getItem('soko-active-store')
    }).then(function (e) {
        if (e.status == 'ok') {
            //Populate feedback
            var feedBack = e.reqs
            try {
                $(".feedback").html("")
                for (var i = 0; i < feedBack.length; ++i) {
                    var user;
                    var product = JSON.parse(feedBack[i].metrics).product;
                    var service = JSON.parse(feedBack[i].metrics).service;
                    var message = feedBack[i].msg;

                    for (var dg in deliveryGuys) {
                        var name = deliveryGuys[dg].name;
                        var id = deliveryGuys[dg].id;
                        if (feedBack[i].user == id) {
                            user = name
                        }
                    }
                    $(".feedback").append('<ul style="margin: 5px; background: white; padding: 10px; border-radius: 3px;"> <li><span style="font-weight: bold">User:</span>' + user + '</li><li><span style="font-weight: bold">Product:</span> ' + product + ' / 5</li><li><span style="font-weight: bold">Service:</span> ' + service + ' / 5</li><li><span style="font-weight: bold">Message:</span> ' + message + '</li></ul>');
                }
            } catch (err) {
                console.log(err)
            }
        } else {
            //Error populating feedback
            M.toast({
                html: 'Error! Try again later'
            })
        }
    }).catch(function (err) {

    });
}
