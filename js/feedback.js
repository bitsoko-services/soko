$(document).on("click", "#feedBack", function () {
    $('#content > .container > div').css('display', 'none');
    $('#content > .container > .feedback').css('display', 'block');
    $(".activePage").html("Feedback")
    storeFeed();
    $('.sidenav').sidenav("close");
});
function storeFeed(){
    
}