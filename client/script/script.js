// Document
var gametext = document.getElementById("gametext");
var userinput = document.getElementById("userinput");
var characters = gametext.getElementsByClassName("character");
// Clear the userinput value
userinput.value = ""
username = "Paul";
var userID=1;
// Global vars
var road_width = 700;   // px
var text;

var addpx = 0;
var charpx;
var index=0;
var finish = 0;

// Connection
PORT = 3000;
const socket = new WebSocket('ws://localhost:'+PORT);

function handleKey(event){
    
    if (event.key!=text[index] || index>=text.length){
        return;
    } else {
        forwardCurrentPlayer(event, userID);
    }
}

function forwardCurrentPlayer(event,id){
    var element = document.getElementById("playerIcon"+id);
    
    var currentPosition = parseInt(element.style.left || 0);
    addpx += charpx;
    stepx = Math.floor(addpx); // The int to be added
    element.style.left = (currentPosition + stepx) + "px";
    //
    road_width -= stepx;
    addpx -= stepx;
    //
    
    //
    characters[index].classList.add("correct_character")
    characters[index].classList.remove("active_character")
    //
    index++;
    //
    // forwardPlayerId(2, stepx, index);
    //
    if (index==text.length){
        element.style.left = (currentPosition + stepx+90) + "px";
        userinput.value = "";
    } else {
        characters[index].classList.add("active_character")
        characters[index].scrollIntoView({ behaviour: 'smooth'}); 
    }
    // 
    if (event.key==" "){
        userinput.value = "";
    }
    // Send move to the server
    const messageObject = {type: 'move', id:userID, stepx: stepx, index:index};
    socket.send(JSON.stringify(messageObject));

}

function forwardPlayerId(id, stepx, indexval){
    var element = document.getElementById("playerIcon"+id);
    var currentPosition = parseInt(element.style.left || 0);
    
    // Finished ?
    if (indexval==text.length){
        console.log("Done 2")
        element.style.left = (currentPosition + stepx +90) + "px";
    } else {
        // move the element
        element.style.left = (currentPosition+stepx)+"px";
    }
}

function splitToSpan(text){
    var HTML = "";
    for (let i=0; i<text.length; i++){
        HTML += `<span class="character">${text[i]}</span>`;
    }
    return HTML;
}

//
function scrollToBottom() {
  window.scroll({
    left: 0, 
    top: document.body.scrollHeight
  })
}

function connection(){

    socket.addEventListener('open', (event) =>{
        console.log("Connection opened with server");
        // Send Name to request an ID
        const messageObject = {type:"logins", username: username};
        console.log("Will send " + JSON.stringify(messageObject))
        socket.send(JSON.stringify(messageObject));
    })

    socket.addEventListener('message', (event)=>handleServerMessage(event, socket));
}

function handleServerMessage(event, socket){
    const messageObject = JSON.parse(event.data);

    if (messageObject.type =="userId"){
        userID = messageObject.id;
        console.log("Received userID : "+userID)
        addUserRaceView(userID, username);
    } else if (messageObject.type == "userAdd"){
        console.log("Adding user :" + messageObject.id)
        if (messageObject.id != userID)
            addUserRaceView(messageObject.id, messageObject.username);
    } else if (messageObject.type == "move"){
        if (messageObject.id != userID)
            forwardPlayerId(messageObject.id, messageObject.stepx, messageObject.index);
    } else if (messageObject.type == "gameText"){
        text = messageObject.text;
        charpx = road_width/text.length;
        //
        spanHTML = splitToSpan(text);
        gametext.innerHTML = spanHTML;
    } if (messageObject.type == "init"){
        // Initialize the players
        for (let id=0; id<messageObject.players; id++){
            if (id != userID){
                addUserRaceView(id, messageObject.usernames[id]);
            }
        }
        // Handle the previous messages
        for (let i=0; i<messageObject.movements.length; i++){
            move = messageObject.movements[i];
            forwardPlayerId(move.id, move.stepx, move.index);
        }
    }
}

function addUserRaceView(id, username){
    userRaceView = document.getElementById("raceview");
    var playerViewHTML = `
        <div style="position:relative; left: 13%">
            <div>
                <img class="playerIcon" id="playerIcon${id}" src="images/bicycle-${id}.svg" alt="bicycle">
                <div style="position:absolute; bottom:0; left:0;">
                    <img class="road" src="images/road.svg" style="" alt="road">
                    <img class="flag" src="images/flag.svg" style="position:absolute; bottom:50%; right:-4%;" alt="flag">
                    <p id="username${id}" class="username" style="position:absolute; bottom:-50%; left:-10%;">${username}</p>
                </div>
            </div>
        </div>
    `
    userRaceView.innerHTML += playerViewHTML;
}

function main(){
    // 
    connection()
    // 
    userinput.addEventListener("keypress", (event) => handleKey(event));
    // Scrolls
    scrollToBottom();
    if (characters.length)
        characters[0].scrollIntoView();
    //
}

// start 
main()