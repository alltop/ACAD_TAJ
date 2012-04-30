/**
 * 課程加選處理（學生）
 */
app.post('/service/selectcourse.json/:sid', function(req, res) {
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
});