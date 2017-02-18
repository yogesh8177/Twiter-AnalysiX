
var express = require('express');
var mongo = require('./database.js');
var constants = require('./constants.js');

var searchKey = constants.KEY;

var oldTime = "2017-01-06T18:57:31.745Z";
var WORDS = {};
var WORD_TOTAL_THRESHOLD = constants.THRESHOLD;
var HASHTAGS = {};
var COOCCURRENCE = {};
var IGNORE = {"a":1, "an":1, "as":1, "actually":1, "most":1, "takes":1, "just":1,"because":1, "called":1,"next":1, "till":1, "into":1, "without":1, "seen":1,"should":1, "live":1, "must":1, "long":1, "sure":1,"you":1, "thought":1, "made":1, "does":1, "do":1, "did":1, "didn't":1, "your":1, "yours":1, "give":1, "take":1,"when":1,"ready":1, "much":1, "about":1,"have":1, "here":1, "many":1, "make":1, "there":1, "more":1, "wants":1, "want":1, "with":1, "you're":1, "tell":1, "well":1, "that's":1, "them":1 , "the":1, "only":1, "over":1, "we've":1, "in":1, "of":1, "this":1,"than":1, "&amp;":1,"will":1,"http...":1, "was":1, "were":1, "need":1, "has":1, "been":1, "it":1, "that":1, "they":1,"i":1, "it's":1 , "is":1, "or":1, "for":1, "from":1, ".":1 , ",":1, "post":1, "back":1, "went":1, "then":1, "take":1, "where":1, "what":1, "why":1, "how":1, "near":1, "else":1, "if":1, "but":1, "can":1,"could":1, "would":1, "can't":1, "cannot":1, "say":1, "says":1, "said":1, "isn't":1, "some":1, "know":1, "get":1,"fucked":1, "fucking":1, "gets":1, "we’re":1, "he’ll":1, "you'll":1, "i'll":1,"thus":1, "they're":1, "maybe":1, "don't":1, "we're":1, "aren't":1};

var app = express();

app.get('/', function (req, res) {
  res.send('Welcome to Sentiment-AnalysiX Location Processing!'); 
});

app.get('/words', function (req, res) {
	var result = {};
	result.threshold = WORD_TOTAL_THRESHOLD;
	result.total = Object.keys(WORDS).length;
	result.words = WORDS;
  	res.send(result);
});

app.get('/hash', function (req, res) {
	var result = {};
	result.threshold = WORD_TOTAL_THRESHOLD;
	result.total = Object.keys(HASHTAGS).length;
	result.tags = HASHTAGS;
  	res.send(result);
});

app.get('/cowords', function (req, res) {
	var result = {};
	result.threshold = WORD_TOTAL_THRESHOLD;
	result.total = Object.keys(COOCCURRENCE).length;
	result.cooccurrence = COOCCURRENCE;
  	res.send(result);
});

app.listen(4004, function () {
  console.log('Example app listening on port 4004!');
});

mongo.connect(function(db){
	//connected to database!
	setInterval(function(){
		mongo.getText(searchKey, oldTime, function(result, datetime){ //param datetime returns latest timestamp for a record
	  		oldTime = datetime != null ? datetime : oldTime; //if returned datetime is null, keep previous dateime value
			
			updateWORDS(result);
			console.log(oldTime);
		});
	}, 5000);
});

function updateWORDS(result){

	result.forEach(function(item, index, arr){

		var words = item.text.replace(","," ").replace(".","").replace("\"","").split(" ");
		var cleanWords = removeStopWords(words);
		var size = cleanWords.length;

		cleanWords.forEach(function(word, i, a){
			var key = word;
		
			if(key.charAt(0) === '#'){
				if(HASHTAGS.hasOwnProperty(key))
					HASHTAGS[key]++;
				else
					HASHTAGS[key] = 1;
					
			}else{
				if(WORDS.hasOwnProperty(key)){
					WORDS[key]++;
					//COOCCURRENCE[key][i + 1 < size ? cleanWords[i + 1] : "no"]++;
					if(i + 1 < size - 1 && COOCCURRENCE[key+" "+cleanWords[i + 1]])
						COOCCURRENCE[key+" "+cleanWords[i + 1]]++;
				}else{
					WORDS[key] = 1;
					if(i + 1 < size - 1)
						COOCCURRENCE[key+" "+ cleanWords[i + 1]] = 1;
					//COOCCURRENCE[key][key] = 1;
				}
			}

		});
		
	});
	calculateThreshold(WORDS, function(){
		trimWords(WORDS);
		trimCOWORDS(COOCCURRENCE);
		trimHashTags(HASHTAGS);
		addToDB(WORDS, HASHTAGS, COOCCURRENCE, searchKey);
	});
	
	
}

function removeStopWords(words){
	var result = [];
	words.forEach(function(word, index, arr){
		var key = word.toLowerCase().trim();
		key = key.replace(/[@\.]/g,"");

		if(!IGNORE.hasOwnProperty(key) && key.length > 3){
			result.push(key);
		}
	});
	return result;
}

function calculateThreshold(words, callback){
	var totalFreq = 0;
	var totalWords = Object.keys(words).length;console.log("Total Words: "+totalWords);

	for(var property in words){
		totalFreq += words[property] * 0.5;
	}
	console.log("Total Frequency: "+totalFreq);
	WORD_TOTAL_THRESHOLD = totalFreq / totalWords;console.log("THRESHOLD: "+WORD_TOTAL_THRESHOLD);
	callback();
}

function trimWords(words){

	for(var property in words){
		if(words.hasOwnProperty(property)){
			if(words[property] < WORD_TOTAL_THRESHOLD)
				delete words[property];
		}
	}
}

function trimCOWORDS(cooccurrence){

	for(var property in cooccurrence){
		if(cooccurrence.hasOwnProperty(property)){
			if(cooccurrence[property] < WORD_TOTAL_THRESHOLD)
				delete cooccurrence[property];
		}
	}
}

function trimHashTags(hashTags){

	for(var property in hashTags){
		if(hashTags.hasOwnProperty(property)){
			if(hashTags[property] < WORD_TOTAL_THRESHOLD)
				delete hashTags[property];
		}
	}
}

function addToDB(Words, Hashtags, Cowords, Key){

	mongo.addWords(Words, Hashtags, Cowords, Key);
}





