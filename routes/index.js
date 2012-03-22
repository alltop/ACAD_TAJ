
/*
 * GET home page.
 */

var mongo = require('mongoskin')
  , db = mongo.db('guest:guest@staff.mongohq.com:10028/acad_taj');
  
exports.index = function(req, res){
	res.redirect('/portal.html');
	//res.render('index', { title: 'redirect to portal' });
};

exports.login = function(req, res) {
    var studentid = req.query['studentid']
      , password =  req.query['password'];
    
    res.charset = 'UTF-8';
    res.contentType('application/json');
    
    console.log(studentid);
    
    db.collection('tStudent').find({studentid: parseInt(studentid), password: parseInt(password)}).toArray(function(err, rows){
        console.log(results);
        var results = {
            result: true,
            data: rows
        };
        res.send(JSON.stringify(results));
    });
};
