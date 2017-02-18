var twitter = require('twitter');
var assert = require('assert');

var counter = 0;

var self = module.exports = {
	client: new twitter({
		  consumer_key: 'Your Key',
		  consumer_secret: 'Your Secret',
		  access_token_key: 'Your Key',
		  access_token_secret: 'Your Secret'
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
		  throw error;
		});
	}
};
