'use strict';

//+++++++++++++
// getting packages
//+++++++++++++

let express	 = require('express');
let app 	 = express();
let bodyParser   = require('body-parser');
let morgan       = require('morgan');
let mongoose     = require('mongoose');
let jwt		 = require('jsonwebtoken');
let config	 = require('./config.js');
let User	 = require('./models/user.js');

//+++++++++++++
//   configurations
//+++++++++++++
let port = process.env.PORT || 8080;

mongoose.connect(config.database);

app.set('superSecret',config.secret);

//used bodyParser for getting data from POST and URL params
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//used morgan to log requests to console
app.use(morgan('dev'));



//++++++++++++++++
//   routing
//++++++++++++++++

app.get('/',function(req,res){
	
	res.send('Hello from API baby ');
});



//adding new user to db
app.get('/setup',function(req,res){

	//creating a sample user
	
	let udit = new User({
		name:'Udit Kumawat',
		password:'admin',
		admin:true
	});

	//saving the sample user
	udit.save(function(err){
		if(err)
		{	
			throw err;
		}
		else
		{
			console.log('User Saved successfully');
			res.json({success:true});
		}
	});
});






//++++++++++++++++
//    API routes
//++++++++++++++++

let apiRoutes = express.Router();


//route to authenticate a user POST http://localhost:8080/api/authenticate
apiRoutes.post('/authenticate',function(req,res){
	
	User.findOne({name : req.body.name},function(err,user){
		
		if(err)
		{
			throw err;
		}
		
		if(!user)
		{
			res.json({success:false,message:'Authenticate failed.User not found.'});
		}
		else if(user)
		{
			if(user.password!==req.body.password)
			{
				res.json({success:false,message:'Authentication failed.Wron Password'});
			}
			else
			{
				let token = jwt.sign(user,app.get('superSecret'),{
					expiresIn:1440
				});

				res.json({
					success:true,
					message:'Enjoy your token',
					token:token
				});
			}
		}
	});
});


apiRoutes.use(function(req,res,next){
	
	//checking header or url params or post params for token
	let token = req.body.token || req.query.token || req.headers['x-access-token'];

	if(token)
	{
		jwt.verify(token,app.get('superSecret'),function(err,decoded){
			
			if(err)
			{
				return res.json({
					success:false,
					message:'Failed to authenticate token'
				});
			}
			else
			{
				req.decoded = decoded;
				next();	
			}
		});
	}
	else
	{
		return res.status(403).send({
			success:false,
			message:'No token provided'
		});
	}
});


//route to show a random message
apiRoutes.get('/',function(req,res){
 
          res.json({message:'Welcome to my API'});
});
  
  
  
//route to return all users
apiRoutes.get('/users',function(req,res){
  
          User.find({},function(err,users){
  
                  res.json(users);
          });
});

//apply the routes to our application with the prefix /api
app.use('/api',apiRoutes);






//+++++++++++++++++
//   starting server
//+++++++++++++++++
app.listen(port);

console.log('Server is running');
