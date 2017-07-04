$('.Managers').on('click', $('ul.autocomplete-content li'), function () {
    var value = $('#sokoMangers').val();
    if (value != '') {
        var managerSlct = $('#sokoMangers').val();
        //        $("#membersLst").append('<div class="chip removeManager"> <img src="' + icon + '"> ' + name + ' </div>');
        doFetch({
            action: 'managerLst',
            store: localStorage.getItem('soko-active-store'),
            do: 'add',
            manager: managerSlct
        }).then(function (e) {
            if (e.status == 'ok') {} else {}
        });
    }
});

function storeManagers() {
    $('.removeManager').click(function () {
        var removeManager = $(this)
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
}
$(document).ready(function () {
    $('#managersClickEvent').click(function () {
        $("#managersClicked").click();
    })
});
