/*================================================================================
	Item Name: Materialize - Material Design Admin Template
	Version: 3.1
	Author: GeeksLabs
	Author URL: http://www.themeforest.net/user/geekslabs
================================================================================

NOTE:
------
PLACE HERE YOUR OWN JS CODES AND IF NEEDED.
WE WILL RELEASE FUTURE UPDATES SO IN ORDER TO NOT OVERWRITE YOUR CUSTOM SCRIPT IT'S BETTER LIKE THIS. */





/********************************
Preloader
********************************/
$(window).load(function() {
  $('.loading-container').fadeOut(1000, function() {
	$(this).remove();
	  	/*
    
angular.module('sokoApp', [])
  .controller('sokoListController', function() {
    var sokoList = this;
    sokoList.todos = [
      {title:'title', content:'content'}];
 
    sokoList.addTodo = function() {
      sokoList.todos.push({text:sokoList.todoText, done:false});
      sokoList.todoText = '';
    };
 
    sokoList.remaining = function() {
      var count = 0;
      angular.forEach(sokoList.todos, function(todo) {
        count += todo.done ? 0 : 1;
      });
      return count;
    };
 
    sokoList.archive = function() {
      var oldTodos = sokoList.todos;
      sokoList.todos = [];
      angular.forEach(oldTodos, function(todo) {
        if (!todo.done) sokoList.todos.push(todo);
      });
    };
  }); 
    
*/
  });

  /*

  $scope.collapsibleElements = [{
        icon: 'mdi-image-filter-drama',
        title: 'First',
        content: 'Lorem ipsum dolor sit amet.'
    },{
        icon: 'mdi-maps-place',
        title: 'Second',
        content: 'Lorem ipsum dolor sit amet.'
    },{
        icon: 'mdi-social-whatshot',
        title: 'Third',
        content: 'Lorem ipsum dolor sit amet.'
    }
];

*/

bc.addEventListener('message', function(e) {
  console.log('broadcast: ',e.data.cast);
       
     switch (e.data.cast) {
      case 'custUpdate': 
           addAllCust()  
      case 'setProfileD': 
           profileLoaded(JSON.parse(e.data.data));
      break;
        default:
    
		}  
    
});
    
 
    
          getObjectStore('data', 'readwrite').get('user-profile-'+localStorage.getItem("bits-user-name")).onsuccess = function (event) {
     
     try{

profileLoaded(JSON.parse(event.target.result));




                              
       
     }catch(err){
     	console.log('no user profile found : ',err);
     	 $('#login').openModal();
     	reqProfile();
     }
           
 }

    
    
    
    
	$(document).on('click', '.side-nav > li > a', function(){

		
		if($(this).hasClass( "nav" )){

		$('#content > .container > div').css('display','none');
  $('.sidebar-collapse').sideNav('hide');

		$('body').attr('page', $(this).attr('page'));
		$('#content > .container > .'+$(this).attr('page')).css('display','block');

		}
		
		
$(this).toggleClass('active');
	});
	
    
    
    
});	

   
    
    
 function reqProfile(){
    
    
         var reqProf = "b:m:p-"+randomString(20)
            doFetch({ action: 'reqProfile', user: reqProf }).then(function(e){
 if(e.status=='ok'){
     showAddr(reqProf);
     setTimeout(function(){


    fetchRates().then(function(e){
         //updateBal('true');
    });
    }, 60000);
               
 }else{
     
     
 }
                setTimeout(function(){reqProfile()}, 60000);
                 
     
            });
     
      
 
 }  
 