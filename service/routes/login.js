app.post(urlprefix + '/service/login.json', function(req, res) {
    res.charset = 'UTF-8';
    res.contentType('application/json');
    
    var query = {
        studentno: req.body['studentno'],
        password: req.body['password']
    };
    
    // SELECT * FROM tStudent WHERE [query]
    db.collection('tStudent').findOne(query, function(err, row){
        //console.log(row);
        var results = {};
        
        if (row) {
            results = {
                success: true,
                data: row
            };
            req.session.user = row;
        }
        else {
            results = {
                success: false,
                errors: {reason: '帳號密碼不正確'}
            };
        }
        res.send(JSON.stringify(results));
        res.end();
    });
});