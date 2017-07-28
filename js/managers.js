$('.Managers').on('click', $('ul.autocomplete-content li'), function () {
    var value = $('#sokoMangers').val();
    if (value != '') {
        var managerSlct = $('#storeManagers').val();
        for (var i in deliveryGuys) {
            var name = deliveryGuys[i].name;
            var id = deliveryGuys[i].id;
            var icon = deliveryGuys[i].icon;
            if (managerSlct == name) {
                var thisName = name;
                var thisId = id;
                var thisIcon = icon;
                doFetch({
                    action: 'managerLst',
                    store: localStorage.getItem('soko-active-store'),
                    do: 'add',
                    manager: id
                }).then(function (e) {
                    if (e.status == 'ok') {
                        $("#managersLst").append('<div id="' + thisId + '" class="chip removeManager"> <img src="' + thisIcon + '"> ' + thisName + ' </div>');
                        $("#storeManagers").val("");
                    } else {}
                });
            }
        }
    }
});

function getManager() {
    var getMngr = JSON.parse(JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).managers);
    for (var i = 0; i < getMngr.length; i++) {
        var mngrId = getMngr[i].id;
        console.log(mngrId);
        for (var t in deliveryGuys) {
            var name = deliveryGuys[t].name;
            var id = deliveryGuys[t].id;
            var icon = deliveryGuys[t].icon;
            if (mngrId == id) {
                $("#managersLst").append('<div id="' + id + '" class="chip removeManager"> <img src="' + icon + '"> ' + name + ' </div>');
            }
        }
    }
}


var managerId = JSON.parse(localStorage.getItem("soko-owner-id"))
var shopOwner = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).owner
if (managerId != shopOwner) {
    $("#settingsOpt").hide()
}

$(document).on("click", ".removeManager", function () {
    var removeManager = $(this);
    var id = $(this).attr("id")
    $('#removeManagerModal').modal('open');
    $('#yesManagerBtn').on('click', function () {
        $('#removeMemberModal').modal('close');
        doFetch({
            action: 'storeManagers',
            store: localStorage.getItem('soko-active-store'),
            do: 'remove',
            data: id
        }).then(function (e) {
            if (e.status == 'ok') {
                $(this).remove();
            } else {}
        });
    });
    $('#noManagerBtn').on('click', function () {
        $('#removeManagerModal').modal('close');
    });
});

function managersID() {
    try {
        var mangagerIds = "";

        for (var i = 0; i < mangagerIds.length; i++) {
            for (var i in deliveryGuys) {
                var name = deliveryGuys[i].name;
                var id = deliveryGuys[i].id;
                var icon = deliveryGuys[i].icon;
                if (mangagerIds == id) {
                    $("#managersLst").html("");
                    $("#managersLst").append('<div class="chip removeManager" id="' + id + '"> <img src="' + icon + '"> ' + name + '<span style="    padding-left: 15px;font-size: 1rem;">x</span> </div>');
                }
            }
        }
    } catch (err) {
        console.log(err);
    }
}
managersID()

$(document).ready(function () {
    $('#managersClickEvent').click(function () {
        $("#managersClicked").click();
    })
});
