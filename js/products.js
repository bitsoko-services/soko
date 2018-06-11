var getAllProducts;

function refreshProducts() {
    doFetch({
        action: 'getProducts',
        id: localStorage.getItem('soko-active-store')
    }).then(function (e) {
        getAllProducts = e.products
        console.log(e);
        getObjectStore('data', 'readwrite').put(JSON.stringify(e.products), 'soko-store-' + localStorage.getItem('soko-active-store') + '-products');
        productsUpdater();
        promoCreator();
        populateProductCategories();
    }).catch(function (err) {
        productsUpdater();
        promoCreator();
    });
}

function addManagers() {
    $(".prodactsPage").one("click", function () {
        var noOfMngrs = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).managers
        if (noOfMngrs == "[]") {
            $("#dlvryHelpModal").modal("open")
        }
    });
}


//Products Form Validation
$('#submitProdForm').click(function (e) {
    name_ = $('#name').val();
    description_ = $('#description').val();
    image_ = $('#image').val();
    amount_ = $('#amount').val();
    prodCy_ = $('#prod-cy').val();
    isValid = true;
    if (name_ == '' || name_ == null) {
        M.toast({
            html: 'Ooops! Please enter product name',
            displayLength: 3000
        })
        $('#name').css({
            "border-bottom": "1px solid red",
            "background": ""
        });
    } else if (description_ == '' || description_ == null) {
        M.toast({
            html: 'Ooops! Please enter product description',
            displayLength: 3000
        })
        $('#description').css({
            "border-bottom": "1px solid red",
            "background": ""
        });
    } else if (image_ == '' || image_ == null) {
        M.toast({
            html: 'Ooops! Please add image',
            displayLength: 3000
        })
        $('#description').css({
            "border-bottom": "1px solid red",
            "background": ""
        });
    } else if (amount_ == '' || amount_ == null) {
        M.toast({
            html: 'Ooops! Please enter amount',
            displayLength: 3000
        })
        $('#amount').css({
            "border-bottom": "1px solid red",
            "background": ""
        });
    } else if (prodCy_ == '' || prodCy_ == null) {
        M.toast({
            html: 'Ooops! Please enter quantity',
            displayLength: 3000
        })
        $('#prodCy').css({
            "border-bottom": "1px solid red",
            "background": ""
        });
    } else {
        var shroot = document.querySelectorAll(".addProduct");
        addProduct();
        $("#name, #description, #image, #amount, #prodCy").css({
            "border-bottom": "2px solid green",
            "background": ""
        });
    }
});
$(document).on("click", "#addCategory", function () {
    var categoryName = $("#categoryName").val();
    var indexOfCat = categoryList.indexOf(categoryName);
    console.log(categoryList.length)
    console.log(indexOfCat)

    if (indexOfCat >= 0) {
        M.toast({
            html: 'Ooops! That category already exist',
            displayLength: 3000
        })
        $("#categoryName").css("border-bottom", "solid 1px red");
    } else if (categoryName == "") {
        M.toast({
            html: 'Ooops! Please enter a product',
            displayLength: 3000
        })
        $("#categoryName").css("border-bottom", "solid 1px red");
    } else if ($(".categoryChip").length >= 5) {
        M.toast({
            html: 'Ooops! You have reached the maximum number of categories',
            displayLength: 3000
        })
        $("#categoryName").css("border-bottom", "solid 1px red");
    } else {
        addProdCat()
    }
});

$(document).on('touchstart click', '.addFirstProdModal', function (event) {
    $('#add-product').modal('open');
    $('#firstProdModal').modal('close');
});
$(document).on('touchstart click', '.newProdBtn', function (event) {
    //    $('#add-product').modal('open');
    $('.fixed-action-btn').floatingActionButton("close");
});
$(document).on('touchstart click', '.newProdBtn', function (event) {
    //    $('#newSponsoredProduct').modal('open');
    $('.fixed-action-btn').floatingActionButton("close");
});
//Remove Category
$(document).on("click", ".categoryChip", function () {
    var selectedCategory = $(this)
    var categoryName = $(this)[0].outerText;
    $("#catgryName").text(categoryName)
    $("#removeCategoryModal").show();
    $(document).on("click", "#rmvCatgryYesBtn", function () {
        M.toast({
            html: 'Removing category. Please wait',
            classes: 'categoryName',
            displayLength: 10000
        })
        doFetch({
            action: 'manageCategories',
            store: localStorage.getItem('soko-active-store'),
            do: 'remove',
            name: categoryName
        }).then(function (e) {
            if (e.status == 'ok') {
                $(selectedCategory).remove();
                $('.categoryName').remove();
                $("#removeCategoryModal").hide();
                M.toast({
                    html: 'Category removed successfully',
                    displayLength: 3000
                })
            } else {
                console.log(e);
            }
        });
    })
    $(document).on("click", "#rmvCatgryNoBtn", function () {
        $("#removeCategoryModal").hide();
    })
})
$('#dlvryPage').click(function () {
    $("#managersClickEvent").click();
})
$(".prodactsPage").one("click", function () {
    populateProductCategories();
});
$(document).on('touchstart click', '.prodactsPage', function () {
    $(".activePage").html("Products")
});

$(document).on('touchstart click', '#yesSponsoredBtn', function (event) {
    var sponsoredID = $("#rmvSpnsrdProd").attr("sid");
    $(this).unbind(event);
    doFetch({
        action: 'removeSponsoredProduct',
        store: localStorage.getItem('soko-active-store'),
        do: 'remove',
        id: sponsoredID
    }).then(function (e) {
        if (e.status == 'ok') {
            $("#rmvSpnsrdProd").hide();
            document.getElementById(id).remove();
            document.getElementById("sprdprod_" + id).remove();
            M.toast({
                html: 'Sponsored product removed successfully',
                displayLength: 3000
            })
        } else {}
    });
});
$(document).on('touchstart click', '#noSponsoredBtn', function (event) {
    $("#rmvSpnsrdProd").hide();
});

$('#spnsrdModal').on('click', $('ul.autocomplete-content li'), function () {
    var value = $('.sponsoredPrd').val();
    if (value != '') {
        var sponsoredProduct = $('.sponsoredPrd').val();
        for (var i in sponProds) {
            var name = sponProds[i].name;
            var id = sponProds[i].id;
            var price = sponProds[i].price;
            if (sponsoredProduct == name + " - " + price) {
                M.toast({
                    html: 'Adding sponsored produc',
                    classes: 'spnsrdTst',
                    displayLength: 10000
                })
                doFetch({
                    action: 'addSponsoredProduct',
                    store: localStorage.getItem('soko-active-store'),
                    do: 'add',
                    id: id
                }).then(function (e) {
                    if (e.status == 'ok') {
                        $(".spnsrdTst").remove();
                        $('#spnsrdModal').modal('close');
                        M.toast({
                            html: 'Sponsored product added successfully',
                            displayLength: 3000
                        })
                    } else {}
                });
            }
        }
    }
});


var prodUID;

function productsUpdater() {
    getObjectStore('data', 'readwrite').get('soko-store-' + localStorage.getItem('soko-active-store') + '-products').onsuccess = function (event) {
        var reqs = event.target.result;
        try {
            reqs = JSON.parse(reqs);
        } catch (err) {
            reqs = []
        };

        $(".products-collapsible").html('');
        $(".allProdCount").html(reqs.length);
        if (reqs.length == 0) {
            console.log(reqs.length)
            var html = ' <li class="collection-item avatar" style="opacity: 0.6;"><i class="mdi-action-shopping-basket grey circle"></i><div class="row">' + '<p class="collections-title"><strong>No products found</strong></p><p class="collections-content">add a product to this store below</p></div>' + '</li>';
            $(".products-collapsible").append($.parseHTML(html));
            $("#promotions>.fixed-action-btn>a").attr('href', '#firstProdModal');
            $('#firstProdModal').modal({
                dismissible: false,
                complete: function () {
                    $('#add-product').modal({
                        dismissible: false
                    });
                }
            }).modal('open');
            return;
        } else {
            $("#promotions>.fixed-action-btn>a").attr('href', '#newPromoModal');
            $('#firstProdModal').modal('close');
        }
        for (var i = 0; i < reqs.length; ++i) {
            prodUID = reqs
            if (reqs[i].sponsored == "true") {
                $(".products-collapsible").append('<li class="prdList" prid="' + reqs[i].id + '" style="margin: 0px 0px 10px 0p !important; background: rgb(255, 255, 255);">' + '<div class="prodImgDskt" id="prodImg-holda-' + reqs[i].id + '" style="background-size: cover;background-repeat: no-repeat;background-position: center;background-image:url(' + reqs[i].imagePath + ');width: 70px;height: 70px;float: left; margin: 10px"></div><div class="collapsible-header" style="padding: 5px 10px;line-height: 0;width: calc(100% - 90px);display:inline-block;border-bottom:none;"><div class="row"><div class="col s10"><p style="margin:0px;line-height:1.8rem;font-weight:bold;    white-space: nowrap; width: 85%; overflow: hidden; text-overflow: ellipsis;">' + reqs[i].name + ' <br><span style="font-weight:400;color:#7e7e7e;">' + reqs[i].description + '<br> Ksh. ' + reqs[i].price + '</span></p></div><div class="col s2"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;margin-top:10px;" xml:space="preserve"><path style="fill: rgba(29, 125, 116, 0.85);" d="M426.639,426.049l1.732-34.191c0.315-6.146,4.255-11.659,10.084-13.865l31.907-12.211 c13.944-5.278,24.58-16.544,29.07-30.647c4.648-14.102,2.679-29.306-5.514-41.754l-18.593-28.833c-3.467-5.2-3.466-11.818,0-17.017 l18.671-28.756c8.036-12.447,10.084-27.731,5.515-41.912c-4.648-14.102-15.127-25.21-29.149-30.566l-31.985-12.29 c-5.751-2.127-9.612-7.563-9.927-13.708l-1.891-34.192c0.079-0.71-0.078-1.339-0.157-2.049 c-1.182-14.102-8.509-26.786-19.932-35.214c-12.054-8.588-27.022-11.423-41.518-7.642l-33.167,8.902 c-5.908,1.654-12.211-0.393-16.071-5.2l-21.586-26.628C284.754,6.696,270.809,0,255.999,0c-14.811,0-28.756,6.696-38.051,18.198 l-21.664,26.707c-3.86,4.805-10.163,6.853-16.071,5.2l-33.167-8.902c-14.339-3.781-29.464-0.945-41.518,7.642 c-12.054,8.902-19.38,22.374-20.089,37.263l-1.891,34.191c-0.158,6.146-4.176,11.58-9.927,13.708l-31.986,12.29 c-13.865,5.357-24.501,16.465-29.149,30.567c-4.569,14.181-2.521,29.463,5.593,41.99l18.75,28.677 c3.309,5.2,3.309,11.818-0.078,17.095L18.08,293.382c-8.114,12.368-10.163,27.653-5.515,41.754 c4.491,14.102,15.205,25.447,29.07,30.647l32.064,12.211c5.672,2.206,9.612,7.721,9.927,13.865l1.734,34.192 c0,1.417,0.158,2.835,0.393,4.175c1.813,13.157,8.902,25.132,19.774,32.853c12.054,8.902,27.258,11.659,41.596,7.72l33.01-8.902 c5.988-1.575,12.29,0.472,16.229,5.357l21.586,26.628c9.217,11.58,23.162,18.119,38.13,18.119c14.811,0,28.755-6.539,38.13-18.119 l21.428-26.628c3.94-4.884,10.242-6.933,16.229-5.357l33.167,8.902c14.181,3.94,29.385,1.182,41.439-7.721 C418.525,454.488,425.851,441.017,426.639,426.049z"></path><path style="fill: #1d7d74;" d="M406.471,463.076c-12.054,8.902-27.258,11.659-41.439,7.721l-33.167-8.902 c-5.987-1.575-12.29,0.472-16.229,5.357l-21.428,26.628c-9.375,11.58-23.32,18.119-38.13,18.119 c-14.968,0-28.913-6.539-38.13-18.119l-21.586-26.628c-3.94-4.884-10.241-6.933-16.229-5.357l-33.01,8.902 c-14.338,3.94-29.542,1.182-41.596-7.72c-10.873-7.721-17.962-19.696-19.774-32.853L426.718,89.259l1.732,31.04 c0.315,6.144,4.176,11.58,9.927,13.708l31.985,12.29c14.022,5.357,24.501,16.465,29.149,30.566 c4.569,14.181,2.521,29.464-5.515,41.912l-18.671,28.756c-3.466,5.2-3.467,11.818,0,17.017l18.593,28.833 c8.193,12.448,10.163,27.653,5.514,41.754c-4.49,14.103-15.126,25.368-29.07,30.647l-31.907,12.211 c-5.83,2.206-9.769,7.721-10.084,13.865l-1.732,34.191C425.851,441.017,418.525,454.488,406.471,463.076z"></path><path style="fill: #ffab40;" d="M188.424,232.848c-18.431,0-33.424-14.993-33.424-33.424S169.993,166,188.424,166 s33.424,14.993,33.424,33.424S206.855,232.848,188.424,232.848z M188.424,199.445h0.109H188.424z M188.424,199.445h0.109H188.424z M188.424,199.431l0.109-0.001L188.424,199.431z M188.424,199.431l0.109-0.001L188.424,199.431z M188.424,199.431L188.424,199.431 L188.424,199.431z M188.424,199.431l0.109-0.001L188.424,199.431z M188.424,199.431l0.109-0.001L188.424,199.431z M188.424,199.431 l0.109-0.001L188.424,199.431z"></path><path style="fill:#F9A926;" d="M310.979,355.403c-18.431,0-33.424-14.993-33.424-33.424c0-18.431,14.993-33.424,33.424-33.424 s33.424,14.993,33.424,33.424C344.403,340.41,329.41,355.403,310.979,355.403z M310.979,322h0.109H310.979z M310.979,322h0.109 H310.979z M310.979,321.986l0.109-0.001L310.979,321.986z M310.979,321.986l0.109-0.001L310.979,321.986z M310.979,321.986 L310.979,321.986L310.979,321.986z M310.979,321.986l0.109-0.001L310.979,321.986z M310.979,321.986l0.109-0.001L310.979,321.986z M310.979,321.986l0.109-0.001L310.979,321.986z"></path><path style="fill:#FFC033;" d="M161.461,354.516c-6.524-6.524-6.528-17.106,0-23.634l157.562-157.562 c6.528-6.528,17.11-6.524,23.634,0c6.524,6.524,6.528,17.106,0,23.634L185.095,354.516 C178.568,361.043,167.985,361.04,161.461,354.516z"></path><path style="fill:#F9A926;" d="M185.095,354.516l157.562-157.562c6.528-6.528,6.524-17.11,0-23.634L161.461,354.516 C167.985,361.04,178.568,361.043,185.095,354.516z"></path></svg></div></div><div class="divider" style="background-color: #ffffff;"></div><span style="font-size:1em; font-weight:400; color:#616161;">' + '<i class="{{product.icon}}"></i><p style="margin:0px;display:none;">' + reqs[i].quantity + ' available</p><div class="divider" style="background-color: #ffffff;"></div></span></div><div class="collapsible-body" style="padding:0px;"><div style="width: 100%;text-align: center;margin: 20px 0px 0px;color: rgba(0,0,0,0.4);text-transform:uppercase;">sale information</div>' + '<form class="col s12" style="padding: 20px 30px;"><div class="row"><div class="input-field col s12">' + '<input disabled id="prodName-' + reqs[i].id + '" prnm="name" type="text" class="validate" prid="' + reqs[i].id + '" value="' + reqs[i].name + '"><label for="prodName-' + reqs[i].id + '" class="">Name</label></div></div>' + '<div class="row"><div class="input-field col s12"><input disabled prnm="description" placeholder="" value="' + reqs[i].description + '" id="prodDesc-' + reqs[i].id + '" type="text" class="validate" prid="' + reqs[i].id + '" min="0">' + '<label for="description" class="">Description</label></div></div><div class="row">' + '<div class="file-field input-field"><div class="btn opacitySelectedColor" style="background-color:#959595;"><span>image</span><input disabled id="prodImg-' + reqs[i].id + '" prid="' + reqs[i].id + '" prnm="image" type="file">' + '</div><div class="file-path-wrapper"><input prnm="ignor" class="file-path validate" type="text"></div></div>' + '<div class="input-field col s6"><input disabled prnm="price" placeholder="" value="' + reqs[i].price + '" id="prodPrice-' + reqs[i].id + '" type="number" class="validate" prid="' + reqs[i].id + '" min="0">' + '<label for="prodPrice-' + reqs[i].id + '" class="active">Price</label></div><div class="input-field col s6">' + '<div class="select-wrapper initialized"><select disabled id="prodMetric-' + reqs[i].id + '" prnm="metric" class="initialized" >' + '<option value="" disabled="" selected="">measurement</option>' + '<option value="1">per Kilogram</option>' + '<option value="2">per Piece</option>' + '</select></div></div></div><div style="width: 100%;text-align: center;margin: 20px 0px 0px;color: rgba(0,0,0,0.4);">availability</div>' + '<div class="row"><div class="input-field col s6">' + '<input placeholder="" prnm="rstQuantity" id="prodRestNo-' + reqs[i].id + '" type="number" value="' + reqs[i].rstQuantity + '" class="validate" min="0" prid="' + reqs[i].id + '" max="1000">' + '<label for="prodRestNo-' + reqs[i].id + '" class="active"> Quantity</label></div>' + '<div class="input-field col s6"><div class="select-wrapper initialized">' + '<select id="prodRestDur-' + reqs[i].id + '" prnm="rstDuration" class="initialized">' + '<option value="" disabled="" selected="' + reqs[i].rstDuration + '">duration</option>' + '<option value="day">per Day</option>' + '<option value="week">per Week</option>' + '<option value="month">per Month</option>' + '</select></div></div></div>' + '<div class="row" style="text-align: right;margin: 20px 0px;"> </div>' + '</form></div></li><div class="divider" style="margin-top:2px;"></div>');

                if (reqs[i].sponsored == "true") {
                    var sprndhtml = "";
                    var sprndhtml = '<div class="chip myBtn" id="sprdprod_' + reqs[i].id + '"  prid="' + reqs[i].id + '" ><img src="' + reqs[i].imagePath + '">' + reqs[i].name + ' <i><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 64 64" enable-background="new 0 0 64 64" style="width: 14px; margin: 0px 0px 0px 7px; height: 10px;"> <g> <path fill="#1D1D1B" d="M28.941,31.786L0.613,60.114c-0.787,0.787-0.787,2.062,0,2.849c0.393,0.394,0.909,0.59,1.424,0.59 c0.516,0,1.031-0.196,1.424-0.59l28.541-28.541l28.541,28.541c0.394,0.394,0.909,0.59,1.424,0.59c0.515,0,1.031-0.196,1.424-0.59 c0.787-0.787,0.787-2.062,0-2.849L35.064,31.786L63.41,3.438c0.787-0.787,0.787-2.062,0-2.849c-0.787-0.786-2.062-0.786-2.848,0 L32.003,29.15L3.441,0.59c-0.787-0.786-2.061-0.786-2.848,0c-0.787,0.787-0.787,2.062,0,2.849L28.941,31.786z"/> </g></svg></i></div>';
                }

                $(".sprndProd").empty().append($.parseHTML(sprndhtml));
                $(document).on('touchstart click', '#sprdprod_' + reqs[i].id, function (event) {
                    $("#rmvSpnsrdProd").attr("sid", id)
                    $('#removeSprdProd').modal('open');
                });
                var modal = document.getElementById('rmvSpnsrdProd');
                var btn = document.getElementById("sprdprod_" + reqs[i].id);
                var id = reqs[i].id
                btn.onclick = function () {
                    modal.style.display = "block";
                }


            } else if (reqs[i].sponsored == "") {
                $(".products-collapsible").append('<li class="prdList" id="' + reqs[i].id + '" prid="' + reqs[i].id + '" style="margin: 0px 0px 10px 0p !important; background: rgb(255, 255, 255);">' + '<div class="prodImgDskt" id="prodImg-holda-' + reqs[i].id + '" style="background-size: cover;background-repeat: no-repeat;background-position: center;background-image:url(' + reqs[i].imagePath + ');width: 70px;height: 70px;float: left; margin: 10px"></div><div class="collapsible-header" style="padding: 5px 10px;line-height: 0;width: calc(100% - 90px);display:inline-block;border-bottom:none;"><p style="margin:0px;line-height:1.8rem;font-weight:bold;    white-space: nowrap; width: 85%; overflow: hidden; text-overflow: ellipsis;">' + reqs[i].name + ' <br><span style="font-weight:400;color:#7e7e7e;">' + reqs[i].description + '<br> Ksh. ' + reqs[i].price + '</span></p><div class="divider" style="background-color: #ffffff;"></div><span style="font-size:1em; font-weight:400; color:#616161;">' + '<i class="{{product.icon}}"></i><p style="margin:0px;display:none;">' + reqs[i].quantity + ' available</p><div class="divider" style="background-color: #ffffff;"></div></span></div><div class="collapsible-body" style="padding:0px;"><div style="width: 100%;text-align: center;margin: 20px 0px 0px;color: rgba(0,0,0,0.4);text-transform:uppercase;">sale information</div>' + '<div class="switch" style=" float: right;"> <label><p style="text-align:center;margin-top:0px;">Make Public</p><input fid="' + reqs[i].id + '" id="publicProdSwitch_' + reqs[i].id + '" type="checkbox" prid="publicProd"> <span class="lever"></span></label> </div>' + '<form class="col s12" style="padding: 20px 30px;"><div class="row"><div class="input-field col s12">' + '<input id="prodName-' + reqs[i].id + '" prnm="name" type="text" class="validate" prid="' + reqs[i].id + '" value="' + reqs[i].name + '"><label for="prodName-' + reqs[i].id + '" class="">Name</label></div></div>' + '<div class="row"><div class="input-field col s12"><input prnm="description" placeholder="" value="' + reqs[i].description + '" id="prodDesc-' + reqs[i].id + '" type="text" class="validate" prid="' + reqs[i].id + '" min="0">' + '<label for="description" class="">Description</label></div></div><div class="row productCategoryChng"> <div class="input-field col s12"> <select  class="productCategoryChng changeCategory-' + reqs[i].id + '" catId="' + reqs[i].id + '"> <option value="" disabled selected>Choose a category</option> </select> <label>Category</label> </div></div><div class="row">' + '<div class="file-field input-field"><div class="btn opacitySelectedColor"><span>image</span><input id="prodImg-' + reqs[i].id + '" prid="' + reqs[i].id + '" prnm="image" type="file">' + '</div><div class="file-path-wrapper"><input prnm="ignor" class="file-path validate" type="text"></div></div>' + '<div class="input-field col s6"><input prnm="price" placeholder="" value="' + reqs[i].price + '" id="prodPrice-' + reqs[i].id + '" type="number" class="validate" prid="' + reqs[i].id + '" min="0">' + '<label for="prodPrice-' + reqs[i].id + '" class="active">Price</label></div><div class="input-field col s6">' + '<div class="select-wrapper initialized"><select id="prodMetric-' + reqs[i].id + '" prnm="metric" class="initialized" >' + '<option value="" disabled="" selected="">measurement</option>' + '<option value="1">per Kilogram</option>' + '<option value="2">per Piece</option>' + '</select></div></div></div><div style="width: 100%;text-align: center;margin: 20px 0px 0px;color: rgba(0,0,0,0.4);">availability</div>' + '<div class="row"><div class="input-field col s6">' + '<input placeholder="" prnm="rstQuantity" id="prodRestNo-' + reqs[i].id + '" type="number" value="' + reqs[i].rstQuantity + '" class="validate" min="0" prid="' + reqs[i].id + '" max="1000">' + '<label for="prodRestNo-' + reqs[i].id + '" class="active"> Quantity</label></div>' + '<div class="input-field col s6"><div class="select-wrapper initialized">' + '<select id="prodRestDur-' + reqs[i].id + '" prnm="rstDuration" class="initialized">' + '<option value="" disabled="" selected="' + reqs[i].rstDuration + '">duration</option>' + '<option value="day">per Day</option>' + '<option value="week">per Week</option>' + '<option value="month">per Month</option>' + '</select></div></div></div><div class="row"> <div class="input-field col s12" style="margin-top:0px;"> <input id="barcode-input" type="text" class="validate" prnm="barCode" prid="' + reqs[i].id + '" autocomplete="off" required=""> <label for="barcode-input" class="">Barcode ID</label> </div></div>' + '<div class="row" style="text-align: right;margin: 20px 0px;"> <a prid="' + reqs[i].id + '" class="opacitySelectedColor removeProduct waves-effect waves-light btn" style="float:left;">remove product</a> </div>' + '</form></div></li><div class="divider" style="margin-top:2px;"></div>');
                if (reqs[i].imagePath == "") {
                    //                    $("#prodImg-holda-" + reqs[i].id).css("background-image", "url(../images/sicon.png)");
                    console.log("No Image")
                }
            } else if (reqs[i].sponsored == null) {
                $(".products-collapsible").append('<li class="prdList" id="' + reqs[i].id + '" prid="' + reqs[i].id + '" style="margin: 0px 0px 10px 0p !important; background: rgb(255, 255, 255);">' + '<div class="prodImgDskt" id="prodImg-holda-' + reqs[i].id + '" style="background-size: cover;background-repeat: no-repeat;background-position: center;background-image:url(' + reqs[i].imagePath + ');width: 70px;height: 70px;float: left; margin: 10px"></div><div class="collapsible-header" style="padding: 5px 10px;line-height: 0;width: calc(100% - 90px);display:inline-block;border-bottom:none;"><p style="margin:0px;line-height:1.8rem;font-weight:bold;    white-space: nowrap; width: 85%; overflow: hidden; text-overflow: ellipsis;">' + reqs[i].name + ' <br><span style="font-weight:400;color:#7e7e7e;">' + reqs[i].description + '<br> Ksh. ' + reqs[i].price + '</span></p><div class="divider" style="background-color: #ffffff;"></div><span style="font-size:1em; font-weight:400; color:#616161;">' + '<i class="{{product.icon}}"></i><p style="margin:0px;display:none;">' + reqs[i].quantity + ' available</p><div class="divider" style="background-color: #ffffff;"></div></span></div><div class="collapsible-body" style="padding:0px;"><div style="width: 100%;text-align: center;margin: 20px 0px 0px;color: rgba(0,0,0,0.4);text-transform:uppercase;">sale information</div>' + '<div class="switch" style=" float: right;"> <label><p style="text-align:center;margin-top:0px;">Make Public</p><input fid="' + reqs[i].id + '" id="publicProdSwitch_' + reqs[i].id + '" type="checkbox" prid="publicProd"> <span class="lever"></span></label> </div>' + '<form class="col s12" style="padding: 20px 30px;"><div class="row"><div class="input-field col s12">' + '<input id="prodName-' + reqs[i].id + '" prnm="name" type="text" class="validate" prid="' + reqs[i].id + '" value="' + reqs[i].name + '"><label for="prodName-' + reqs[i].id + '" class="">Name</label></div></div>' + '<div class="row"><div class="input-field col s12"><input prnm="description" placeholder="" value="' + reqs[i].description + '" id="prodDesc-' + reqs[i].id + '" type="text" class="validate" prid="' + reqs[i].id + '" min="0">' + '<label for="description" class="">Description</label></div></div><div class="row"> <div class="input-field col s12"> <select  class="productCategory changeCategory-' + reqs[i].id + '" catId="' + reqs[i].id + '"> <option value="" disabled selected>Choose a category</option> </select> <label>Category</label> </div></div><div class="row">' + '<div class="file-field input-field"><div class="btn opacitySelectedColor"><span>image</span><input id="prodImg-' + reqs[i].id + '" prid="' + reqs[i].id + '" prnm="image" type="file">' + '</div><div class="file-path-wrapper"><input prnm="ignor" class="file-path validate" type="text"></div></div>' + '<div class="input-field col s6"><input prnm="price" placeholder="" value="' + reqs[i].price + '" id="prodPrice-' + reqs[i].id + '" type="number" class="validate" prid="' + reqs[i].id + '" min="0">' + '<label for="prodPrice-' + reqs[i].id + '" class="active">Price</label></div><div class="input-field col s6">' + '<div class="select-wrapper initialized"><select id="prodMetric-' + reqs[i].id + '" prnm="metric" class="initialized" >' + '<option value="" disabled="" selected="">measurement</option>' + '<option value="1">per Kilogram</option>' + '<option value="2">per Piece</option>' + '</select></div></div></div><div style="width: 100%;text-align: center;margin: 20px 0px 0px;color: rgba(0,0,0,0.4);">availability</div>' + '<div class="row"><div class="input-field col s6">' + '<input placeholder="" prnm="rstQuantity" id="prodRestNo-' + reqs[i].id + '" type="number" value="' + reqs[i].rstQuantity + '" class="validate" min="0" prid="' + reqs[i].id + '" max="1000">' + '<label for="prodRestNo-' + reqs[i].id + '" class="active"> Quantity</label></div>' + '<div class="input-field col s6"><div class="select-wrapper initialized">' + '<select id="prodRestDur-' + reqs[i].id + '" prnm="rstDuration" class="initialized">' + '<option value="" disabled="" selected="' + reqs[i].rstDuration + '">duration</option>' + '<option value="day">per Day</option>' + '<option value="week">per Week</option>' + '<option value="month">per Month</option>' + '</select></div></div></div><div class="row"> <div class="input-field col s12" style="margin-top:0px;"> <input id="barcode-input" type="text" class="validate" prnm="barCode" prid="' + reqs[i].id + '" autocomplete="off" required=""> <label for="barcode-input" class="">Barcode ID</label> </div></div>' + '<div class="row" style="text-align: right;margin: 20px 0px;"> <a prid="' + reqs[i].id + '" class="opacitySelectedColor removeProduct waves-effect waves-light btn" style="float:left;">remove product</a> </div>' + '</form></div></li><div class="divider" style="margin-top:2px;"></div>');
            }

            //            var prodCat = JSON.parse(JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store') + '')).productCategory);
            //            for (var pc = 0, prodCat = prodCat; pc < prodCat.length; ++pc) {
            //                categoryList.push(prodCat[pc].name);
            //                $(".changeCategory-501").append('<option class="remove" value="' +
            //                    prodCat[pc].name + '">' +
            //                    prodCat[pc].name + '</option>')
            //            }
            //            $('select').material_select();
            //            $('.remove').remove()

            //  var saleAmount=Math.ceil(parseFloat(reqs[i].amount)/100000000 *loCon.xrate*loCon.rate)+'/= '+loCon.symbol;
            // var saleTime=moment(reqs[i].posted).fromNow();
            //var html = ''+saleAmount+'</h5><small class="noteC-time text-muted">'+saleTime+'</small></div></div></a>';

            //Default Product Image
            if (reqs[i].imagePath == null) {
                $("#prodImg-holda-" + reqs[i].id).css("background-image", "url(../images/no-image-icon-15.png)");
                console.log("No Image")
            }
        }

        loadTheme();
        //        prodCategory();

        rmvProduct();

        //        $('.products-collapsible').collapsible();
        $('select').formSelect();
        M.updateTextFields();
        initProdCallback();
    }
}

//Populate Individual Product Category
function populateProductCategories() {
    setTimeout(function () {
        for (var i = 0; i < prodUID.length; ++i) {
            //Product Categories
            var checkProdCat = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).productCategory
            if (checkProdCat == "") {
                console.log("Can not find product categories")
            } else {
                var prodCat = JSON.parse(JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store') + '')).productCategory);
                for (var pc = 0; pc < prodCat.length; ++pc) {
                    $(".changeCategory-" + prodUID[i].id).append('<option class="remove">' + prodCat[pc].name + '</option>');
                }
            }
        }
        $('select').formSelect();
        //        $('.remove').remove();
        initialProdCat()
    }, 1000);
};

function updateProd(t) {
    //var prid = $(t.target).parent().parent().parent().parent().parent().attr('prid');
    var prid = $(t.target).attr('prid');
    var name = $(t.target).attr('prnm');
    var val = $(t.target).val();
    var switchID = $(t.target).attr('id')
    //    var value = document.getElementById("switchID").checked
    if (name == 'image') {
        var files = t.target.files;
        var file = files[0];
        if (file) {
            var canvas = document.querySelectorAll('#tmp-canvas > canvas')[0];
            var ctx = canvas.getContext("2d");
            name
            var cw = canvas.width;
            var ch = canvas.height;
            // limit the image to 150x100 maximum size
            var maxW = 480;
            var maxH = 320;
            var img = new Image;
            img.onload = function () {
                var iw = img.width;
                var ih = img.height;
                var scale = Math.min((maxW / iw), (maxH / ih));
                var iwScaled = iw * scale;
                var ihScaled = ih * scale;
                canvas.width = iwScaled;
                canvas.height = ihScaled;
                ctx.drawImage(img, 0, 0, iwScaled, ihScaled);
                val = canvas.toDataURL("image/png");
                doFetch({
                    action: 'doProdUpdate',
                    id: prid,
                    prop: name,
                    val: val
                }).then(function (e) {
                    if (e.status == 'ok') {
                        document.querySelector('#prodImg-holda-' + prid).src = val;
                        M.toast({
                            html: 'Modified ' + name + '..',
                            displayLength: 3000
                        })
                    } else {
                        console.log(e);
                    }
                });
            };
            img.src = URL.createObjectURL(file);
        }
    } else if (name == "ignor") {} else if (prid == "publicProd") {
        doFetch({
            action: 'doProdUpdate',
            id: $(t.target).attr('fid'),
            prop: prid,
            val: value
        }).then(function (e) {
            if (e.status == 'ok') {
                M.toast({
                    html: 'Modified ' + name + '..',
                    displayLength: 3000
                })
            } else {
                M.toast({
                    html: 'Please try again..',
                    displayLength: 2000
                })
            }
        });
    } else {
        doFetch({
            action: 'doProdUpdate',
            id: prid,
            prop: name,
            val: val
        }).then(function (e) {
            if (e.status == 'ok') {
                M.toast({
                    html: 'Modified ' + name + '..',
                    displayLength: 3000
                })
            } else {
                console.log(e);
            }
        });
    }
}
$(document).on("click touchstart", ".productCategoryChng ul li", function () {
    var clickCat = $(this)[0].childNodes[0].innerHTML
    var catId = $(this).parent().siblings("select").attr("catid");
    doFetch({
        action: 'doProdUpdate',
        id: catId,
        prop: "productCategory",
        val: clickCat
    }).then(function (e) {
        if (e.status == 'ok') {
            M.toast({
                html: 'Modified ' + name + '..',
                displayLength: 3000
            })
        } else {
            console.log(e);
        }
    });
});

function initProdCallback() {
    var forEach = function (array, callback, scope) {
        for (var i = 0; i < array.length; i++) {
            callback.call(scope, i, array[i]); // passes back stuff we need
        }
    };
    var myNodeList = document.querySelectorAll('.products-collapsible input');
    forEach(myNodeList, function (index, value) {
        value.addEventListener("change", updateProd);
    });
}

function addProduct() {
    var forEach = function (array, callback, scope) {
        for (var i = 0; i < array.length; i++) {
            callback.call(scope, i, array[i]); // passes back stuff we need
        }
    };
    var myNodeList = document.querySelectorAll('#add-product input');
    forEach(myNodeList, function (index, value) {
        // value.addEventListener("change", updateStore);
    });
    M.toast({
        html: 'Adding product. Please wait',
        classes: 'prodWaitToast',
        displayLength: 3000
    })
    doFetch({
        action: 'getProducts',
        id: localStorage.getItem('soko-active-store')
    }).then(function (e) {
        productList = e.products;
        if (typeof productList != 'object') {
            productList = [];
        }
        plAr = [];
        getObjectStore('data', 'readwrite').get('soko-store-' + localStorage.getItem('soko-active-store') + '-products').onsuccess = function (event) {
            var reqs = event.target.result;
            try {
                reqs = JSON.parse(reqs);
            } catch (err) {
                reqs = []
            };
            console.log(reqs.length);
            if (reqs.length == 0) {
                doFetch({
                    action: 'doNewProduct',
                    id: localStorage.getItem('soko-active-store'),
                    prod: newProdDat
                }).then(function (e) {
                    if (e.status == 'ok') {
                        refreshProducts();
                        M.toast({
                            html: 'Product added successfully',
                            displayLength: 3000
                        })
                        $('#add-product').modal('close');
                    } else {
                        console.log(e);
                    }
                });
            } else {
                if (plAr.indexOf(newProdDat.name.toLowerCase()) == -1) {
                    doFetch({
                        action: 'doNewProduct',
                        id: localStorage.getItem('soko-active-store'),
                        prod: newProdDat
                    }).then(function (e) {
                        if (e.status == 'ok') {
                            refreshProducts();
                            M.toast({
                                html: 'Product added successfully',
                                displayLength: 3000
                            })
                            $('#add-product').modal('close');
                        } else {
                            console.log(e);
                        }
                    });

                } else {
                    M.toast({
                        html: 'Ooops! Seems you have a similar product',
                        displayLength: 3000
                    })
                }
            }
        }

        for (var i = 0, plAr = plAr; i < productList.length; ++i) {
            plAr.push(productList[i].name.toLowerCase())
        }
    })
}



var shroot = document.querySelectorAll(".removeProduct");
for (var i = 0; i < shroot.length; ++i) {
    var id = $(this).attr('prid');
    shroot[i].addEventListener("touchstart", function () {
        doFetch({
            action: 'doProdRemove',
            id: id
        }).then(function (e) {
            if (e.status == 'ok') {
                //document.querySelector('#prodImg-holda-'+prid).src = val;
                //  Materialize.toast('modified '+name+'..', 3000);
            } else {
                console.log(e);
            }
        });
    }, false);
};
var shroot = document.querySelectorAll("#add-product input");
newProdDat = {};
for (var i = 0; i < shroot.length; ++i) {
    var id = $(this).attr('prid');
    shroot[i].addEventListener("change", function () {
        var value = this;
        var val = $(value).attr('prid');
        if (val == 'undefined' || val == undefined) {
            val = $(value).parent().parent().attr('prid')
        }
        if (val == 'image') {
            //console.log(this,value);
            //var files = this.target.files;
            var file = value.files[0];
            if (file) {
                var canvas = document.querySelectorAll('#tmp-canvas > canvas')[0];
                var ctx = canvas.getContext("2d");
                var cw = canvas.width;
                var ch = canvas.height;
                // limit the image to 150x100 maximum size
                var maxW = 480;
                var maxH = 320;
                var img = new Image;
                img.onload = function () {
                    var iw = img.width;
                    var ih = img.height;
                    var scale = Math.min((maxW / iw), (maxH / ih));
                    var iwScaled = iw * scale;
                    var ihScaled = ih * scale;
                    canvas.width = iwScaled;
                    canvas.height = ihScaled;
                    ctx.drawImage(img, 0, 0, iwScaled, ihScaled);
                    newProdDat[val] = canvas.toDataURL("image/png");
                };
                img.src = URL.createObjectURL(file);
            }
        } else {
            newProdDat[val] = $(value).val();
        }
        var newProdCat = $(".productCategory input").val();
        newProdDat.productCategory = newProdCat;
    }, false);
};
/*
 $('#firstProdModal').modal({
      dismissible: false,
      complete: function() { $('#add-product').openModal({ dismissible: false }); } // Callback for Modal close
    });
*/



function getProductsPromotions() {
    promos_to_products = {}
    promotions = $('.promotions-holda').find('.p-card')

    $.each(promotions, function (index, promotion) {
        unique_id = $(promotion).attr('id')
        promos_to_products[unique_id] = []
    })

    $.each(promotions, function (index, promotion) {
        products_in_promotion = $(promotion).find('li');
        $.each(products_in_promotion, function (index, products) {
            check = $(products).find('input')[0]
            if ($(check).is(':checked')) {
                product_id = $(check).attr('prod_id');
                console.log("prodId------------" + product_id)
                promos_to_products[$(promotion).attr('id')].push(product_id)
            }
        })

    })

    //    console.log('checked products: ', promos_to_products)

    return promos_to_products
}

function rmvProduct() {
    $(".removeProduct").off().click(function () {
        console.log("clicked_--------------");
        parent_div = $(this).parent().parent().parent().parent()
        search_for = $(parent_div).attr('prid')

        console.log('id to check: ', search_for)

        promos = getProductsPromotions()
        found = false
        found_id = null

        $.each(promos, function (key, value) {
            $.each(value, function (index, product_id) {
                if (search_for == product_id) {
                    found = true
                    found_id = product_id
                }
            })
        })

        if (found) {
            console.log('product is checked');
            M.toast({
                html: 'This product is in an active promotion',
                displayLength: 3000
            })
        } else {
            console.log('the product is not checked');
            parent_div = $(this).parent().parent().parent().parent()
            id = $(parent_div).attr('prid')
            M.toast({
                html: 'Removing product. Please wait',
                classes: 'prodWaitToast',
                displayLength: 10000
            })
            doFetch({
                action: 'removeProduct',
                id: id
            }).then(function (e) {
                if (e.status == 'ok') {
                    M.toast({
                        html: 'Product Removed Successfully',
                        displayLength: 3000
                    })
                    $(parent_div).remove();
                    refreshProducts();
                } else {
                    console.log(e);
                }
            });
        }

    })
}

//Product Category
//function prodCategory() {
//    var checkProdCat = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).productCategory
//    if (checkProdCat == "") {
//        console.log("Prod category empty")
//    } else {
//        var prodCat = JSON.parse(JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).productCategory);
//        $(".productCategory").html("")
//        for (var pc = 0; pc < prodCat.length; ++pc) {
//
////            $(".productCategory").append('<option value="' + prodCat[pc].name + '">' + prodCat[pc].name + '</option>');
//            $('select').formSelect();
//            $(".productCategory").siblings("option").remove()
//            $(".changeCategory").siblings("option").remove()
//        }
//    }
//}

//Current Product Category
function initialProdCat() {
    getObjectStore('data', 'readwrite').get('soko-store-' + localStorage.getItem('soko-active-store') + '-products').onsuccess = function (event) {
        var reqs = JSON.parse(event.target.result);
        for (var g = 0; g < reqs.length; ++g) {
            if (reqs[g].productCategory == null) {
                $('.changeCategory-' + reqs[g].id + ' input').val("Choose a category");
            } else {
                $('.changeCategory-' + reqs[g].id + ' input').val(reqs[g].productCategory);
            }
        }
    }
}

//Products Category
var categoryList = [];

function loadProdCategory() {
    $("#categoryModal").find(".categoryChip").remove();
    try {
        var checkProdCat = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).productCategory
    } catch (err) {
        var checkProdCat = "Null"
    }
    if (checkProdCat == "") {
        console.log("Can not find product categories")
    } else {
        $(".categoryLst").html("")
        try {
            var prodCat = JSON.parse(JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store') + '')).productCategory)
        } catch (err) {
            var prodCat = "Null"
        }
        for (var pc = 0, prodCat = prodCat; pc < prodCat.length; ++pc) {
            categoryList.push(prodCat[pc].name);
            $(".categoryLst").append('<div class="chip categoryChip">' +
                prodCat[pc].name + '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 47.971 47.971" style="enable-background:new 0 0 47.971 47.971; width: 10px; margin-left: 5px;" xml:space="preserve"> <g> <path d="M28.228,23.986L47.092,5.122c1.172-1.171,1.172-3.071,0-4.242c-1.172-1.172-3.07-1.172-4.242,0L23.986,19.744L5.121,0.88 c-1.172-1.172-3.07-1.172-4.242,0c-1.172,1.171-1.172,3.071,0,4.242l18.865,18.864L0.879,42.85c-1.172,1.171-1.172,3.071,0,4.242 C1.465,47.677,2.233,47.97,3,47.97s1.535-0.293,2.121-0.879l18.865-18.864L42.85,47.091c0.586,0.586,1.354,0.879,2.121,0.879 s1.535-0.293,2.121-0.879c1.172-1.171,1.172-3.071,0-4.242L28.228,23.986z"></path> </g> </svg> </div>')
        }
    }
}




//Add product category
function addProdCat() {
    var categoryName = $("#categoryName").val();
    M.toast({
        html: 'Adding category. Please wait',
        classes: 'categoryName',
        displayLength: 3000
    })
    $("#categoryName").css("border-bottom", "1px solid #9e9e9e");
    try {
        var prodCat = JSON.parse(JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store') + '')).productCategory)
    } catch (err) {
        var prodCat = "Null"
    }
    if (prodCat.length >= 5) {
        M.toast({
            html: 'Category limit reached!',
            classes: 'categoryName',
            displayLength: 3000
        })
    } else {
        doFetch({
            action: 'manageCategories',
            store: localStorage.getItem('soko-active-store'),
            do: 'add',
            name: categoryName
        }).then(function (e) {
            if (e.status == 'ok') {
                $('#categoryName').val("");
                $('.categoryName').remove();
                M.toast({
                    html: 'Category added successfully',
                    displayLength: 3000
                })
                $(".categoryLst").append('<div class="chip categoryChip">' + categoryName + '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 47.971 47.971" style="enable-background:new 0 0 47.971 47.971; width: 10px; margin-left: 5px;" xml:space="preserve"> <g> <path d="M28.228,23.986L47.092,5.122c1.172-1.171,1.172-3.071,0-4.242c-1.172-1.172-3.07-1.172-4.242,0L23.986,19.744L5.121,0.88 c-1.172-1.172-3.07-1.172-4.242,0c-1.172,1.171-1.172,3.071,0,4.242l18.865,18.864L0.879,42.85c-1.172,1.171-1.172,3.071,0,4.242 C1.465,47.677,2.233,47.97,3,47.97s1.535-0.293,2.121-0.879l18.865-18.864L42.85,47.091c0.586,0.586,1.354,0.879,2.121,0.879 s1.535-0.293,2.121-0.879c1.172-1.171,1.172-3.071,0-4.242L28.228,23.986z"/> </g> </svg> </div>');
                //            updateStores();
            } else {
                console.log(e);
            }
        });
    }
}
