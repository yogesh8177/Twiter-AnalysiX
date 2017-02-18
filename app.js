
var express = require('express');
var mongo = require('./database.js');
var twitter = require('./twitterEngine.js');
var constants = require('./constants.js');

var searchKey = constants.KEY;

var app = express();

app.get('/', function (req, res) {
  res.send('Welcome to Sentiment-AnalysiX'); 
});

app.get('/data', function(req, res){
	mongo.get(searchKey, function(result){
		res.send(result);
	});	
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

mongo.connect(function(db){
	twitter.startStream(searchKey, db);
});





