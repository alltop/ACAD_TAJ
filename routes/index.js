
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
                data: rows[0]
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

exports.readdata = function(req, res) {
    res.charset = 'UTF-8';
    res.contentType('application/json');
    
    //console.log(req.params);
    var query = {
        studentno: req.params.sid
    };
    
    db.collection('tStudent').find(query).toArray(function(err, rows){
        var results = {
            success: true,
            data: {
                user: rows[0]
            }
        };
        res.send(JSON.stringify(results));
    });
};

/**
 * 課程加選處理（學生）
 */
exports.selcourse = function(req, res) {
    res.charset = 'UTF-8';
    res.contentType('application/json');
    
    var sid = req.params.sid;
    var courses = req.body['courses'].split(',');

    //console.log(req.params);
    var query = {
        sid: req.params.sid
    };

    console.log(sid + " 選課 " + courses);

    var docs = new Array();

    courses.forEach(function(course) {
        docs.push({
            semcourseid: course,
            courseid: '',
            studentid: sid,
            studentno: sid,
            createdate: new Date(),
            regtype: '1'
        });
    });

    console.log(docs);

    var options = {
        upsert: true,
        multi: false,
        safe: true
    };

    db.collection('tSelectedSemCus').insert(docs, options, function() {
        var results = {
            success: true,
            data: {
                docs: docs
            }
        };

        res.send(JSON.stringify(results));
    });
};

exports.listall = function(req, res) {
    res.charset = 'UTF-8';
    res.contentType('application/json');
    
    var fields = {
        'semcourseid':1, 'courseid': 1, 'coursetype':1, 'coursetypename':1, 'semcoursename':1,
        'teachername':1, 'coursetime_view':1, 'roomname':1, 'maxcount':1,
        'selectedcount': 1
    };
    
    db.collection('tSemesterCusWeb').find({}, fields).toArray(function(err, rows){
        //res.send(JSON.stringify(rows));
        var arr = new Array();
        rows.forEach(function(item) {
            var arr2 = new Array();
            Object.keys(fields).forEach(function(key) {
                arr2.push(item[key]);
            });
            arr.push(arr2);
        });
        res.send(JSON.stringify(arr));
        res.end();
    });
};

/**
 * 回傳學生已選課程清單
 */
exports.listselected = function(req, res) {
    res.charset = 'UTF-8';
    res.contentType('application/json');
    db.collection('tSelectedSemCus').find().toArray(function(err, rows){
        var arr = new Array();
        rows.forEach(function(item) {
            arr.push(item.semcourseid);
        });
        res.send(JSON.stringify(arr));
        res.end();
    });
};