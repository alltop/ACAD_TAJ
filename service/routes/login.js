app.post('/service/login.json', function(req, res) {
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
});