
/*
 * GET home page.
 */

var mongo = require('mongoskin')
  , db = mongo.db('guest:guest@staff.mongohq.com:10028/acad_taj');
  
exports.index = function(req, res){
	res.redirect('/login.html');
	//res.render('index', { title: 'redirect to portal' });
};

exports.login = function(req, res) {
    res.charset = 'UTF-8';
    res.contentType('application/json');
    
    var query = {
        studentno: req.body['studentno'],
        password: req.body['password']
    };
    
    db.collection('tStudent').find(query).toArray(function(err, rows){
        if (rows.length>0) {
            var results = {
                success: true,
                data: rows
            };
            res.send(JSON.stringify(results));
        }
        else {
            var results = {
                success: false,
                errors: {reason: '帳號密碼不正確'}
            };
            res.send(JSON.stringify(results));
        }
    });
};

exports.listall = function(req, res) {
    res.charset = 'UTF-8';
    res.contentType('application/json');
        
    db.collection('tSemesterCusWeb').find().toArray(function(err, rows){
        res.send(JSON.stringify(rows));
    });
};