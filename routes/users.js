var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var formidable = require("formidable");
var http = require("http");
var util = require("util");
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var fs = require("fs");

//connecting to the mongodb database
// Connection URL
var url = 'mongodb://localhost:27017/tuckshop';

// Use connect method to connect to the server
/*MongoClient.connect(url, function(err, db) {
  	assert.equal(null, err);
  	console.log("Connected successfully to server");
  	db.close();
});*/

/* GET users listing. */
router.post('/', function(req, res) {

	// log the cookies
	console.log("cookies:",req.cookies);

	//trying to parse with formidable
	var form = new formidable.IncomingForm();

	form.parse(req, function(err, fields, files) {

		//set the cookies
		res.cookie("description",fields.description);
		res.cookie("store_name",fields.store_name);
        //res.writeHead(200, {'content-type': 'text/plain'});
        res.render("layout",{title:"Tuck Shop", name:fields.name, store_name:fields.store_name});
        //res.write('received upload:\n\n');
        //res.end(util.inspect({fields: fields, files: files}));
        
        MongoClient.connect(url, function(err, db) {
  			// choose the stores collection
  			var col = db.collection('stores');
  			// Insert fields into database
  			col.insert(fields, function(err, result) {
    			assert.equal(null, err);
    		});
    	});
    });

    // Cookies that have been signed
  	console.log('Signed Cookies: ', req.signedCookies)
});

router.post("/login_receiver",function(req,res){
	var form3 = new formidable.IncomingForm();

	console.log(req.body);

	//variable to collect the store name
	var name_storage;

	form3.parse(req, function(err, fields, files) {

		//set the cookie
   		res.cookie("store_name",fields.given_name);

        //connecting to the database to check the password matches
        MongoClient.connect(url, function(err, db) {
  			// choose the stores collection
  			var estabs = db.collection('stores');
  			// Insert fields into database
  			estabs.findOne({"store_name":fields.given_name},function(err,retails){
  				
  				//finally rendering the layout page
    			if(fields.given_pass == retails.password){
    				res.render("layout",{title:"Tuck Shop", name:"typical Jeweler", store_name:fields.given_name});
    			}else{
    				res.render("login",{title: "Tuck Shop", message:"wrong password"});
    			}
  			});
    	});
    });
});

router.get("/layout",function(req,res){
	res.render("layout", {title:"Tuck Shop", name:req.cookies.store_name, store_name:req.cookies.store_name});
});

router.get("/specials",function(req,res){
	res.render("specials", {store_name:req.cookies.store_name});
});

router.get("/orders",function(req,res){
	res.render("orders", {store_name:req.cookies.store_name});
});

router.get("/activity",function(req,res){
	res.render("activity", {store_name:req.cookies.store_name});
});

router.get("/settings",function(req,res){
	res.render("settings", {store_name:req.cookies.store_name});
});

router.post("/pro_pic",function(req,res){

	var form2 = new formidable.IncomingForm();
	form2.uploadDir = '/home/mopati/exp_proj_3/public/images/';

	form2.parse(req, function(err, fields, files) {

      	//I'm not entirely sure what this line does but it seems important according to the docs
      	res.end(util.inspect({fields: fields, files: files}));
		console.log("the image was uploaded successfully");

		//assigning the strore name to a variable
		var store_name = req.cookies.store_name;

		//renaming the image to what the store's name is + _pro_pic
		fs.rename(files.product_image.path,'/home/mopati/exp_proj_3/public/images/'+ store_name +"_pro_pic.jpg");

		//updating the store item data document to add a profile pic field
		MongoClient.connect(url, function(err, db) {
	  			// choose the stores collection
	  			var entry = db.collection('stores');
	  			// updating the fields in the database
	  			entry.updateOne(
	  			{
	  				"store_name":req.cookies.store_name
	  			},{
	    			$set:{"profile_pic":req.cookies.store_name + "_pro_pic.jpg"}
	    			//$currentDate:{lastModified:true}
	    		});
	    	});
	});

	res.render("layout", {title:"Tuck Shop", name:req.cookies.name, store_name:req.cookies.store_name});
});

router.get("/upload",function(req,res){
	res.render("upload", {title:"Tuck Shop", store_name:req.cookies.store_name});
});

router.post("/upload_receiver",function(req,res){
	
	//new form for upload
	var form2 = new formidable.IncomingForm();
	form2.uploadDir = '/home/mopati/exp_proj_3/public/images/';

	form2.parse(req, function(err, fields, files) {

      	res.end(util.inspect({fields: fields, files: files}));
		console.log("the image was uploaded successfully");

  		var product_name = fields.product_name;
  		var description = fields.description;
  		var store = req.cookies.store_name;
  		console.log("the store is"+store);
  		var price = fields.price;
  		var obj = {};
  		obj["store_name"] = store;
  		obj["product_name"] = product_name;
  		obj["description"] = description;
  		obj["price"]=price;
  		//json.stringify(obj);
  		console.log(obj);

  		console.log("fields are:");
  		console.log(fields);
  		console.log("and the files are:"); 	
		console.log(files);  		

  		fs.rename(files.product_image.path,'/home/mopati/exp_proj_3/public/images/'+product_name);

      	MongoClient.connect(url, function(err, db) {
  			// choose the products collection
  			var row = db.collection('products');
  			// Insert fields into database

  			row.insert(obj, function(err, result) {
    			assert.equal(null, err);
    		});
    	});
    });

	form2.on('error', function(err) {
		console.log(err);
	});
	res.render("upload", {title:"Tuck Shop", store_name:req.cookies.store_name});
});
  
module.exports = router;
