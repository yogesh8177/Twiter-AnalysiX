
var express = require('express');
var mongo = require('./database.js');
var constants = require('./constants.js');

var searchKey = constants.KEY;

var oldTime = "2017-01-06T18:57:31.745Z";
var MEDIA = {};
var MEDIA_TOTAL_THRESHOLD = 0;


var app = express();

app.get('/', function (req, res) {
  res.send('Welcome to Sentiment-AnalysiX Media Processing!'); 
});

app.get('/media', function (req, res) {
	var result = {};
	result.total = Object.keys(MEDIA).length;
	result.media = MEDIA;
  	res.send(result);
});

app.listen(5005, function () {
  console.log('Example app listening on port 5005!');
});

mongo.connect(function(db){
	//connected to database!
	setInterval(function(){
		mongo.getMedia(searchKey, oldTime, function(result, datetime){ //param datetime returns latest timestamp for a record
	  		oldTime = datetime != null ? datetime : oldTime; //if returned datetime is null, keep previous dateime value
			
			updateMedia(result);
			console.log(oldTime);
		});
	}, 5000);
});

function updateMedia(result){

	result.forEach(function(item, index, arr){
		var urls = item.entities.urls;

		urls.forEach(function(url, i, a){
			var key = url.expanded_url != null ? url.expanded_url : null;

			if(MEDIA.hasOwnProperty(key)){
				MEDIA[key]++;
			}else{
				MEDIA[key] = 1;
			}

			
		});
		
	});
	calculateThreshold(MEDIA, function(){
		trimMedia(MEDIA);
	});
}

function trimMedia(media){

	for(var property in media){
		if(media.hasOwnProperty(property)){
			if(media[property] < MEDIA_TOTAL_THRESHOLD)
				delete media[property];
		}
	}
}

function calculateThreshold(media, callback){
	var totalFreq = 0;
	var totalWords = Object.keys(media).length;console.log("Total Words: "+totalWords);

	for(var property in media){
		totalFreq += media[property] * 0.5;
	}
	console.log("Total Frequency: "+totalFreq);
	MEDIA_TOTAL_THRESHOLD = totalFreq / totalWords;console.log("THRESHOLD: "+MEDIA_TOTAL_THRESHOLD);
	callback();
}





