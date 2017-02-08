var exports = module.exports = {};

exports.serviceHandler = function(socket) {
  
    bits.manageSocket(socket);
 
    
    socket.on('sendTranReq', function (data) {
    consol.info('new transfer request ' + data.from.split("-")[1]);
      ft=data;
        
        bsConn.mysql.query('SELECT * FROM services WHERE id = ?',
        [ ft.from.split("-")[1] ],
        function(err, results) {
var reqs = results; 
      ft.img=reqs[0].icon;
      ft.sname=reqs[0].name;
        bsConn.mysql.query('SELECT * FROM users WHERE ID = ? OR username = ?',
        [ reqs[0].owner,ft.to.split("-")[1] ],
        function(err, results) {
        console.log(results);    
        console.log(ft);    
      ft.req='fundsTrans';
ft.name=JSON.parse(results[0].googleMeta).displayName;

    if(results.length>1){
     for(var i = 0; i < results.length; ++i) {
        
    if(results[0].username==ft.to.split("-")[1]){
        resp=results[1].username;
        cust=JSON.parse(results[0].googleMeta).displayName;
        
    }else{
        resp=results[0].username;
        cust=JSON.parse(results[1].googleMeta).displayName;
        
    }
         
         
     } 
        
            
     ft.name=cust;       
 bits.sendPush('user-'+resp, ft, socket);
        
         
     }else{
         
    socket.emit(data.action, { action : data.action, "status" : "bad"}); 
     }    
            
            
});
            
            
});
      
  });   
    
    
    
    
   
    socket.on('reqProfile', function (data) {
    consol.info('new terminal ' + data.user);
      
  socket.join('term-'+data.user.split("-")[1]);

    socket.emit(data.action, { action : data.action, "status" : "ok"}); 
  });   
   
    socket.on('pushSub', function (data) {
    consol.info('saving merchant PushID ' + data.user, data.data);
      var id=data.user.split('-')[3];
   var pushDt={id:data.data,key:data.key,auth:data.auth};
bsConn.mysql.query('UPDATE services SET pushID = ? WHERE id = ?',
        [ JSON.stringify(pushDt), id ],
        function(err, results) { 

    socket.emit(data.action, { action : data.action, "status" : "ok"});  
});
     

  });   
    
    
    socket.on('serviceDet', function (data) {
    consol.info(data);
        socket.emit(data.action, { action : data.action, "status" : "ok"});  
  });
    socket.on('compTrn', function (data) {
    consol.info(data);
    
bsConn.mysql.query(
  'UPDATE transactions SET status = "complete" , message = ? Where transid = ? ',
  [data.msg,data.trnid],
  function (err, result) {
    if (err){
        console.log(err);
    }else{
console.log(result);
    console.log('Changed ' + result.changedRows + ' rows');
                
   if(io.sockets.adapter.rooms[data.to.toLowerCase()] == undefined){
        console.log('user unavailable!! trying to push');
          
      data.req='compTrn';

      var sendA=bits.sendPush(data.to,data,socket);
     //console.log(sendA);
      
    
      }else{
       
    io.to(data.to.toLowerCase()).emit('compTrn', data); 
      
    socket.emit(data.action, { action : data.action, "status" : "ok"});
      }
        
  }
  }
);
        
  });
    
    
    socket.on('sendMessage', function (data) {
    consol.info(data);
    consol.info(io.sockets.adapter.rooms);
         console.log(io.sockets.adapter.rooms[data.to.toLowerCase()]);
                
   if(io.sockets.adapter.rooms[data.to.toLowerCase()] == undefined){
        console.log('user unavailable!! trying to push');
          
      data.req='newMsg';
       
       var sendA=bits.sendPush(data.to, data, socket);
     //console.log(sendA);
      
    
      }else{
       
    io.to(data.to.toLowerCase()).emit('newMsg', data); 
      
          socket.emit(data.action, { action : data.action, "status" : "ok"});
      }
        
  });
    
    socket.on('getServiceCustomers', function (data) {
          consol.info('getting service users ' + data.id); 
	
	   bsConn.mysql.query('SELECT * FROM promotions WHERE owner = ?',
        [ parseInt(data.id) ],
        function(err, results) {
if(results){
	    function removeDuplicates(num) {
  var x,
      len=num.length,
      out=[],
      obj={};
 
  for (x=0; x<len; x++) {
    obj[num[x]]=0;
  }
  for (x in obj) {
    out.push(x);
  }
  return out;
}
	var allSubs=[];
   for(var i = 0, allSubs=allSubs; i < results.length; ++i) {
	   allSubs.concat(JSON.parse(results[i].subscribers));
	   
   }
	
	    allSubs=removeDuplicates(allSubs);
		   
     
	    
	    
  bsConn.mysql.query('SELECT * FROM users',
        function(err, results) {
var customers = [];  
            
        //services = services;      
   for(var i = 0, customers = customers, allSubs=allSubs; i < results.length; ++i) {
       var user = results[i];
       try{
       //var servics = JSON.parse(results[i].services);
       var name = JSON.parse(results[i].googleMeta).name;
           var img = JSON.parse(results[i].googleMeta).image;
	     //  var sl =servics.length;
       }catch(e){
           continue;
       }
   for(var j = 0, user = user, img = img, name = name, services = services, customers = customers; j < allSubs; ++j) {
   //for(var k = 0, user = user, img = img, name = name, serv = serv, customers = customers; k < services.length; ++k) {
	  // console.log(user.id,allSubs[j]);
       if (parseInt(user.id) == parseInt(allSubs[j])){
           var cm = { uid: user.id, name: name , img: img}
           customers.push(cm);
       }
    
       
  // }
       
   }
   
   
   }
          socket.emit(data.action, { action : data.action, "status" : "ok", customers : customers });
               
}); 
  	
	
	
	
	   }
});
          
	    
	    
	    
	    
	    
        
  });
    
    socket.on('getServiceReqs', function (dataa) {
          consol.info('getting service requests ' + dataa.id); 
        var reqfor='service-'+dataa.id;
        bsConn.mysql.query('SELECT * FROM payreqs WHERE reqfrom = ?',
        [ reqfor ],
        function(err, results) {
var reqs = results;
            socket.emit(dataa.action, { action : dataa.action, "status" : "ok", "id" : dataa.id, reqs : reqs });
});
      
        
  });
    
 
 
    
    socket.on('getServiceTrans', function (data) {
          consol.info('getting service transactions ' + data.id);   
bsConn.mysql.query('SELECT * FROM transactions WHERE Service = ?',
        [ data.id ],
        function(err, results) {
var transactions = results;
bsConn.mysql.query('SELECT * FROM wallets',
        function(err, results) {
var wallets = results;
    
  if(transactions==undefined || transactions.length){
          socket.emit(data.action, { action : data.action, "status" : "bad", "msg" : "no transactions found" });
  }else{
    
    for(var i = 0, wallets=wallets; i < transactions.length; ++i) {
        var trans = transactions[i];
    for(var j = 0, trans=trans; j < wallets.length; ++j) {
    if(trans.sender == wallets[j].address){
        
        transactions[i].user= wallets[j].username;
    }
    
    }
    
    }
            socket.emit(data.action, { action : data.action, "status" : "ok", "id" : data.id, transactions : transactions });
  }
    
});
      
 
});
      
        
  });
    
 
 
      
    socket.on('saveUserDet', function (data) {
    consol.info(data);
        
    
bsConn.mysql.query('SELECT * FROM users WHERE username = ?',
        [ data.user ],
        function(err, results) { 
         if(results.length>0){
             

var sql    = "UPDATE users SET googleMeta = '"+connection.escape(data.data)+"' WHERE username = '" + connection.escape(data.user)+"'";
connection.query(sql, function(err, results) {
    if(err){
        consol.info('Unable to update user details for:  '+connection.escape(data.user));
    }
    socket.emit(data.action, { action : data.action, "status" : "ok"});  
    
});
}else{
    
          
connection.query("INSERT INTO users (googleMeta, username) VALUES ('"+data.data+"','"+data.user+"')")
    .on("result", function(result){
        result.on("end", function(info){
            consol.info(info);
            consol.info(result);
       
        });
    }); 
     
    socket.emit(data.action, { action : data.action, "status" : "ok"});  
}
          
  });
          
  });
  
    socket.on('merchantServiceLoader', function (data) {

var dat = String(parseFloat(data.id));
     
   bsConn.mysql.query('SELECT * FROM services WHERE owner = ?',
        [ dat ],
        function(err, results) {
       var services = [];
       if (results.length > 0){
       //services=results;
	       
    for(var j = 0,services=services; j < results.length; ++j) {
	    
      var rm = 'service-'+results[j].id;        
	    if(parseInt(rm)<10){
	    //this ia a default service so ignore it
		continue;    
	    }
  socket.join(rm);
            console.log('joined: service-'+results[j].id+' for '+results[j].name);
       var rs=results[j];
	 
try {
	
	console.log('trying '+rs.bannerPath);
    fs.accessSync('/root/bitsoko'+rs.bannerPath, fs.F_OK);
    // Do something
	    rs.banner='';
	console.log('IMAGE found in fs!!');
	       
		services.push(rs);
} catch (e) {
    // It isn't accessible
	 //console.log(rs);
	when(bits.imageToPath(rs.banner,'services'),function(rr){
	    //console.log('242: '+rr);
	//console.log(rs);
		rs.bannerPath=rr;	
   
var sql = "UPDATE services SET bannerPath=? WHERE id = ?";
bsConn.mysql.query(sql,[rr, rs.id],
        function(err, results) { 
 if(err){
        consol.info('Unable to update merchant imagepath for:  ');
    }else{
      consol.info('Updated merchant imagepath for:  ');
    }  
}); 
	
	
		services.push(rs);
		if(services.length==results.length){
	
     socket.emit(data.action, { action : data.action, "status" : "ok", services : services });	   
		   }
	},function(er){
	console.log('error: could not generate service image '+er);
	});
}    
	    
	    
    }
		if(services.length==results.length){
	
     socket.emit(data.action, { action : data.action, "status" : "ok", services : services });	   
		   }       
     
   }else{
   
     socket.emit(data.action, { action : data.action, "status" : "bad", msg:"no services" });                   
                      }
            
});   
          
 
          
  });
    
    
  
  
    socket.on('getMadr', function (data) {

 bsConn.mysql.query('SELECT * FROM users WHERE id = ?',
        [ data.id ],
        function(err, results) {
     if(err){
         console.log(err);
         
socket.emit(data.action, { action : data.action, "status" : "bad" });
     }else{
	    // JSON.parse(results[0].wallets)
socket.emit(data.action, { action : data.action, "status" : "ok", adr : results[0].address });  
          
     }
          
    });
      
  });
  
    
    socket.on('getBeacons', function (dataa) {
          consol.info('getting beacons requests ' + dataa.id); 
      

 bsConn.mysql.query('SELECT * FROM beacons',
        function(err, results) { 
        
    if(err){
        console.log(err);
	 return;}
   var retBeacons=[];
     
    for(var j = 0; j < results.length; ++j) {
      
		var servID=results[j].service;
		if(servID=='3'||servID==3){
		//console.log('merchant service');
		servID=results[j].account;
		}
      if(servID==dataa.id){
      
    retBeacons.push(results[j]);
      }  
        
    }

      if(retBeacons.length>0){
      
    socket.emit(dataa.action, { action : dataa.action, "status" : "ok", "beacons" : retBeacons }); 

      }  else{
      socket.emit(dataa.action, { action : dataa.action, "status" : "bad", "msg" : "No beacons found" });      
   }
     
   }); 
      
        
  });
      
    
    
    socket.on('getProducts', function (dataa) {
          consol.info('getting products ' + dataa.id); 
      

 bsConn.mysql.query('SELECT * FROM products WHERE owner=?',[dataa.id],
        function(err, results) { 
        
    if(err){
        console.log(err);
	 return;}
   var retProducts=[];
     
    for(var j = 0; j < results.length; ++j) {
      
	
    retProducts.push(results[j]);
        
    }

      if(retProducts.length>0){
      
    socket.emit(dataa.action, { action : dataa.action, "status" : "ok", "products" : retProducts }); 

      }  else{
      socket.emit(dataa.action, { action : dataa.action, "status" : "bad", "msg" : "No products found" });      
   }
     
   }); 
      
        
  });
      
    
    
    socket.on('getPromotions', function (dataa) {
          consol.info('getting promotions ' + dataa.id); 
      
         when(bits.merchantPromos(dataa.id), function(e){
 socket.emit(dataa.action, { action : dataa.action, "status" : "ok", "promotions" : e });   
}, function(error){
		 console.log(error);
     socket.emit(dataa.action, { action : dataa.action, "status" : "bad", "msg" : "No products found" });   
}); 
      
        
  });
      
    
    socket.on('getXrates', function (data) {
    consol.info('getting xrates ' + data.country);
      //var jsonD = file_get_contents('https://blockchain.info/ticker');
     // chain
  //json = JSON.parse(jsonD, true);
bits.xRates(data, socket);
        
  });
	
    
    socket.on('doNewStore', function (dataa) {
          consol.info('adding new store for ' + dataa.ownerid); 
        var reqfor='service-'+dataa.id;

         var dbq = {owner: parseInt(dataa.ownerid), name: dataa.name, description: dataa.desc, lonlat: dataa.loc, bannerPath: '/merch/images/merchantsBanner.png'};
     
      bsConn.mysql.query("INSERT INTO services SET ?", dbq, function(err,res){
       if(err){
	       console.log(err);
       socket.emit(dataa.action, { action : dataa.action, "status" : "bad", "msg": "newstore not added"});  
     
       }else{
    socket.emit(dataa.action, { action : dataa.action, "status" : "ok"});  
       }
    }); 
        
  });
    
    socket.on('doCastPromo', function (data) {
          consol.info('casting promo ' + data.id); 
    consol.info(data);
        // console.log(io.sockets.adapter.rooms[data.to.toLowerCase()]);
	
	    
    for(var j = 0; j < data.to.length; ++j) {
	    
  var id = JSON.parse(data.id);
	    var to=data.to[j];
bsConn.mysql.query('SELECT * FROM users WHERE id=? ', [id],
        function(err, results) {
	try{
    var sendA=bits.sendPush(results[0].pushID, JSON.parse('{}'));
	}catch(err){
	
	console.log(err)
	
	}

});
        
    }
      /*          
   if(io.sockets.adapter.rooms[data.to.toLowerCase()] == undefined){
        console.log('user unavailable!! trying to push');
          
      data.req='newMsg';
       
       var sendA=bits.sendPush(data.to, data, socket);
     //console.log(sendA);
      
    
      }else{
       
    io.to(data.to.toLowerCase()).emit('newMsg', data); 
      
          socket.emit(data.action, { action : data.action, "status" : "ok"});
      } 
        */
  });
    
    socket.on('doNewProduct', function (dataa) {
          consol.info('adding new store for ' + dataa.ownerid); 
        var reqfor='service-'+dataa.id;

         //var dbq = {owner: dataa.ownerid, name: dataa.name, desc: dataa.desc, lonlat: dataa.loc};
	    dataa.prod.owner=dataa.id;
     
      bsConn.mysql.query("INSERT INTO products SET ?", dataa.prod, function(err,res){
       if(err){
       socket.emit(dataa.action, { action : dataa.action, "status" : "bad", "msg": "newstore not added"});  
     
       }else{
	bits.updateMissingImages();
    socket.emit(dataa.action, { action : dataa.action, "status" : "ok"});  
       }
    }); 
        
  });
    
	
    
    socket.on('doEditStore', function (dataa) {
          consol.info('modifying store for ' + dataa.id); 
        
var sql = "UPDATE services SET "+dataa.prop+"=? WHERE id = ?";
bsConn.mysql.query(sql,[dataa.val, parseInt(dataa.id)],
        function(err, results) { 
 if(err){
        consol.info('Unable to update user details for:  '+err);
    socket.emit(dataa.action, { action : dataa.action, "status" : "bad"});
    }else{
	    if(dataa.prop=='banner'){
	          
var sql = "UPDATE services SET bannerPath=? WHERE id = ?";
bsConn.mysql.query(sql,['/bitsAssets/tmp/services/404.png', dataa.id],
        function(err, results) { 
 if(err){
        consol.info('Unable to reset merchant imagepath for:  ');
    }else{
	    
	bits.updateMissingImages();
      consol.info('Reset merchant imagepath for:  ');
    }  
}); 
	}
    socket.emit(dataa.action, { action : dataa.action, "status" : "ok"});
    
    }  
});    
	    
        
  });
	
    
    socket.on('doProdUpdate', function (dataa) {
          consol.info('updating product ' + dataa.id); 

   
var sql = "UPDATE products SET "+dataa.prop+"=? WHERE id = ?";
bsConn.mysql.query(sql,[dataa.val, parseInt(dataa.id)],
        function(err, results) { 
 if(err){
        consol.info('Unable to update product details for:  '+err);
    socket.emit(dataa.action, { action : dataa.action, "status" : "bad"});
    }else{
   
	    if(dataa.prop=='image'){
	      
	bits.updateMissingImages();    
	    }
        socket.emit(dataa.action, { action : dataa.action, "status" : "ok"}); 
    
    }  
});    
	    
  });
    
 
    
};

exports.pendingBot = function() {
    
 function chMerPend(mid){
 

     
  
bsConn.mysql.query('SELECT * FROM transactions WHERE status=? AND Service=?', ['pending', mid ],
        function(err, results) {
       
        if(results.length>0){
   
  var data = {req:'merchPend', count: results.length};
       var sendA=bits.sendPush('service-'+mid, data);
            
    }

});
 
     
 }
 
 setInterval(function(){   
     if (bacCount>0){
bsConn.mysql.query('SELECT * FROM services WHERE enabled=?', [1],
        function(err, results) {
  
    for(var j = 0; j < results.length; ++j) {
        
      chMerPend(results[j].id)  
        
    }

    
});
     }
 }, heartBeat*9);
 
    
}

 
exports.serviceConnector = function() {
    consol.info('starting service application..');
    var ch = io.of('/serviceHandler');
    exports.pendingBot();
  ch.on('connection', exports.serviceHandler);
     return ch;
    
}
