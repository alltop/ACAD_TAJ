/**
 * 課程取消加選處理（學生）
 */
app.post('/service/cancelcourse.json/:sid', function(req, res) {
    res.charset = 'UTF-8';
    res.contentType('application/json');
    
    var sid = req.params.sid;
    var courses = req.body['courses'].split(',');

    //console.log(req.params);
    var query = {
        sid: req.params.sid
    };

    console.log(sid + " 取消選課 " + courses);

    var selector = {
    };

    var options = {
        safe: true
    };

    db.collection('tSelectedSemCus').remove(selector, options, function() {
        var results = {
            success: true
        };
        res.send(JSON.stringify(results));
    });
});