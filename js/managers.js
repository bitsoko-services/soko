$('.Managers').on('click', $('ul.autocomplete-content li'), function () {
    var value = $('#sokoMangers').val();
    if (value != '') {
        var managerSlct = $('#storeManagers').val();
        for (var i in deliveryGuys) {
            var name = deliveryGuys[i].name;
            var id = deliveryGuys[i].id;
            if (managerSlct == name) {
                doFetch({
                    action: 'managerLst',
                    store: localStorage.getItem('soko-active-store'),
                    do: 'add',
                    manager: id
                }).then(function (e) {
                    if (e.status == 'ok') {} else {}
                });
            }
        }
    }
});
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
                $(removeManager).remove();
            } else {}
        });
    });
    $('#noManagerBtn').on('click', function () {
        $('#removeManagerModal').modal('close');
    });
});


function managersID() {
    var mangagerIds = JSON.parse(JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).managers)[0]
    for (var i in deliveryGuys) {
        var name = deliveryGuys[i].name;
        var id = deliveryGuys[i].id;
        var icon = deliveryGuys[i].icon;
        if (mangagerIds == id) {
            $("#managersLst").append('<div class="chip removeManager" id="' + id + '"> <img src="' + icon + '"> ' + name + '<span style="    padding-left: 15px;font-size: 1rem;">x</span> </div>');
        }
    }
}
managersID()

$(document).ready(function () {
    $('#managersClickEvent').click(function () {
        $("#managersClicked").click();
    })
});
