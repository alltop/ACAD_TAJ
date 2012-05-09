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
        var course_arr = course.split(':');

        var where = {
            semcourseid: course_arr[0],
            studentid: user.studentid
        };

        //退選處理
        db.collection('tSelectedSemCus').remove(where, options, function(err, result) {

            var doc = {
                semcourseid: course_arr[0],
                courseid: course_arr[1],
                studentid: user.studentid,
                studentno: user.studentno,
                createdate: new Date().getTime(),
                adddel: '退選',
                checked: '通過',
                regtype: '1',
                failcause: '記錄訊息'
            };

            //加退選記錄
            db.collection('tSelectedAddDel').insert(doc, options, function() {});
        });
    });

    res.send(JSON.stringify({
        success: true
    }));
});