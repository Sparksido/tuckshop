var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var formidable = require("formidable");
var fs = require("fs");

var url = 'mongodb://localhost:27017/tuckshop';

/* GET home page. */
router.get('/',function(req,res){
	res.render('home',{title:'The Market', section:"Welcome visitor"});
});

router.get('/index', function(req, res) {
  	res.render('index', { title: 'Tuck Shop' });
});

/* getting the login page */
router.get("/login",function(req,res){
	res.render("login",{title: "Tuck Shop", message:""});
});

router.get("/market",function(req,res){

	MongoClient.connect(url, function(err, db) {

		// set up a variable for the collection
		var shop_repo = db.collection("stores");

		//fetch the data from the collection
		shop_repo.find({}).toArray(function(err,docs){
			assert.equal(null,err);
			res.render("market",{section:'The Market',data:docs, title: "the market"});
		});
	});
});

router.post('/store',function(req,res){

	//trying to parse with formidable
	var form = new formidable.IncomingForm();

	form.parse(req, function(err, fields, files) {
		if(err){
			console.log("the err is:  "+ err);
		}else{
			console.log("the store name is: "+fields.store_name);
		}

		// get all the products in the selected store
		MongoClient.connect(url, function(err, db) {

			// set up a variable for the collection
			var merchandise = db.collection("products");

			//fetch the data from the collection
			console.log("the store name again is: "+fields.store_name);
			merchandise.find({store_name:fields.store_name}).toArray(function(err,docs){
				assert.equal(null,err);
				shops = docs;
				console.log(docs);
				res.render("store",{stock:docs, title: "the market", store_name:fields.store_name});
			});
		});
	});

});

module.exports = router;
