app.get(urlprefix + '/service/blocklist/:studentno.json', function(req, res) {
    res.charset = 'UTF-8';
    res.contentType('application/json');

    var studentno = req.params['studentno'];

    console.log(studentno);
    
    db.collection('blocklist').find({studentno: studentno}, {'_id': 0}).toArray(function(err, rows){
        res.send(JSON.stringify(rows));
        res.end();
    });
});