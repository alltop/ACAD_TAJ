
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
    var studentid = req.params.studentid;
    
    res.charset = 'UTF-8';
    res.contentType('application/json');
    
    res.send(req.params.studentid);
    console.log('test');
    console.log(req.param.studentid);

/*    db.collection('tStudent').find({}).toArray(function(err, posts){
        res.send("test"+JSON.stringify(posts));
    });*/
};
