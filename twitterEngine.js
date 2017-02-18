var twitter = require('twitter');
var assert = require('assert');

var counter = 0;

var self = module.exports = {
	client: new twitter({
		  consumer_key: 'NnWRJHyTjdmO0lp29D3wjb9xP',
		  consumer_secret: 'ldt9aFuIT7x8YnSLnCB6WJZkYceVMLpskoBnm4BWtpcyE1wA1H',
		  access_token_key: '3517683260-naUNXXFzvNPFxKbBro2YOJZ6057ATD0KpDVmPR3',
		  access_token_secret: '0PUNy18mcUt1wNzlfXzpwiafdI62aRccMjGtAijNKzgP6'
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