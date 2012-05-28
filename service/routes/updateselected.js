/**
 * 志願排序儲存
 */
app.post(urlprefix + '/service/updateselected.json', function(req, res) {
    res.charset = 'UTF-8';
    res.contentType('application/json');

    //學生資料（SESSION）
    var user = req.session.user?req.session.user:{};

    //課程清單（網頁表單）    
    var courses = req.body['courses'].split(',');

    //預備批次寫入資料庫的資料陣列
    var docs = new Array();

    var options = {
        upsert: true,
        multi: false,
        safe: true
    };

    courses.forEach(function(course) {
        //用冒號分隔 semcourseid 及 courseid
        var course_arr = course.split(':');

        //tSelectedSemCus 加選資料表
        //志願排序更新
        db.collection('tSelectedSemCus').update({
            semcourseid: course_arr[0],
            studentid: user.studentid
        }, {
            $set: {serialno: course_arr[2]?course_arr[2]:'0'}
        }, function(err, result) {

        });
    });

    var results = {
        success: true,
        data: {
            docs: []
        }
    };

    res.send(JSON.stringify(results));
    res.end();
});