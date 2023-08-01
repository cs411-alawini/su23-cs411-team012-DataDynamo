
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
app.post('/deleting', function(req, res) {

  var symptom = req.body.symptomDeleteInput;
  var date = req.body.checkindateDeleteInput;
  var value = req.body.severityDeleteInput;

  var sql = `DELETE FROM CheckIns WHERE user_id = '${userid}' AND  checkin_date  = '${date}' AND symptom = '${symptom}' AND severity = '${value}'`;

  console.log(sql);
  connection.query(sql, function(err, result) {
    if(err) {
      res.send(err);
      return;
    }
     res.redirect('/symptom');
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
  var severity = req.body.severityInput;

  var symptom_two = req.body.symptomInputTwo; //should contain a string
  var severity_two = req.body.severityInputTwo;

  var symptom_three = req.body.symptomInputThree; //should contain a string
  var severity_three = req.body.severityInputThree;

  var symptom_four = req.body.symptomInputFour; //should contain a string
  var severity_four = req.body.severityInputFour;

  var symptom_five = req.body.symptomInputFive; //should contain a string
  var severity_five = req.body.severityInputFive;

  var sql = `CALL readSP(?,?,?,?,?,?,?,?,?,?,?,?)`;
  var insertSql = `INSERT INTO CheckIns(user_id, checkin_date, symptom, severity, feedback) VALUES ('${userid}', 'Check', 'Check', 3, 'NULL')`;
 
if (conditionCheck == 'on') {
 var finalsql = `SELECT TreatmentName as conditions, TreatmentCount as conditionCount FROM finaltable ORDER BY conditionCount DESC;`
}
else{
var finalsql = `SELECT TreatmentName as treatments, TreatmentCount as treatmentCount FROM finaltable ORDER BY TreatmentCount DESC;`
}

/*
  if (conditionCheck == 'on') {
    //adv query 2
    sql = `SELECT c.trackable_name as conditions,COUNT(c.trackable_name) as conditionCount FROM 
    Conditions c WHERE c.user_id IN(SELECT s.user_id FROM Symptoms s WHERE (s.trackable_name = 
    'fatigue' OR s.trackable_name = 'Nausea') AND s.trackable_value >= 3) GROUP BY conditions 
    ORDER BY conditionCount DESC LIMIT 15`;
  } else if (treatmentCheck == 'on') {
    //adv query 1
/*
  remember to comment this ->  sql = `SELECT t.trackable_name as treatments, COUNT(t.trackable_name) as treatmentCount FROM 
    Treatments t WHERE t.user_id IN(SELECT s.user_id FROM Symptoms s JOIN Conditions c ON 
    s.user_id = c.user_id WHERE (s.trackable_name = 'Headache' OR c.trackable_name = 'Headache')) 
    GROUP BY treatments ORDER BY treatmentCount DESC LIMIT 15`;

   sql = `SELECT t.trackable_name as treatments, COUNT(t.trackable_name) as treatmentCount FROM Treatments t WHERE t.user_id IN(SELECT 
   DISTINCT s.user_id FROM Symptoms s JOIN Conditions c USING (user_id) WHERE 
   s.trackable_name = 'Headache' OR c.trackable_name = 'Headache') GROUP BY treatments ORDER BY treatmentCount DESC LIMIT 15`;
  } else{
    //rest of queries
    sql = `SELECT t.trackable_name as treatments, COUNT(t.trackable_name) as treatmentCount FROM 
    Treatments t WHERE t.user_id IN (SELECT s.user_id FROM Symptoms s WHERE 
    (s.trackable_name = '${symptom}' AND s.trackable_value = ${severity}) OR (s.trackable_name = '${symptom_two}' AND s.trackable_value = ${severity_two}) OR (s.trackable_name = '${symptom_three}' AND s.trackable_value = ${severity_three}) OR
    (s.trackable_name = '${symptom_four}' AND s.trackable_value = ${severity_four}) OR (s.trackable_name = '${symptom_five}' AND s.trackable_value = ${severity_five})) GROUP BY treatments ORDER BY treatmentCount DESC LIMIT 15`;
  }
*/
  connection.query(insertSql, function(err, result) {
    if (err) {
      res.send(err);
      return;
    }
  });

  connection.query(sql,[conditionCheck, treatmentCheck, symptom, severity, symptom_two, severity_two, symptom_three, severity_three, symptom_four, severity_four, symptom_five, severity_five], function(err, result) {
    if (err) {
      res.send(err);
      return;
    }
    console.log(result);
  });

 connection.query(finalsql, function(err, result) {
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
