app.get('/service/readdata.json/:sid', function(req, res) {
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
});