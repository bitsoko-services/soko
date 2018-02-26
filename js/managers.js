//Show Hide Managers
$(document).on("click", "#showHideMngr", function () {
    var mngrState = $("#showHideMngr").prop("checked");
    doFetch({
        action: 'showHideManagers',
        id: localStorage.getItem('soko-owner-id'),
        data: mngrState
    }).then(function (e) {
        if (e.status == 'ok') {} else {}
    });
})

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
                        Materialize.toast('' + thisName + ' added as a manager', 3000);
                    } else {}
                });
            }
        }
    }
});

//Open Managers Page
$(document).on("click", "#opnMngPg", function () {
    $('#content > .container > div').css('display', 'none');
    $('#content > .container > .Managers').css('display', 'block');
    $(".activePage").html("Managers")
})

function getManager() {
    $("#managersLst").html("")
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
try {
    var shopOwner = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).owner
} catch (err) {
    console.log(err);
    var shopOwner = null
}
//var shopOwner = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).owner
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
            action: 'managerLst',
            store: localStorage.getItem('soko-active-store'),
            do: 'remove',
            manager: id
        }).then(function (e) {
            if (e.status == 'ok') {
                removeManager.remove();
                $("#removeManagerModal").modal("close");
                Materialize.toast('Manager removed successfully', 3000);
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
