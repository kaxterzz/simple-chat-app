var canvas = document.getElementById("preview")
var context = canvas.getContext("2d")
var video = document.getElementById("video")
var img = document.getElementById("play")

context.width = canvas.width;
context.height = canvas.height;

var socket = io();

$(function() {

    socket.on('greetings msg', function(data) {
        $('#info-msg').append($('<span>').addClass('greetings-msg').css({ 'color': data.colorName }).text(data.gmsg)).append($('</span><br>'));
        $('#num-of-online').css({ 'color': data.colorName }).text('Total online : ' + data.numUsers);
    });

    socket.on('add user', function(data) {
        $('#info-msg').append($('<span>').addClass('joined-uname').css({ 'color': data.colorName }).text(data.username + ' joined')).append($('</span><br>'));
        $('#num-of-online').css({ 'color': data.colorName }).text('Total online : ' + data.numUsers);
    });

    socket.on('online users', function(data) {
        $('#num-of-online').css({ 'color': data.colorName }).text('Total online : ' + data.numUsers);
        $('#online-users').append($('<li>').addClass('online-users-list').css({ 'color': data.colorName }).text(data.username)).append($('</li>'));
    });

    socket.on('user left', function(data) {
        $('#info-msg').append($('<span>').addClass('left-uname').css({ 'color': data.colorName }).text(data.username + ' left')).append($('</span><br>'));
        $('#num-of-online').css({ 'color': data.colorName }).text('Total online : ' + data.numUsers);
        removeOnlinename(data.username);
        // if(onlinestatus != 0){
        //   $(this).remove();
        // }
    });

    socket.on('stream', function(image) {
        img.src = image;
    });

    function removeOnlinename(username) {
        $('#online-users li').filter(function() { return $.text([this]) === username; }).remove();
    }

    navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mediaDevices.getUserMedia || navigator.msgGetUserMedia);

    if (navigator.getUserMedia) {
        navigator.getUserMedia({ video: true }, loadCam, loadFail);
    }

    setInterval(function() {
        viewVideo(video, context);
    }, 10);
});

function loadCam(stream) {
    try {
        video.srcObject = stream;
    } catch (error) {
        video.src = window.URL.createObjectURL(stream);
    }

}

function loadFail() {
    alert('Camera load fail !');
}

function viewVideo(video, context) {
    context.drawImage(video, 0, 0, context.width, context.height);
    socket.emit('stream', canvas.toDataURL('image/webp'));
}