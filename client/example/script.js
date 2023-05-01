// Width of road
var road_width = 700;   // px
var text = "To change the position of an element";
var addpx = 0;
var charpx = road_width/text.length;
var index=0;
var finish = 0;

var element = document.getElementById("playerIcon");
function forward(event){
    if (event.key!=text[index] || index>=text.length){
        return;
    }
    var currentPosition = parseInt(element.style.left || 0);
    addpx += charpx;
    element.style.left = (currentPosition + Math.floor(addpx)) + "px";
    //
    road_width -= Math.floor(addpx)
    addpx -= Math.floor(addpx)
    //
    index++;
    //
    if (index==text.length){
        element.style.left = (currentPosition + Math.floor(addpx)+90) + "px";
    }
}

// 
document.addEventListener("keypress", (event) => forward(event));

