/**
 * 課程取消加選處理（學生）
 */
app.post(urlprefix + '/service/cancelcourse.json', function(req, res) {

    res.charset = 'UTF-8';
    res.contentType('application/json');

    //學生資料（SESSION）
    var user = req.session.user;

    //課程清單（網頁表單）    
    var courses = req.body['courses'].split(',');

    var options = {
        safe: true
    };

    courses.forEach(function(course) {
        var selector = {
            semcourseid: course,
            studentid: user.studentid
        };
        db.collection('tSelectedSemCus').remove(selector, options, function(result) {
            //...
        });
    });

    res.send(JSON.stringify({
        success: true
    }));
});