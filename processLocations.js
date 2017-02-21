
var express = require('express');
var mongo = require('./database.js');
var constants = require('./constants.js');

var searchKey = constants.KEY;

var oldTime = "2017-01-06T18:57:31.745Z";
var LOCATIONS = {};
var SOURCES = {};
var LOCATION_TOTAL_THRESHOLD = 0;


var app = express();

app.get('/', function (req, res) {
  res.send('Welcome to Sentiment-AnalysiX Location Processing!'); 
});

app.get('/loc', function (req, res) {
	var result = {};
	result.total = Object.keys(LOCATIONS).length;
	result.locations = LOCATIONS;
  	res.send(result);
});

app.listen(4000, function () {
  console.log('Example app listening on port 4000!');
});

mongo.connect(function(db){
	//connected to database!
	setInterval(function(){
		mongo.getLocation(searchKey, oldTime, function(result, datetime){ //param datetime returns latest timestamp for a record
	  		oldTime = datetime != null ? datetime : oldTime; //if returned datetime is null, keep previous dateime value
			
			updateLocations(result);
			console.log(oldTime);
		});
	}, 5000);
});

function updateLocations(result){

	result.forEach(function(item, index, arr){
		var key = item.user.location.toLowerCase().trim();
		var locations = splitLocations(key);

		locations.forEach(function(loc, index,arr){
			if(LOCATIONS.hasOwnProperty(loc)){
				LOCATIONS[loc]++;
			}else{
				LOCATIONS[loc] = 1;
			}
		});
		
	});
	calculateThreshold(LOCATIONS, function(){
		trimLocations(LOCATIONS);
	});
}

function splitLocations(key){
	var locations = key.split(",");
	var locArray = [];
	locations.forEach(function(loc, index, arr){
		locArray.push(loc.trim());
	});

	return locArray;
}

function trimLocations(locations){

	for(var property in locations){
		if(locations.hasOwnProperty(property)){
			if(locations[property] < LOCATION_TOTAL_THRESHOLD)
				delete locations[property];
		}
	}
}

function calculateThreshold(locations, callback){
	var totalFreq = 0;
	var totalWords = Object.keys(locations).length;console.log("Total Locations: "+totalWords);

	for(var property in locations){
		totalFreq += locations[property] * 0.5;
	}
	console.log("Total Frequency: "+totalFreq);
	LOCATION_TOTAL_THRESHOLD = totalFreq / totalWords;console.log("THRESHOLD: "+LOCATION_TOTAL_THRESHOLD);
	callback();
}



