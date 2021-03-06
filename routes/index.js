var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');

/* GET home page. */
router.get('/', function(req, res, next) {
	var allMovies = 'http://www.imsdb.com/all%20scripts/';

	request(allMovies, function(err, response, html){
		var $ = cheerio.load(html);
		$ = cheerio.load($("h1:contains(\"All Movie Scripts\")").parent()[0])
		var movieTable = $("h1:contains(\"All Movie Scripts\")").parent();
		var allMovieTitles = $('a[href^="/Movie Scripts"]').map(function(thing){ 
			return $(this).text()
		})
		allMovieTitles = Array.prototype.slice.call(allMovieTitles);
		res.render('./index.html', {allMovieTitles: allMovieTitles});
	})
});

router.get('/api/getcast/:moviename', function(req,res) {
	var url = 'http://api.rottentomatoes.com/api/public/v1.0/movies.json';
	// url + ? + 'apikey=' + 	apiKey 
	var qs = {
		apikey : 'tg7n4r3efe9dezvrpk3t6j7m',
		q : req.params.moviename,
		page_limit : 1
	};
	request({url: url, qs: qs }, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			body = JSON.parse(body);
			var id = body.movies[0].id;
			castUrl = 'http://api.rottentomatoes.com/api/public/v1.0/movies/' + id + '/cast.json?apikey=tg7n4r3efe9dezvrpk3t6j7m';
			request({url: castUrl, qs: qs }, function (err, response, body) {
				body = JSON.parse(body);
				var characters = [ ];
				body.cast.forEach(function (char) {
					characters.push(char.characters[0]);
				});
				res.send(characters);
			});

		}
	});

});

router.get("/api/gender/:name", function(req,res){
	var name = req.params.name;
	request({url:"https://api.genderize.io/?name="+name},function(err, response, data){
		if (err) {
			console.log('Error: ', err);
			res.redirect('/');
			return;
		}
	    data =JSON.parse(data);
        res.send(data);
  	});
});

//will scrape for a particular movie by title
router.get('/api/scrape/:title', function(req, res){

	var title = req.params.title +' Script';
	var originalTitle = req.params.title;
	var allMovies = 'http://www.imsdb.com/all%20scripts/';

	request(allMovies, function(err, response, html){
		if (err) {
			console.log("error", err)
			res.send("wrong");
		}
		var $ = cheerio.load(html);
		var stringy = "a[title='"+title+"']"
		var linkToMovie = $(stringy).attr("href");

		request("http://www.imsdb.com"+linkToMovie, function(err, response, html){
			if (err) {
				console.log("error", err)
				res.send("wrong");
			}
			 
			 var $ = cheerio.load(html);
			 //var innerHTML2SearchBy = "Read \""+title + "\"";
			 var awesomeElement = "a:contains(Read \"" + originalTitle + "\" Script)"
			 var scriptLink = $(awesomeElement).attr("href");
			request("http://www.imsdb.com" + scriptLink, function (err, response, html)  {
				if (err){
					console.log("error", err)
					res.send("wrong");
				} 
				var $ = cheerio.load(html);
				var script = $('body').text();
				res.send(script);
			})

		})
	})
})

module.exports = router;

