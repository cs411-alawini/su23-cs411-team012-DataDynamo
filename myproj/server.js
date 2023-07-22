var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql2');
var path = require('path');
var connection = mysql.createConnection({
                host: '34.31.74.182',
                user: 'root',
                password: 'DataDynamo',
                database: 'chronic_illness_data'
});

connection.connect;


var app = express();

// set up ejs view engine 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '../public'));

/* renders front page */
app.get('/', function(req, res) {
  res.render('new_login');
});

//global variable so that the userid can be accessed for any operation
var userid; 

/* for creating, then redirects to the symptoms page */
app.post('/creating', function(req, res) {
  userid = req.body.user_id;
  var numAge = req.body.age;
  var gender = req.body.sex;

  var sql = `INSERT INTO Users(user_id, age, sex, trackable_type) VALUES ('${userid}','${numAge}','${gender}','temp')`;

  console.log(sql);
  connection.query(sql, function(err, result) {
    if(err) {
      res.send(err);
      return;
    }

    res.redirect('/symptom');
  });
});

/* renders page where we input symptom */
app.get('/symptom', function(req, res) {
  res.render('symptom');
});

/* for deleting, then redirects back to first page */
app.get('/deleting', function(req, res) {
  var sql = `DELETE FROM Users WHERE user_id = '${userid}'`;

  console.log(sql);
  connection.query(sql, function(err, result) {
    if(err) {
      res.send(err);
      return;
    }

    res.redirect('/');
  });
});


/* renders the page where we can update age */
app.get('/updating', function(req, res) {
  res.render('updating');
});

/* for updating */
app.post('/back_symptoms', function(req, res) {
  var newAge = req.body.newage;

  var sql = `UPDATE Users SET age = '${newAge}' WHERE user_id = '${userid}'`;

  console.log(sql);
  connection.query(sql, function(err, result) {
    if (err) {
      res.send(err);
      return;
    }

    res.redirect('/symptom');
  });
});


app.post('/reading', function(req, res) {
  var conditionCheck = req.body.conditionCheckbox; //should be a boolean
  var treatmentCheck = req.body.treatmentCheckbox; //should be a boolean
  console.log(conditionCheck);
  console.log(treatmentCheck);

  var symptom = req.body.symptomInput; //should contain a string
  console.log(symptom);
  var sql;

  if (conditionCheck == 'on') {
    //adv query 2
    sql = `SELECT c.trackable_name as conditions,COUNT(c.trackable_name) as conditionCount FROM 
    Conditions c WHERE c.user_id IN(SELECT s.user_id FROM Symptoms s WHERE (s.trackable_name = 
    'fatigue' OR s.trackable_name = 'Nausea') AND s.trackable_value >= 3) GROUP BY conditions 
    ORDER BY conditionCount DESC LIMIT 15`;
  } else if (treatmentCheck == 'on') {
    //adv query 1
/*
    sql = `SELECT t.trackable_name as treatments, COUNT(t.trackable_name) as treatmentCount FROM 
    Treatments t WHERE t.user_id IN(SELECT s.user_id FROM Symptoms s JOIN Conditions c ON 
    s.user_id = c.user_id WHERE (s.trackable_name = 'Headache' OR c.trackable_name = 'Headache')) 
    GROUP BY treatments ORDER BY treatmentCount DESC LIMIT 15`;
*/
   sql = `SELECT t.trackable_name as treatments, COUNT(t.trackable_name) as treatmentCount FROM Treatments t WHERE t.user_id IN(SELECT 
   DISTINCT s.user_id FROM Symptoms s JOIN Conditions c USING (user_id) WHERE 
   s.trackable_name = 'Headache' OR c.trackable_name = 'Headache') GROUP BY treatments ORDER BY treatmentCount DESC LIMIT 15`;
  } else{
    //rest of queries
    sql = `SELECT t.trackable_name as treatments, COUNT(t.trackable_name) as treatmentCount FROM 
    Treatments t WHERE t.user_id IN(SELECT s.user_id FROM Symptoms s WHERE 
    (s.trackable_name = '${symptom}')) GROUP BY treatments ORDER BY treatmentCount DESC LIMIT 15`;
  }

  console.log(sql);
  connection.query(sql, function(err, result) {
    if (err) {
      res.send(err);
      return;
    }
    else {
	res.render('display', {data:result});
    }
    console.log(result);
  });

  
});

app.get('/go_back', function(req, res) {
  res.render('symptom');
});

app.listen(80, function () {
    console.log('Node app is running on port 80');
});
