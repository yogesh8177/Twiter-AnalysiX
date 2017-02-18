
var express = require('express');
var mongo = require('./database.js');
var constants = require('./constants.js');

var searchKey = constants.KEY;
var oldTime = "2017-01-06T18:57:31.745Z";
var SOURCES = {};


var app = express();

app.get('/', function (req, res) {
  res.send('Welcome to Sentiment-AnalysiX Sources Processing!'); 
});

app.get('/source', function (req, res) {
	var result = {};
	result.total = Object.keys(SOURCES).length;
	result.sources = SOURCES;
  	res.send(result);
});

app.listen(5000, function () {
  console.log('Example app listening on port 5000!');
});

mongo.connect(function(db){
	//connected to database!
	setInterval(function(){
		mongo.getSources(searchKey, oldTime, function(result, datetime){ //param datetime returns latest timestamp for a record
	  		oldTime = datetime != null ? datetime : oldTime; //if returned datetime is null, keep previous dateime value
			
			processSources(result);
			console.log(oldTime);
		});
	}, 5000);
});

function processSources(result){

	result.forEach(function(item, index, arr){
		var matches = item.source.match(/>([^<]*)/);
		var key = matches != null ? matches[1].toLowerCase().trim() : null;

		if(key && isValid(key)){

			if(SOURCES.hasOwnProperty(key)){
				SOURCES[key]++;
			}else{
				SOURCES[key] = 1;
			}
		}
		
	});
}

function isValid(key){
	var sources = key.split(" ");
	return sources.length <= 3 ? true : false;
}



