$('#nickNameModal').modal({
   backdrop: 'static',
   keyboard: false
 });
$(document).ready(function(){
  $('#nickname-btn').attr('disabled','disabled');
  $('#nick-name').keyup(function(){
    if($(this).val().length !=0){
        $('#nickname-btn').attr('disabled', false);
    }else{
        $('#nickname-btn').attr('disabled',true);
    }
  });
});

$(function() {
    var typing = false;
    var socket = io();
    var timeout;

    $('#nickname-form').submit(function() {
        $('#nickNameModal').modal('hide');
        socket.emit('add user', $('#nick-name').val());
        $('#nick-name').val('');
        return false;
    });

    socket.on('greetings msg', function(data){
      $('#info-msg').append($('<span>').addClass('greetings-msg').css({'color':data.colorName}).text(data.gmsg)).append($('</span><br>'));
      $('#num-of-online').css({'color':data.colorName}).text('Total online : ' + data.numUsers);
    });

    socket.on('add user', function(data) {
        $('#info-msg').append($('<span>').addClass('joined-uname').css({'color':data.colorName}).text(data.username + ' joined')).append($('</span><br>'));
        $('#num-of-online').css({'color':data.colorName}).text('Total online : ' + data.numUsers);
    });

    // $('#m').keypress(function(e) {
    //     if (e.keyCode == 13) {
    //         socket.emit('new message', $('#m').val());
    //         $('#m').val('');
    //         return false;
    //     } else {
    //         typing = true;
    //         socket.emit('is typing', typing);
    //         clearTimeout(timeout);
    //         timeout = setTimeout(timeoutFunction, 2000);
    //     }
    //
    // });

    $('#m').keypress(function(e) {
      if (e.keyCode == 13) {
           socket.emit('new message', $('#m').val());
           $('#m').val('');
           return false;
       } else {
           typing = true;
           socket.emit('is typing', typing);
           clearTimeout(timeout);
           timeout = setTimeout(timeoutFunction, 2000);
       }
    });

    $('#msg_form').submit(function(e){
      e.preventDefault(); // prevents page reloading
      socket.emit('new message', $('#m').val());
      $('#m').val('');
      return false;
    });

    socket.on('is typing', function(data){
      if(data.username != ''){
        $('#username-of-person').addClass('typing-username').css({'color':data.colorName}).text(data.username + ' : ');
        $('#user-typing').text(data.message);
      }else{
        $('#username-of-person').html('');
        $('#user-typing').html('');
      }
    });

    socket.on('my message', function(data){
      $('<div>',{
          'class' : 'msg-wrapper alert alert-secondary',
          'role' : 'alert',
          'html': $('<span>',{
            'class' : 'inner participant-name',
            'style' : 'color:'+data.colorName
          }).text(data.username+' : ').add($('<span>',{
            'class' : 'inner participant-msg'
          }).text(data.message))
        }).appendTo('#messages');
    });
    socket.on('new message', function(data) {
      $('<div>',{
          'class' : 'msg-wrapper alert alert-secondary',
          'role' : 'alert',
          'html': $('<span>',{
            'class' : 'inner participant-name',
            'style' : 'color:'+data.colorName
          }).text(data.username+' : ').add($('<span>',{
            'class' : 'inner participant-msg'
          }).text(data.message))
        }).appendTo('#messages');
    });

    socket.on('online users', function(data){
      $('#num-of-online').css({'color':data.colorName}).text('Total online : ' + data.numUsers);
      $('#online-users').append($('<li>').addClass('online-users-list').css({'color':data.colorName}).text(data.username)).append($('</li>'));
    });

    socket.on('user left', function(data){
      $('#info-msg').append($('<span>').addClass('left-uname').css({'color':data.colorName}).text(data.username + ' left')).append($('</span><br>'));
      $('#num-of-online').css({'color':data.colorName}).text('Total online : ' + data.numUsers);
      removeOnlinename(data.username);
      // if(onlinestatus != 0){
      //   $(this).remove();
      // }
    });

    function removeOnlinename(username){
      $('#online-users li').filter(function() { return $.text([this]) === username; }).remove();
    }
    function timeoutFunction(){
      typing = false;
      socket.emit('is typing', typing);
    }

});
