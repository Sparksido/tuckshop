var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var formidable = require("formidable");
var fs = require("fs");

var url = 'mongodb://localhost:27017/score_board';

/* GET home page. */
router.get('/',function(req,res){

	MongoClient.connect(url, function(err, db){

		var score_list = db.collection("games");
		score_list.find({}).toArray(function(err,scores){
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

// router.post('/store',function(req,res){

// 	//trying to parse with formidable
// 	var form = new formidable.IncomingForm();

// 	form.parse(req, function(err, fields, files) {
// 		if(err){
// 			console.log("the err is:  "+ err);
// 		}else{
// 			console.log("the store name is: "+fields.store_name);
// 		}

// 		// get all the products in the selected store
// 		MongoClient.connect(url, function(err, db) {

// 			// set up a variable for the collection
// 			var merchandise = db.collection("products");

// 			//fetch the data from the collection
// 			console.log("the store name again is: "+fields.store_name);
// 			merchandise.find({store_name:fields.store_name}).toArray(function(err,docs){
// 				assert.equal(null,err);
// 				shops = docs;
// 				console.log(docs);
// 				res.render("store",{stock:docs, title: "the market", store_name:fields.store_name});
// 			});
// 		});
// 	});

// });

module.exports = router;
