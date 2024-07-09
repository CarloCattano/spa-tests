// static/js/chat.js

const roomName = 'lobby'; // Replace with dynamic room name if needed

const chatSocket = new WebSocket(
    `ws://${window.location.host}/ws/chat/lobby/`
);

console.log(chatSocket);

chatSocket.onmessage = function (e) {
    const data = JSON.parse(e.data);
    document.querySelector('#messages').innerHTML += ('<div>' + data.message + '</div>');
};

chatSocket.onclose = function (e) {
    console.error('Chat socket closed unexpectedly');
};

document.querySelector('#chat-form').onsubmit = function (e) {
    e.preventDefault();
    const messageInputDom = document.querySelector('#message-input');
    const message = messageInputDom.value;
    chatSocket.send(JSON.stringify({
        'message': message
    }));
    messageInputDom.value = '';
};

