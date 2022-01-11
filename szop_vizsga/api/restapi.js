var http = require("http");
var express = require('express');
const app = express();
var mysql      = require('mysql');
var bodyParser = require('body-parser');
var loggedin = false;

const swaggerUI = require("swagger-ui-express"),swaggerDocument = require('./openapi.json');

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ?? 3000;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MotoGP API",
      version: "1.0.0",
      description: "The documentation of the MotoGP API",
    },
    servers: [
      {
        url: `http://${host}:${port}`,
      },
    ],
  },
  apis: ["./*.js"],
};


//app.get("./swagger.json", (req, res) => res.json(specs))
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));


var connection = mysql.createConnection({
  host     : 'localhost', //mysql database host name
  user     : 'root', //mysql database user name
  password : '', //mysql database password
  database : 'motogp' //mysql database name
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("A csatlakozás sikerült...");
});

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var server = app.listen(3000,  "127.0.0.1", function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Listening on http://%s:%s", host, port)

});



app.get('/motogp', function (req, res) {
  console.log("belép")
   connection.query('select * from results', function (error, results, fields) {
	  if (error) throw error;
		  res.json(results);
      console.log(results);

	});
});


app.post('/motogp/:login', function(request, response) {
	var username = request.body.usernameCode;
	var password = request.body.userpasswordCode;
  if (username && password) {
  		connection.query('SELECT * FROM users WHERE userName = ? AND userPassword = ?', [username, password], function(error, results, fields) {
  			if (results.length > 0) {
          console.log("sikeres bejelentkezés")
          if (results.userIsAdmin = 1) {
            response.send('succes_login_admin');
            loggedin = true;
          }
          else {
            response.send('succes_login_user');
            loggedin = true;
          }

  			} else {
  				response.send('incorrect_credentials');
          console.log("sikeretelen bejelentkezés")
  			}
  			response.end();
  		});
  	} else {
  		response.send('not_enough_information');
  		response.end();
  	}
});


app.post('/motogp', function (req, res) {
   var postData  = req.body;
   connection.query('INSERT INTO results SET ?', postData, function (error, results, fields) {
	  if (error) throw error;
	  res.end(JSON.stringify(results));
	});
});



app.put('/motogp', function (req, res) {
   console.log("belép2")
   var raceIDJS = req.body.raceId;
   var raceNameJS = req.body.raceName;
   var raceWinnerJS = req.body.raceWinner;
   var raceTeamJS = req.body.raceConstructor;
   console.log('------')
   console.log(raceIDJS)
   console.log(raceNameJS)
   console.log(raceWinnerJS)
   console.log(raceTeamJS)
   console.log('------')
   connection.query('UPDATE results SET raceName = ?, raceWinner = ?, raceConstructor = ? WHERE raceID = ?', [raceNameJS,raceWinnerJS,raceTeamJS,raceIDJS], function (error, results, fields) {
	  if (error) throw error;
	  res.end(JSON.stringify(results));
	});
});


app.delete('/motogp', function (req, res) {
   if (loggedin == true) {
     console.log('belép delete')
     var delID = req.body.DelraceID;
     connection.query('DELETE FROM results WHERE raceID = ?', [delID], function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    });
   }
   else {
     console.log("Not logged in");
     res.send('usernotloggedin');
   }
});

app.post('/motogp/:logout', function (req, res) {
  loggedin = false;
});
