
var express = require('express');
var session = require('client-sessions');
var app = require('express')();
app.use(session({// crear una sesion, siempre q se suba una imagen
    cookieName: 'session',
    secret: '0GBlJZ9EKBt2Zbi2flRPvztczCewBxXKhbecerra@ece.ubc.ca',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
}))
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');

var exec = require('child_process').execSync;


var max_action = 1;
var last_action = 1;
var id = 0;
var idTosend = "-10";
var filename_;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.get('/uploads/*', function (req, res, next) {

    //This is the current file they have requested
    var file = req.params[0];

    //For debugging, we can track what files are requested.
    console.log('\t :: Express :: file requested : ' + file);

    //Send the requesting client the file.
    res.sendfile(__dirname + '/uploads/' + file);

});


app.get('/editor', function (req, res) {
    if (req.session && req.session.user) {
        res.sendFile(path.join(__dirname, 'views/editor.html'));
    } else {
        console.log('El Archivo a editar es ' + req.session.user);
        res.sendFile(path.join(__dirname, 'views/index.html'));
    }
});

app.get('/getmy', function (req, res) {
    res.writeHead(200, {'content-type': 'text/html'});
    res.write('/uploads/' + req.session.user + last_action.toString() + '.jpeg');


    res.end();
//   res.sendFile(path.join(__dirname, 'uploads/'+   req.session.user +'.jpeg'));
    console.log('enviando_imagen \n');
});


app.get('/getresult', function (req, res) {//the last action perform
    res.writeHead(200, {'content-type': 'text/html'});
    res.write('/uploads/' + req.session.user + last_action.toString() + '.jpeg');


    res.end();
//   res.sendFile(path.join(__dirname, 'uploads/'+   req.session.user +'.jpeg'));
    console.log('enviando_imagen \n');
});

app.post('/upload', function (req, res) {

    // create an incoming form object
    var form = new formidable.IncomingForm();

    req.session.reset();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;

    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '/uploads');

    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    form.on('file', function (field, file) {
        fs.rename(file.path, path.join(form.uploadDir, file.name));
        filename_ = file.name;
    });

    // log any errors that occur
    form.on('error', function (err) {
        console.log('An error has occured: \n' + err);
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function () {
        last_action = 1;
        console.log('El Archivo ' + filename_ + ' ha sido subido');
        var dir2 = path.join(__dirname, '/uploads/' + filename_);



        exec('genBMPJPEG ' + dir2 + ' ' + dir2 + last_action.toString(), function (error, stdout, stderr) {
            console.log(error);
            console.log(stdout);
            console.log(stderr);
        });
        console.log('genBMPJPEG ' + dir2 + ' ' + dir2 + last_action.toString());
        console.log('El Archivo ' + filename_ + ' ha sido convertido jpeg y bmp');

      

        req.session.user = filename_;

        res.end('success');

    });

    // parse the incoming request containing the form data
    form.parse(req);

});



io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('chat message', function (msg) {
        console.log('message: ' + msg.usr);

        //emitir a todos los clientes
        //
        //el server recive el mensaje y lo reemite 
        // a el usuario final

        if (msg.usr === "everyone") {
            io.emit('chat message', {mensaje: msg.mensaje, froM: msg.who});

            //si quiero ejecutar un comando :D
            exec('dir', function (error, stdout, stderr) {
                console.log(error);
                console.log(stdout);
                console.log(stderr);
            });
        } else {
            io.sockets.in('user@' + msg.usr + '.co').emit('new_msg', {mensaje: msg.mensaje, froM: msg.who});
        }


    });

    socket.on('Give an id', function (msg) {
        id = id + 1;
        console.log('Give an id: ' + id);
        console.log('ddd:' + socket.id);
        socket.join('user@' + id + '.co'); // We are using room of socket io
        io.sockets.in('user@' + id + '.co').emit('get_id', filename_);

        //enviar a todos el id
        //io.emit('get_id', id);

    });



    socket.on('breast', function (msg) {

        var dir2 = path.join(__dirname, '/uploads/' + msg.who + last_action.toString());
        last_action++;
        max_action=last_action;
        var dir1 = path.join(__dirname, '/uploads/' + msg.who + last_action.toString());

        if(msg.action=== "breast1"){

            console.log('Brest_segment ' + dir2 + ' ' + dir1 + ' 1');
            exec('Brest_segment ' + dir2 +'.bmp'+ ' ' + dir1 + ' 1', function (error, stdout, stderr) {
                console.log(error);
                console.log(stdout);
                console.log(stderr);
            });
            console.log('done');
        }
        if(msg.action=== "breast2"){

            console.log('Brest_segment ' + dir2 + ' ' + dir1 + ' 0');
            exec('Brest_segment ' + dir2 +'.bmp'+ ' ' + dir1 + ' 0', function (error, stdout, stderr) {
                console.log(error);
                console.log(stdout);
                console.log(stderr);
            });
            console.log('done');
        }


        //	io.sockets.in('user@'+msg.usr+'.co').emit('getattack', {attack: msg.attack,froM: msg.who});
    });



    socket.on('join', function (data) {
        socket.join(data.email); // We are using room of socket io
    });
    
    socket.on('undo', function (data) {
         
         if( last_action<=1){
              last_action=1;
         }else{
             last_action--;
        }
         console.log('undoing \n');
    });
    
    
    socket.on('redo', function (data) {
         
         if( last_action>=max_action){
              last_action=max_action;
         }else{
             last_action++;
        }
         console.log('redoing \n');
    });

});


http.listen(3000, function () {
    console.log('listening on *:3000');


});