var http = require("http");
var express = require('express');
var app = express();
var mysql      = require('mysql');
var bodyParser = require('body-parser');
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ?? 3000;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MotoGP API",
      version: "1.0.0",
      description: "The documentation of the NodeJS API",
    },
    servers: [
      {
        url: `http://${host}:${port}`,
      },
    ],
  },
  apis: ["./*.js"],
};

const specs = swaggerJsDoc(options);


app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));


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

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var server = app.listen(3000,  "127.0.0.1", function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Listening on http://%s:%s", host, port)

});

/*
@swagger
components:
  securitySchemes:
    BasicAuth:
      type: http
      scheme: basic
  schemas:
    Results:
      type: object
      required:
        - raceName
        - raceWinner
        - raceConstructor
      properties:
        id:
          type: integer
          description: The auto-generated id of the event
        raceName:
          type: string
          description: The name of the event
        raceWinner:
          type: string
          description: The winner of the event
        raceConstructor:
          type: string
          description: The winners team of the event
      example:
        id: 2
        name: Tissot Grand Prix of Doha
        salary: Fabio Quartararo
        age: Monster Energy Yamaha MotoGP
  Users:
    type: object
    required:
      - userName
      - userPassword
    properties:
      id:
        type: integer
        description: The auto-generated id of the event
      userName:
        type: string
        description: The username of the user
      userPassword:
        type: string
        description: The password of the user
    example:
      id: 1
      userName: admin
      userPassword: admin
*/




/*
@swagger
/motogp:
    get:
      description: Returns all The main events of the MotoGP calendar in the database
      responses:
        '200':
          description: Successfully returned a list of Events
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Results'
        '400':
          description: Invalid request
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
*/

app.get('/motogp', function (req, res) {
  console.log("belép")
   connection.query('select * from results', function (error, results, fields) {
	  if (error) throw error;
		  //res.end(JSON.stringify(results)); // ez nem megy, a res.end nem állít be megfelelő header-t!!
		  res.json(results);
      console.log(results);

	});
});

/*
@swagger
/motogp/:login:
    post:
      description: POST method for login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Users'
      responses:
        '200':
          description: Successfully returned a user
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Users'
        '400':
          description: Invalid request
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
*/

app.post('/motogp/:login', function(request, response) {
	var username = request.body.usernameCode;
	var password = request.body.userpasswordCode;
  if (username && password) {
  		connection.query('SELECT * FROM users WHERE userName = ? AND userPassword = ?', [username, password], function(error, results, fields) {
  			if (results.length > 0) {
          console.log("sikeres bejelentkezés")
          if (results.userIsAdmin = 1) {
            response.send('succes_login_admin');
          }
          else {
            response.send('succes_login_user');
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

/*
@swagger
/motogp
  post:
    description: Adds a new Event into the calendar
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Results'
    responses:
      '200':
        description: Successfully created a new event
      '400':
        description: Invalid request
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
*/


app.post('/motogp', function (req, res) {
   var postData  = req.body;
   connection.query('INSERT INTO results SET ?', postData, function (error, results, fields) {
	  if (error) throw error;
	  res.end(JSON.stringify(results));
	});
});


/*
@swagger
/motogp
  put:
    description: Updates the list of events in the SQL database
    requestBody:
      required: true
      content:
        application/json:
          schema:
              type: integer
              description: Numeric ID of the event to update.
              example:
                id: 2
    responses:
      '200':
        description: Successfully created a new event
      '400':
        description: Invalid request
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
*/

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

/*
@swagger
/motogp
  delete:
    description: Delete an employee by id
    responses:
      '200':
        description: Successfully removed the event
      '400':
        description: Invalid request
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
*/


app.delete('/motogp', function (req, res) {
   console.log('belép delete')
   var delID = req.body.DelraceID;
   connection.query('DELETE FROM results WHERE raceID = ?', [delID], function (error, results, fields) {
	  if (error) throw error;
	  res.end(JSON.stringify(results));
	});
});
