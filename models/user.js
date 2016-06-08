'use strict';

//getting instance of mongoose and mongoose.Schema

let mongoose = require('mongoose');

let Schema = mongoose.Schema;


let userSchema = new Schema({

	name:String,
	password:String,
	admin:Boolean
	//versionKey:false //it is maily used for checking the version of document " __v " or configurable
},{versionKey:false},{collection:'u'});    

//db name is given in config file and collection name is given with schema

let User = mongoose.model('User',userSchema);

module.exports = User;

