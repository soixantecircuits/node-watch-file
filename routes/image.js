
/*
 * GET image listing.
 */
var LocalStorage = require('node-localstorage').LocalStorage,
    localStorage = new LocalStorage('./scratch'),
    _ = require('underscore');



exports.list = function(req, res){
  var imageList = JSON.parse(localStorage.getItem('imageList')),
  filteredList = imageList;
  var lastcall = localStorage.getItem('lastCallDate');
  if(lastcall !== null){
  filteredList = _.filter(imageList, function(el) {
        var elDate = new Date(el.date),
            lastCallDate = new Date(lastcall);
        return lastCallDate < elDate ;
      });  
  }
  localStorage.setItem('lastCallDate', new Date().toJSON());
  res.send(filteredList);
};