$(document).on("click", "#feedBack", function() {
    $('#content > .container > div').css('display', 'none');
    $('#content > .container > .feedbackPage').css('display', 'block');
    $(".activePage").html("Feedback")
});

function storeFeed() {
    doFetch({
        action: 'getStoreFeed',
        store: localStorage.getItem('soko-active-store')
    }).then(function(e) {
        if (e.status == 'ok') {
            $("#feedbackContentPage").css("display", "block");
            //Populate feedback
            var feedBack = e.reqs
            try {
                // $(".feedback").html("");
                if (feedBack.length == undefined) {
                    $("#feedbackContentPage").html('<div style=" width: 100px; display: block; margin-left: auto; margin-right: auto; margin-top: 25px;"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 16 16"><path fill="#444444" d="M8 1c3.9 0 7 3.1 7 7s-3.1 7-7 7-7-3.1-7-7 3.1-7 7-7zM8 0c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8v0z"></path><path fill="#444444" d="M7 6c0 0.552-0.448 1-1 1s-1-0.448-1-1c0-0.552 0.448-1 1-1s1 0.448 1 1z"></path><path fill="#444444" d="M11 6c0 0.552-0.448 1-1 1s-1-0.448-1-1c0-0.552 0.448-1 1-1s1 0.448 1 1z"></path><path fill="#444444" d="M11.3 12.3c-0.7-1.1-2-1.8-3.3-1.8s-2.6 0.7-3.3 1.8l-0.8-0.6c0.9-1.4 2.4-2.2 4.1-2.2s3.2 0.8 4.1 2.2l-0.8 0.6z"></path></svg></div><p style="text-align:center;">You do not have any feedback.</p>');
                    $(".sc-gauge").css("display", "none")
                    $(".feedback").css("display", "none")
                } else {
                    $("#feedbackContentPage").html('');
                    $(".sc-gauge").css("display", "block")
                    $(".feedback").css("display", "block")

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
                        $(".feedback").append('<ul style="position:relative;margin: 5px; background: white; padding: 10px; border-radius: 3px;"> <li><span style="font-weight: bold">User:</span>' + user + '</li><li><span style="font-weight: bold">Product:</span> ' + product + ' / 5</li><li><span style="font-weight: bold">Service:</span> ' + service + ' / 5</li><li><span style="font-weight: bold">Message:</span> <span class="shareMsg">' + message + '</span></li><svg class="shareFeedback" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 473.932 473.932" style="enable-background:new 0 0 473.932 473.932; position:absolute;right:0px;position: absolute; right: 15px; width: 30px; top: 10px;" xml:space="preserve"><path fill="#ffab40" d="M385.513,301.214c-27.438,0-51.64,13.072-67.452,33.09l-146.66-75.002 c1.92-7.161,3.3-14.56,3.3-22.347c0-8.477-1.639-16.458-3.926-24.224l146.013-74.656c15.725,20.924,40.553,34.6,68.746,34.6 c47.758,0,86.391-38.633,86.391-86.348C471.926,38.655,433.292,0,385.535,0c-47.65,0-86.326,38.655-86.326,86.326 c0,7.809,1.381,15.229,3.322,22.412L155.892,183.74c-15.833-20.039-40.079-33.154-67.56-33.154 c-47.715,0-86.326,38.676-86.326,86.369s38.612,86.348,86.326,86.348c28.236,0,53.043-13.719,68.832-34.664l145.948,74.656 c-2.287,7.744-3.947,15.79-3.947,24.289c0,47.693,38.676,86.348,86.326,86.348c47.758,0,86.391-38.655,86.391-86.348 C471.904,339.848,433.271,301.214,385.513,301.214z"/></svg></ul>');
                    }
                }
            } catch (err) {
                console.log(err)
            }
            $(".shareFeedback").unbind().click(function(e) {
                var shareMsg = $(this).parent().children()[3].children[1].innerHTML
                if (navigator.share) {
                    navigator.share({
                            title: 'Feedback',
                            text: shareMsg,
                        })
                        .then(() => console.log('Successful share'))
                        .catch((error) => console.log('Error sharing', error));
                }
            });
        } else {
            //Error populating feedback
            $("#feedbackContentPage").html('<div style=" width: 100px; display: block; margin-left: auto; margin-right: auto; margin-top: 25px;"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 16 16"><path fill="#444444" d="M8 1c3.9 0 7 3.1 7 7s-3.1 7-7 7-7-3.1-7-7 3.1-7 7-7zM8 0c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8v0z"></path><path fill="#444444" d="M7 6c0 0.552-0.448 1-1 1s-1-0.448-1-1c0-0.552 0.448-1 1-1s1 0.448 1 1z"></path><path fill="#444444" d="M11 6c0 0.552-0.448 1-1 1s-1-0.448-1-1c0-0.552 0.448-1 1-1s1 0.448 1 1z"></path><path fill="#444444" d="M11.3 12.3c-0.7-1.1-2-1.8-3.3-1.8s-2.6 0.7-3.3 1.8l-0.8-0.6c0.9-1.4 2.4-2.2 4.1-2.2s3.2 0.8 4.1 2.2l-0.8 0.6z"></path></svg></div><p style="text-align:center;">Error Populating feedback. Please try again later</p>');
            $(".sc-gauge").css("display", "none")
            $(".feedback").css("display", "none")
        }
    })
}
