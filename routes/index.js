var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var formidable = require("formidable");
var fs = require("fs");

//var url = 'mongodb://localhost:27017/score_board';
var url = 'mongodb://Sparksiano:Makakatlela2017!@ds117251.mlab.com:17251/score_board';

/* GET home page. */
router.get('/',function(req,res){

	MongoClient.connect(url, function(err, db){

		var score_list = db.collection("games");
		score_list.find({"date":"02-05-2017"}).toArray(function(err,scores){
			console.log(scores);

			var stories = db.collection("news");
			stories.find({}).toArray(function(err,news){

				if(err){
					console.log(err);
				}
				else{
					res.render('home',{title:'Score Board', scores:scores, news:news});
				}
			});
		});
	});
});

router.get('/log', function(req, res) {

	MongoClient.connect(url, function(err,db){

		var positions = db.collection("log");
		positions.find({}).toArray(function(err,standings){
			console.log(standings);
  			res.render('log', { title:'Score Board', standings:standings });
  		});
  	});
});

router.get("/statistics",function(req,res){

	MongoClient.connect(url, function(err,db){

		var shooters = db.collection("top_scorers");
		shooters.find({}).toArray(function(err,top_scorers){
			console.log(top_scorers);

			var setters = db.collection("assists");
			setters.find({}).toArray(function(err, assists){
				console.log(assists);
				res.render("statistics",{title:'Score Board', scorers:top_scorers, assists:assists });
			});
		});
	});
});

router.get("/news",function(req,res){

 	MongoClient.connect(url, function(err, db) {
		var reports = db.collection("news");
		reports.find({}).toArray(function(err,news){
			res.render("news",{title:"Score Board", news:news});
		});
 	});
});

router.get("/admin", function(req,res){

	res.render("score_board_admin",{title:"Score_Board"});
});

router.post('/score_entry', function(req, res) {

	//trying to parse with formidable
	var form = new formidable.IncomingForm();

	form.parse(req, function(err, fields, files) {

		var obj = {};
      	obj["team1"] = fields.team1;
      	obj["goals1"]= fields.goals1;
      	obj["goals2"]= fields.goals2;
      	obj["team2"] = fields.team2;
      	obj["date"]  = fields.date;

      	var points1, points2;
      	if (fields.goals1 > fields.goals2){
      		points1 = 3;
      		points2 = 0;
      	}else if (fields.goals2 > fields.goals1){ 
      		points2 = 3;
      		points1 = 0;
      	}else{
      		points1 = 1;
      		points2 = 1;
      		console.log("they are tied");
      	}

      	MongoClient.connect(url, function(err, db) {

      		var col = db.collection("games");
    		col.insert(obj, function(err, result) {
      			assert.equal(null, err);
      		});

      		var col2 = db.collection("log");
      		col2.update({"squad":fields.team1},{$inc:{"points":points1}});
      		col2.update({"squad":fields.team2},{$inc:{"points":points2}});
      	});
	});	

	res.render("score_board_admin",{title:"Score_Board"});
});

router.post('/log_entry', function(req, res) {

	//trying to parse with formidable
	var form = new formidable.IncomingForm();

	form.parse(req, function(err, fields, files) {

		var obj = {};
      	obj["squad"] = fields.squad;
      	obj["wins"]= fields.wins;
      	obj["draws"]= fields.draws;
      	obj["losses"] = fields.losses;
      	obj["points"] = fields.points;

      	MongoClient.connect(url, function(err, db) {

      		var col = db.collection("log");
    		col.insert(obj, function(err, result) {
      			assert.equal(null, err);
      		});
      	});
	});	

	res.render("score_board_admin",{title:"Score_Board"});
});

module.exports = router;
