var chokidar = require('chokidar'),
  _ = require('underscore'),
  LocalStorage = require('node-localstorage').LocalStorage;

var localStorage = new LocalStorage('./scratch');

var initWatcher = function(pathToWatch) {
  var watcher = chokidar.watch(pathToWatch, {
    ignored: /^\./,
    persistent: true
  });

  watcher.on('add', function(path) {
    if (/^[^\.].*$/.test(path.split("/").pop())) {
      console.log("filed added: ", path);
      var imageList = [];
      if (localStorage.getItem('imageList') !== null) {
        var imageList = JSON.parse(localStorage.getItem('imageList'));
      }
      if (_.filter(imageList, function(el) {
        return el.url == path;
      }).length < 1) {
        imageList.push({
          url: path,
          date: new Date().toJSON()
        });
      }
      localStorage.setItem('imageList', JSON.stringify(imageList));
      this.emit("file-ready", path);
    }
  })
    .on('change', function(path) {
    console.log('File', path, 'has been changed');
  })
    .on('error', function(error) {
    console.error('Error happened', error);
  })

  // Only needed if watching is persistent.
  watcher.close();
  return watcher;
}

module.exports = {
  init: initWatcher
};