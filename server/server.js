const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({server});

const PORT = 3000;  // Server PORT

var numberPlayers = 0;
var gameText = "En combinant les capacités humaines avec les avancées technologiques, l'intelligence artificielle peut nous aider à explorer de nouveaux horizons et à atteindre des objectifs que nous pensions auparavant impossibles. Nous sommes maintenant à l'heure de l'intelligence artificielle et des données. C'est l'aire de la révolution de l'informatique naissante. Tout sera différent.";
let waitTime = 10;
let movements = [];
let usernames = [];

function createID(client, message){
    // Build and send the message object
    let messageObject = { type: 'userId', id: numberPlayers}
    client.send(JSON.stringify(messageObject))

    // Alert all user of the new user
    messageObject = {type: "userAdd", id:numberPlayers, username: message.username}
    sendToAll(messageObject)

    // Finish
    usernames.push(message.username)
    numberPlayers++;
}

function sendToAll(message){
    // const messageObject = {type: 'move', id: userId, stepx:addpx, index:index};
    const messageObject = message;

    movements.push(messageObject);  // Save the message object
    wss.clients.forEach((client) => {
        if (client.readyState===WebSocket.OPEN){
            client.send(JSON.stringify(messageObject));
        }
    })
}

function sendGameText(client, gameText){
    const messageObject = {type:"gameText", text:gameText};
    client.send(JSON.stringify(messageObject));
}

function main(){
    // Binding for a new connection
    wss.on('connection', (ws)=>{
        console.log(`Player ${numberPlayers}: connected`)
        // Wait the username to give ID
        ws.on('message', (message)=>{
            console.log("User messaged : "+ message)
            message = JSON.parse(message);
            if (message.type == "logins"){
                logins = message;
                createID(ws, logins);
                console.log("Next ID :" + numberPlayers)
                sendGameText(ws, gameText)
                // Send the number of players and the messages
                const messageObject = {type: "init", players: numberPlayers, usernames:usernames, movements: movements}
                ws.send(JSON.stringify(messageObject))
            } else if (message.type == "move"){
                sendToAll(message);
            }
        })
    })
    // Final configs
    app.use(express.static('public'));

    server.listen(PORT, ()=> {
        console.log('Server started on http://localhost:3000')
    })
}

// Start 
main()