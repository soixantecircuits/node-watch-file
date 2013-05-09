/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  user = require('./routes/user'),
  image = require('./routes/image'),
  watcher = require('./routes/watcher'),
  http = require('http'),
  path = require('path'),
  gm = require('gm'),
  _ = require('underscore'),
  ws = require('websocket.io');


var pathToWatch = "/var/www",
  hostname = "http://ks3326340.kimsufi.com/",
  managedSocket = [];

var app = express(),
  server = require('http').createServer(app),
  socketServer = ws.attach(server);

socketServer.on('connection', function(socket) {
  managedSocket.push(socket);
  _.each(managedSocket, function(el) {
    el.send('hi');
  });
  socket.on('message', function() {});
  socket.on('close', function() {});
});


var watch = watcher.init(pathToWatch);

watch.on('file-ready', function(file) {
  console.log('file-ready :', file);
  gm(file)
    .size(function(err, size) {
    if (!err) {
      var data = {
        "type": "image",
        "url": hostname + file.split('/').pop(),
        "size": {
          "width": size.width,
          "height": size.height
        },
        "caption": "",
        "source": "pixcube"
      };
      console.log(data);
      _.each(managedSocket, function(el) {
        el.send(JSON.stringify(data));
      });
    }
  });
});

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/images', image.list);


server.listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});