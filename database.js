var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var DB = null;

module.exports = {
	connect: function(callback){
		var url = 'mongodb://localhost:27017/sentiment';
		MongoClient.connect(url, function(err, db) {
		  assert.equal(null, err);
		  console.log("Connected correctly to mongo server.");
		  //db.close();
		  DB = db;
		  callback(db);
		});
	},
	get: function(key, callback){
		var result = [];
		var cursor = DB.collection(key).find();
		cursor.each(function(err, doc){
			assert.equal(null,err);
			if(doc == null)
				callback(result);
			result.push(doc);
		});
	},
	getLocation: function(key, oldTime, callback){
		var result = [];
		var cursor = DB.collection(key).find({"user.location":{$ne:null}, "created_at": {$gt: new Date(oldTime)}},{"user.location":1, "created_at": 1}).sort({ created_at : -1 });
		cursor.each(function(err, doc){
			assert.equal(null,err);
			if(doc == null)
				callback(result, result.length != 0 ? result[0].created_at : null);
			result.push(doc);
		});
	},

	getSources: function(key, oldTime, callback){
		var result = [];
		var cursor = DB.collection(key).find({"source":{$ne:null}, "created_at": {$gt: new Date(oldTime)}},{"source":1, "created_at": 1}).sort({ created_at : -1 });
		cursor.each(function(err, doc){
			assert.equal(null,err);
			if(doc == null)
				callback(result, result.length != 0 ? result[0].created_at : null);
			result.push(doc);
		});
	},

	getMedia: function(key, oldTime, callback){
		var result = [];
		var cursor = DB.collection(key).find({"entities.urls":{$ne:null}, "created_at": {$gt: new Date(oldTime)}},{"entities.urls":1, "created_at": 1}).sort({ created_at : -1 });
		cursor.each(function(err, doc){
			assert.equal(null,err);
			if(doc == null)
				callback(result, result.length != 0 ? result[0].created_at : null);
			result.push(doc);
		});
	},

	getText: function(key, oldTime, callback){
		var result = [];
		var cursor = DB.collection(key).find({"text":{$ne:null}, "created_at": {$gt: new Date(oldTime)}},{"text":1, "created_at": 1}).sort({ created_at : -1 });
		cursor.each(function(err, doc){
			assert.equal(null,err);
			if(doc == null)
				callback(result, result.length != 0 ? result[0].created_at : null);
			result.push(doc);
		});
	}, 

	addWords: function(Words, Hashtags, Cowords, Key){
		var date = new Date();
		var words = {}, hashtags = {}, cowords = {};
		Object.assign(words, Words);
		words.created_at = date;
		Object.assign(hashtags,Hashtags);
		hashtags.created_at = date;
		Object.assign(cowords,Cowords);
		cowords.created_at = date;

		DB.collection(Key+"_words").remove({},function(err, output){
			DB.collection(Key+"_words").insertOne(words, function(err, result){
				if(err)
					console.log(err);
				//assert(null,err);

			});
		});
		
		DB.collection(Key+"_cowords").remove({}, function(err, output){
			DB.collection(Key+"_cowords").insertOne(cowords, function(err, result){
				if(err)
					console.log(err);
				//assert(null,err);
			});
		});

		
		DB.collection(Key+"_hashtags").remove({},function(err, output){
			DB.collection(Key+"_hashtags").insertOne(hashtags, function(err, result){
				if(err)
					console.log(err);
				//assert(null,err);
			});
		});
		
	}

}

