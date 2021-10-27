var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
var http = require('http')
var fs = require('fs');
var Fabric_Client = require('fabric-client');
var path = require('path');
var util = require('util');
var os = require('os');
var multer = require('multer');
var fs = require('fs');

//test
var app = express();
var routes = require('./api/routes');

//require('./api/routes')(app);

app.set('port', 8081);


app.use(function(req, res, next) {

  res.header("Access-Control-Allow-Origin", "*");

  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  next();

});



var storage = multer.diskStorage({ //multers disk storage settings
  destination: function(req, file, cb) {
    cb(null, req.file_path)
  },
  filename: function(req, file, cb) {
    var datetimestamp = Date.now();
    console.log("name: ", req.file_path);
    if (req.use_timestamp) {
      file.originalname += "-" + datetimestamp;
      console.log(file.originalname);
    }
    cb(null, file.originalname)
  }
});

var upload = multer({ //multer settings
  storage: storage
}).single('file');





// Tell the bodyparser middleware to accept more data
app.use(bodyParser.json({
  limit: '5mb'
}));
app.use(bodyParser.urlencoded({
  limit: '5mb',
  extended: true
}));


app.use('/api', routes);
app.use('/node_modules', express.static(__dirname + '/node_modules'));




var server = app.listen(app.get('port'), function() {
  var port = server.address().port;
  console.log('Magic happend on port ' + port);
});
