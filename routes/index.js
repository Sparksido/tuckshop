var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://localhost:27017/tuckshop';

/* GET home page. */
router.get('/', function(req, res) {
	res.cookie('firstcookie','test_name');
  	res.render('index', { title: 'Tuck Shop' });
});

/* getting the login page */
router.get("/login",function(req,res){
	res.render("login",{title: "Tuck Shop", message:""});
});

router.get("/market",function(req,res){

	var shops = {};

	MongoClient.connect(url, function(err, db) {

		// set up a variable for the collection
		var shop_repo = db.collection("stores");

		//fetch the data from the collection
		shop_repo.find({}).toArray(function(err,docs){
			assert.equal(null,err);
			shops = docs;
			//console.log(docs);
			res.render("market",{section:'The Market',data:docs, title: "the market"});
		});
	});
	//console.log(shops);
	//res.render("market",{section:'The Market',data:shops});
});

router.get('/store',function(req,res){
	res.render("store",{title: "this store"});
});

module.exports = router;
