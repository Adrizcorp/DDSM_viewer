
var socket = io();
var my_id = "everyone";
var flag_recibi_my_id = 0;
var current_image = "";

function bring_result() {

    var url = '/getmy';
    $.ajax({
        url: url,
        type: 'GET',
        cache: true,
        processData: false,
        success: function (data) {
            current_image = data;
            loadCanvas(current_image);
        },
    }).always(function () {
    });
}

function request_image() {

    socket.emit('breast1', {mensaje: 'zoom_in', who: my_id, usr: 'hihi que dindo 2'});

    bring_result();

}



function sendData() {
    //envie el paquete a un destinatario 
    //especifico
    //alert("s");

    socket.emit('breast', {who: my_id, action: 'breast1'});

    bring_result();

}

function undo_action() {

    socket.emit('undo', {who: my_id});

    bring_result();
}
function redo_action() {

    socket.emit('redo', {who: my_id});

    bring_result();
}

function loadCanvas(dataURL) {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    // load image from data url
    var imageObj = new Image();
    imageObj.onload = function () {
        //context.drawImage(this, 0, 0);
        var hRatio = canvas.width / this.width;
        var vRatio = canvas.height / this.height;
        var ratio = Math.min(hRatio, vRatio);
        context.drawImage(this, 0, 0, this.width, this.height, 0, 0, this.width * ratio, this.height * ratio);
//          context.drawImage(this, 0, 0, this.width,    this.height,     // source rectangle
//                   0, 0, canvas.width, canvas.height); // destination rectangle
    };

    imageObj.src = dataURL;


}


socket.on('chat message', function (msg) {
    var data = $('#messages').val();
    $('#messages').focus().val('').val(data + "\n" + msg.froM + ':' + msg.mensaje);
    //send to the top 
    var textarea = document.getElementById('messages');
    textarea.scrollTop = textarea.scrollHeight;
});


socket.on('get_id', function (msg) {
    if (flag_recibi_my_id === 0) {
        my_id = msg;
        document.title = 'Mi ID es: ' + msg;
        flag_recibi_my_id = 1;
    }
});

function onload() {
    bring_result();
    socket.emit('Give an id', "x");
}

function Line(ctx) {

    var me = this;

    this.x1 = 0;
    this.x2 = 1000;
    this.y1 = 0;
    this.y2 = 1000;

    /// call this method to update line        
    this.draw = function (x1,y1,x2,y2) {
        loadCanvas(current_image);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
//        //temporal de lo que habia antes en el canvas
//        ctx.save();
//        //señalar que se va a empezar a dibujar en el canvas
//        ctx.beginPath();
//
//        ctx.fillStyle = 0;
//        ctx.strokeStyle = "red";
//
//
// 
//        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
//
//
//        ctx.lineWidth = 2;
//        ctx.rect(0, 0, 100, 100);
//        //dibujar lineas
//        ctx.stroke();
//        //rellenar rectagulo
//        ctx.fill();
//        //reestablecer el dibujo mas lo nuevo que se pone en el canvas
//        ctx.restore();

    }
}

function load_image_auto() {
    request_image();
}

//setInterval(load_image_auto, 10000);
//donde esta el cursor en el canvas1
function handleMouseMove(e) {

    var canvasOffset2 = $("#canvas").offset();
    var offsetX2 = canvasOffset2.left;
    var offsetY2 = canvasOffset2.top;

    mouseX = parseInt(e.clientX - offsetX2);
    mouseY = parseInt(e.clientY - offsetY2);
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var linea = new Line(ctx);


    linea.draw(0,0,mouseX,mouseY);

//      socket.emit('chat message', {mensaje: String(mouseX)+','+String(mouseY), who: my_id, usr:String(mouseX)+','+String(mouseY)});


}

//cuando el mouse esta oprimido en el canvas
function handleMouseDown(e) {

    // saber posicion del canvas
    var canvasOffset = $("#canvas").offset();
    var offsetX = canvasOffset.left;
    var offsetY = canvasOffset.top;

    //para que el canvas empiece desde cero
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);

    switch (e.which) {
        case 1:
            //alert('Left Mouse button pressed.');
            //e target.id barco que se selecciona
            redo_action();
            break;
        case 2:
            //alert('Middle Mouse button pressed.');
            undo_action();
            break;
        case 3:
            //   alert('Right Mouse button pressed.');

            break;
        default:
            //  alert('You have a strange Mouse!');
    }
}



$("#canvas").mousemove(handleMouseMove);
$("#canvas").click(handleMouseDown);