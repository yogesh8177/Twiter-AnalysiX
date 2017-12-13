var twitter = require('twitter');
var assert = require('assert');

var counter = 0;

var self = module.exports = {
	client: new twitter({
		  consumer_key: process.env.consumer_key,
		  consumer_secret: process.env.consumer_secret,
		  access_token_key: process.env.access_token_key,
		  access_token_secret: process.env.access_token_secret
	}),
	startStream: function(key, db){
		var stream = self.client.stream('statuses/filter', {track: key, language:'en'});
			stream.on('data', function(event) {
			event.created_at = new Date();
			db.collection(key).insertOne(event, function(err, result){
				assert.equal(err, null);
			});
			console.log(++counter);
		});
			 
		stream.on('error', function(error) {
		  console.log(error);
		  //throw error;
		});
	}
};
