/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  user = require('./routes/user'),
  image = require('./routes/image'),
  http = require('http'),
  path = require('path'),
  gm = require('gm'),
  watcher = require('./routes/watcher');

var pathToWatch = "/var/www",
  hostname = "http://ks3326340.kimsufi.com/";

var app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server);

var watch = watcher.init(pathToWatch);

watch.on('file-ready', function(file) {
  console.log(file);
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
      io.sockets.emit('media', data);
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