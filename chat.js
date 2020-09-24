var  currentUserKey = '';
var chatKey = '';
document.addEventListener('keydown' , function (key){
    if (key.which === 13){
        sendmessage();
    }
});

/////////////////
function startchat(friendKey ,friendName ,friendPhoto ) {
    var friendList = {friendId: friendKey , userId :currentUserKey};

    var db = firebase.database().ref('friend_list');
    var flag =false;
    db.on('value' , function(friends){
        friends.forEach(function(data){
            var user = data.val();
            if ((user.friendId=== friendList.friendId && user.userId === friendList.userId) || ((user.friendId=== friendList.userId && user.userId === friendList.friendId))){
                flag =true;
                chatKey = data.key;

            }


        });
        if (flag === false){
         chatKey =   firebase.database().ref('friend_list').push(friendList , function (error){
                if (error) alert (error);
                else{
                    document.getElementById('chatpanel').removeAttribute('style');
            document.getElementById('divstart').setAttribute('style' , 'display:none');
            hideChatList();
        
                }
            }).getKey();
        }
        else {
            document.getElementById('chatpanel').removeAttribute('style');
            document.getElementById('divstart').setAttribute('style' , 'display:none');
            hideChatList();
        }
    //////////////////////////////////////////////////
    document.getElementById('divChatName').innerHTML = friendName;
    document.getElementById('imgChat').src = friendPhoto;


    document.getElementById('messages').innerHTML = '';


    
    document.getElementById('textMessage').value ='';
    document.getElementById('textMessage').focus();
  /////////////////////////////////////////////////
  /////display MSG
  loadChatMessages(chatKey ,friendPhoto);

    });  
}


////////////////////////////////////////
function loadChatMessages(chatKey  ,friendPhoto) {
    var db =firebase.database().ref('chatMessages').child(chatKey);
    db.on('value' , function(chats){
          
        var messageDisplay = '';
        chats.forEach(function(data){
         var   chat = data.val();
         var dateTime =chat.dateTime.split(",");
     
         if (chat.userId !== currentUserKey){
             messageDisplay += `<div class="row">
             <div class="col-2 col-sm-2 col-md-2">
                 <img src="${friendPhoto}" class="chatprofile rounded-circle">

             </div>
             <div class="col-7 col-sm-7 col-md-7">
                 <p class="recive"> ${chat.msg}
                 <span class="time float-right" title="${dateTime[0]}">${dateTime[1]}</span>
                 </p>
             </div>
         </div>`;
       

         }
         else{
            messageDisplay +=`<div class="row justify-content-end">
                    
            <div class="col-7 col-sm-7 col-md-7">
                <p class="sender float-right">
                ${chat.msg}
                <span class="time float-right" title="${dateTime[0]}">${dateTime[1]}</span>
                </p>
            </div>
            <div class="col-2 col-sm-2 col-md-2">
                <img src="${firebase.auth().currentUser.photoURL}" class="chatprofile rounded-circle">
           
            </div>
           </div>`;  

         }
          
           
        });
        
        document.getElementById('messages').innerHTML = messageDisplay;
        document.getElementById('messages').scrollTo(0, document.getElementById('messages').scrollHeight);
    });
}

function showChatList() {
    document.getElementById('side-1').classList.remove('d-none' , 'd-md-block');
    document.getElementById('side-2').classList.add('d-none');
    
}

function hideChatList() {
   document.getElementById('side-1').classList.add('d-none' , 'd-md-block');
   document.getElementById('side-2').classList.remove('d-none');
} 




function sendmessage(){
    var chatMessage ={
        userId:currentUserKey,
        msg :  document.getElementById('textMessage').value ,
        dateTime : new Date().toLocaleString()
    };
    firebase.database().ref('chatMessages').child(chatKey).push(chatMessage ,function (error) {
    if (error) alert(error);
    else{
    //     var message =`<div class="row justify-content-end">
                    
    //     <div class="col-7 col-sm-7 col-md-7">
    //         <p class="sender float-right">
    //         ${document.getElementById('textMessage').value}
    //         <span class="time float-right">10:05</span>
    //         </p>
    //     </div>
    //     <div class="col-2 col-sm-2 col-md-2">
    //         <img src="${firebase.auth().currentUser.photoURL}" class="chatprofile">
       
    //     </div>
    //    </div>`;  
       
       
    //    document.getElementById('messages').innerHTML += message;
       document.getElementById('textMessage').value = '';
       document.getElementById('textMessage').focus();
       
       
    //    document.getElementById('messages').scrollTo(0, document.getElementById('messages').scrollHeight);
       
    }

    })

}


function LoadChatList(){
    var db =firebase.database().ref('friend_list');
    db.on('value' , function (lists){
        document.getElementById('lstchat').innerHTML = `<li class="list-group-item" id="lstchat">
        <input type="text" placeholder="search a contact.." class="form-control"/>

    </li>`;
        lists.forEach(function (data){
            var lst =data.val();
            var friendKey = '';
            if (lst.friendId === currentUserKey){
                friendKey = lst.userId;
            }
            else if (lst.userId === currentUserKey){
                friendKey =lst.friendId;
            }
            if (friendKey !==''){
                firebase.database().ref('users').child(friendKey).on('value' , function (data) {
                    var user = data.val();
                    document.getElementById('lstchat').innerHTML += ` 
                    <li class="list-group-item list-group-item-action " onclick="startchat('${data.key}' , '${user.name}' , '${user.photoURL}')">
                        <div class="row">
                            <div class="col-3 col-sm-2  col-md-3 col-lg-2">
                                <img src="${user.photoURL}" class="profile rounded-circle">
                            </div>
                            <div class="col-9 col-sm-10 col-md-9 col-lg-10" style="cursor: pointer;">
                                <div class="name">${user.name}</div>
                                <div class="under-name">New Message</div>
                            </div>
    
                        </div>
    
                    </li>`; 
    
                });

            }
            

        });
    });
}



/////////////
function PopulateFriendList() {
    document.getElementById('lstFriend').innerHTML = `<div class="text-center">
                                                         <span class="spinner-border text-primary mt-5" style="width:6rem;height:6rem"></span>
                                                     </div>`;
      var db =firebase.database().ref('users');
      var lst ='';
       
        db.on('value' , function (users){
            if (users.hasChildren()){
                 lst = `<li class="list-group-item">
                           <input type="text" placeholder="search a contact.." class="form-control"/>
                           </li>`;
            }
            users.forEach(function (data) {
                var user = data.val();
                if (user.email !== firebase.auth().currentUser.email) {
                    lst += ` <li class="list-group-item list-group-item-action " data-dismiss="modal" onclick="startchat('${data.key}' , '${user.name}' ,'${user.photoURL}')">
                <div class="row">
                    <div class="col-3 col-sm-2  col-md-3 col-lg-2">
                        <img src="${user.photoURL}" class="rounded-circle profile">
                    </div>
                    <div class="col-9 col-sm-10 col-md-9 col-lg-10" style="cursor: pointer;">
                        <div class="name">${user.name}</div>
                        
                    </div>

                </div>

            </li>`;

                }
                
            });
            document.getElementById('lstFriend').innerHTML =lst;
          
        });
                                                                                                 
}                                                     



function signin() {
    var provider = new firebase.auth.GoogleAuthProvider;
    firebase.auth().signInWithPopup(provider);
}




function signOut(){
    firebase.auth().signOut();
   
}

function onFirebaseStateChanged() {
    firebase.auth().onAuthStateChanged(onStateChanged);
}


function onStateChanged(user) {
    if (user){

          //alert(firebase.auth().currentUser.email + '\n' + firebase.auth().currentUser.displayName);
        var userProfile = { email:'' , name:'', photoURL:''};
        userProfile.email = firebase.auth().currentUser.email;
        userProfile.name = firebase.auth().currentUser.displayName;
        userProfile.photoURL = firebase.auth().currentUser.photoURL;



        var db =firebase.database().ref('users');
        var flag = false ;
        db.on('value' , function (users){
            users.forEach(function (data) {
                var user = data.val();
                if(user.email === userProfile.email){
                    currentUserKey = data.key ;
                    flag = true ;

                }
                
                
            });
            if (flag === false){
                firebase.database().ref('users').push(userProfile , callback);
            }
            else {
                document.getElementById('imgprofile').src = firebase.auth().currentUser.photoURL;
                document.getElementById('imgprofile').title = firebase.auth().currentUser.displayName;
        
                document.getElementById('lnksignIn').style = 'display:none';
                document.getElementById('lnksingOut').style = '';
            }
            document.getElementById('lnkNewChat').classList.remove('disabled');
            LoadChatList();
        });

       
    }
    else{
        document.getElementById('imgprofile').src = 'imges/pp5.png';
        document.getElementById('imgprofile').title = '';

        document.getElementById('lnksignIn').style = '';
        document.getElementById('lnksingOut').style = 'display:none';
        document.getElementById('lnkNewChat').classList.add('disabled');
    }
}

function callback(error){
    if(error) {
        alert(error);
    }
    else {
        document.getElementById('imgprofile').src = firebase.auth().currentUser.photoURL;
        document.getElementById('imgprofile').title = firebase.auth().currentUser.displayName;

        document.getElementById('lnksignIn').style = 'display:none';
        document.getElementById('lnksingOut').style = '';
    }
}

onFirebaseStateChanged();