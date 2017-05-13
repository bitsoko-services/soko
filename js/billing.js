function refreshBills(month, year) {
    var months = {
        '0': 'Jan',
        '1': 'Feb',
        '2': 'Mar',
        '3': 'Apr',
        '4': 'May',
        '5': 'Jun',
        '6': 'Jul',
        '7': 'Aug',
        '8': 'Sep',
        '9': 'Oct',
        '10': 'Nov',
        '11': 'Dec'
    }
    billingUpdater().then(function (e) {
        bills = e
        i = 0
        billing_string = ''
        billing_amount = ''
        promotion_id = ''
        dailyBill = ''
        var daily = '';
        var prev_date = '';
        var dailyTotal = 0;
        $.each(bills, function (index, obj) {
            var promotionId = obj.promoid;
            var promoRate = obj.rate;
            splitted = obj['date'].split(' ');
            parsed_date = splitted[0] + ' ' + splitted[2];
            month_name = splitted[1];
            if (splitted[1] == months[month] && splitted[3] == year) {
                console.log('Prev is: ' + prev_date + ' and current is: ' + parsed_date);
                if (prev_date != parsed_date) {
                    //Remove the no results text if it is the last li
                    if ($('.rowBill').last().hasClass('noresults')) {
                        $('#rowBIll').html('');
                    }
                    dailyTotal = 0.167;
                    dailyBill = '<li class="rowBill"><div class="collapsible-header"> <div class="row"> <div class="anything col s6"><span id="billingDate">' + parsed_date + '</span></div><div class="anything col s6"><span class="dailyBill">' + dailyTotal + '</span></div></div></div><div class="collapsible-body" style="padding:10px;padding-left:25%;"><span>Billing for Promo ' + promotionId + ' is ' + promoRate + '</span></br></div></li>';
                    $('#rowBIll').append(dailyBill);
                } else {
                    console.log('This should fire');
                    daily = '<span>Billing for Promo ' + promotionId + ' is ' + promoRate + '</span></br>';
                    console.log('Daily value is: ' + daily);
                    dailyTotal = dailyTotal + 0.167;
                    console.log('New daily total should be: ' + dailyTotal);
                    $('.rowBill .collapsible-body').last().append(daily);
                    $('.dailyBill').last().text(dailyTotal);
                }
                prev_date = parsed_date;
            }
        });
        $('.cust-count').html(bills.length);
        //        $('#billingDate').html(billing_string);
        //        $('#dailyBill').html(billing_amount);
        if (dailyBill == '') {
            $('#rowBIll').html('<li class="rowBill noresults"><div class="collapsible-header"> No results found </div></li>');
        }
        //$('.month').html(month_name);
        var billcharges = parseFloat(bills.length * 0.167).toFixed(3);
        console.log("Biliing charges----------->>" + billcharges)
        $('#serviceBillCharges').html(billcharges);
        if (e.status == "ok") {
            console.log(e)
        } else {
            console.log("error");
        };
    });
}

function refreshBilling() {
    doFetch({
        action: 'getServiceBills',
        id: localStorage.getItem('soko-active-store')
    }).then(function (e) {
        console.log(e);
        getObjectStore('data', 'readwrite').put(JSON.stringify(e.reqs), 'soko-store-' + id + '-billing');
        billingUpdater();
    }).catch(function (err) {
        billingUpdater();
    }); //addCustomer(e.customers);
}

function billingUpdater() {
    return new Promise(function (resolve, reject) {

        getObjectStore('data', 'readwrite').get('soko-store-' + localStorage.getItem('soko-active-store') + '-billing').onsuccess = function (event) {

            try {
                resolve($.parseJSON(event.target.result));
            } catch (err) {
                refreshBilling();
            }
        }
    });

}
//calenderfunction myFunction() {
$(document).ready(function () {});
$(document).ready(function () {
    var month = new Array();
    month[0] = "January";
    month[1] = "February";
    month[2] = "March";
    month[3] = "April";
    month[4] = "May";
    month[5] = "June";
    month[6] = "July";
    month[7] = "August";
    month[8] = "September";
    month[9] = "October";
    month[10] = "November";
    month[11] = "December";
    var d = new Date();
    var n = month[d.getMonth()];
    document.getElementById("month").innerHTML = n;
    var year = 2017;
    var currMonth = 0;
    $('#month').text(month[0]);
    $('#year').text(year);
    $('#right').click(function () {
        if (currMonth === 11) {
            currMonth = 0;
            $('#month').text(month[currMonth]);
            year++;
            $('#year').text(year);
            refreshBills(currMonth, year);
        } else {
            currMonth++;
            $('#month').text(month[currMonth]);
            refreshBills(currMonth, year);
        }
    })
    $('#left').click(function () {
        if (currMonth === 0) {
            currMonth = 11;
            $('#month').text(month[currMonth]);
            year--;
            $('#year').text(year);
            refreshBills(currMonth, year);
        } else {
            currMonth--;
            $('#month').text(month[currMonth]);
            refreshBills(currMonth, year);
        }
    })
});

function createInvoiceListener(orderid, invoiceDat) {
    var forEach = function (array, callback, scope) {
        for (var i = 0; i < array.length; i++) {
            callback.call(scope, i, array[i]); // passes back stuff we need
        }
    };
    var myNodeList = document.querySelectorAll('#do-bill-' + orderid);
    forEach(myNodeList, function (index, value) {
        value.addEventListener("pointerdown", function (ev) {
            console.log(invoiceDat);
            var pdf = new jsPDF('p', 'pt', 'letter');
            source = $('.pdfAppend')[0];
            specialElementHandlers = {
                '.pdfHide': function (element, renderer) {
                    return true
                }
            };
            margins = {
                top: 20,
                bottom: 60,
                left: 450,
                width: 522
            };
            pdf.fromHTML(
                source,
                margins.left, // x coord
                margins.top, { // y coord
                    'width': margins.width, // max width of content on PDF
                    'elementHandlers': specialElementHandlers
                },

                function (dispose) {
                    // Add you function here 
                    var rows = [];
                    var totalPrice = 0;
                    for (var i = 0, totalPrice = totalPrice, rows = rows; i < invoiceDat.length; i++) {
                        totalPrice = invoiceDat[i].prod.price * invoiceDat[i].count + totalPrice;
                        var count = invoiceDat[i].count;
                        var ordrImgPath = invoiceDat[i].name.icon;
                        var name = invoiceDat[i].prod.name;
                        var icon = invoiceDat[i].name.icon;
                        var unitPrice = invoiceDat[i].prod.price;
                        var price = invoiceDat[i].prod.price * invoiceDat[i].count;
                        var number = invoiceDat[i].name.number;
                        var loc = 'dgclauigfckiuj';
                        var userName = 'Name';
                        var phoneNum = '+254';
                        rows.push([count, name, unitPrice, price]);
                    }
                    var img = new Image();
                    img.setAttribute('crossOrigin', 'anonymous');
                    img.onload = function () {
                        var canvas = document.createElement("canvas");
                        canvas.width = this.width;
                        canvas.height = this.height;
                        var ctx = canvas.getContext("2d");
                        ctx.drawImage(this, 0, 0);
                        var dataURL = canvas.toDataURL("image/jpg");
                        pdf.addImage(dataURL, 'JPEG', 35, 240, 80, 80);
                        
                        getMapImg('').then(function(map){
                        console.log(map);
                            return;
                        pdf.addImage(map, 'JPEG', 350, 240, 80, 80);
                        pdf.text(userName, 45, 350);
                        pdf.text(phoneNum, 45, 370);
                        var columns = ["Number of Items", "Name of Item", "Cost Per Unit", "Total Cost"];
                        rows.push(['', '', 'Total', totalPrice + '/=']);
                        pdf.autoTable(columns, rows, {
                            margin: {
                                top: 430
                            },
                            theme: 'striped',
                        });
                        pdf.save('table.pdf');
                        
                        });
                        
                        
                    };
                    img.src = ordrImgPath;
                }, margins);


        });
    });
}


function getMapImg(url){
    var mapKey='AIzaSyBEpLoOInTvRSrkLpTHSu8EE3jiFD1Vk7E';
var murl ='https://maps.googleapis.com/maps/api/staticmap?center=40.714728,-73.998672&zoom=12&size=400x400&key='+mapKey;
    
 return new Promise(function(resolve, reject) {
    var imgm=new Promise(function(resolve, reject) {
    
    var img = new Image();
                    img.setAttribute('crossOrigin', 'anonymous');
                    img.onload = function () {
                        var canvas = document.createElement("canvas");
                        canvas.width = this.width;
                        canvas.height = this.height;
                        var ctx = canvas.getContext("2d");
                        ctx.drawImage(this, 0, 0);
                        var dataURL = canvas.toDataURL("image/jpg");
                        resolve(dataURL);
                    };
                    img.src = murl;
});
        var textm=new Promise(function(resolve, reject) {
    
     var url =' https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&key='+mapKey
  //make the Ajax request
  var xhr = new XMLHttpRequest();

  xhr.open("GET", url);
  xhr.onload = function() {
  		
  	  //if we make a successful request and it returns an address
	  if(this.status==200){
	  	//get formatted address from https://developers.google.com/maps/documentation/geocoding/#ReverseGeocoding
	  	var result = JSON.parse(xhr.responseText);
	  	resolve(result);
      } else {
      	//send some general error
          reject('geocoding error');
      }

  }

  xhr.send();
             
});
    
  
    
    Promise.all([imgm, textm]).then(values => { 
  resolve(values);
}).catch(reason => { 
  reject(reason)
});
});
    
}






//function serviceBillUpdater() {
//    getObjectStore('data', 'readwrite').get('soko-store-' + localStorage.getItem('soko-active-store') + '-products').onsuccess = function (event) {
//        var reqs = event.target.result;
//        try {
//            reqs = JSON.parse(reqs);
//        } catch (err) {
//            reqs = []
//        };
//        $(".billingTableRow").html('');
//        if (reqs.length == 0) {
//            var html = ' <td style="padding-left:10px;" data-th="Header">15th</td> <td style="padding-left:10px;" data-th="Header"> Ksh <span id="serviceBillCharges"></span></td>';
//            $(".billingTableRow").append($.parseHTML(html));
//        } else {
//            $("").attr('href', '#')
//        }
//    }
//}
