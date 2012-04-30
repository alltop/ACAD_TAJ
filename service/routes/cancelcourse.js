/**
 * 課程取消加選處理（學生）
 */
app.post('/service/cancelcourse.json/:sid', function(req, res) {
    
    
    var sid = req.params.sid;
    var courses = req.body['courses'].split(',');

    //console.log(req.params);
    var query = {
        sid: req.params.sid
    };

    console.log(sid + " 取消選課 " + courses);

    var options = {
        safe: true
    };

    courses.forEach(function(course) {
        var selector = {
            semcourseid: course,
            studentid: sid
        };
        db.collection('tSelectedSemCus').remove(selector, options, function(result) {
            console.log("remove "+result);
        });
    });

    res.charset = 'UTF-8';
    res.contentType('application/json');
    res.send(JSON.stringify({
        success: true
    }));
});