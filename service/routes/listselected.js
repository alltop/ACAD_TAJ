/**
 * 回傳學生已選課程清單
 */
app.get(urlprefix + '/service/listselected.json', function(req, res) {
    
    res.charset = 'UTF-8';
    res.contentType('application/json');

    //學生資料（SESSION）
    var user = req.session.user;

    //查詢條件
    var where = {
        studentid: user.studentid
    };

    //SELECT * FROM tSelectedSemCus WHERE studentid=?
    db.collection('tSelectedSemCus').find(where).toArray(function(err, rows){
        var arr = new Array();
        rows.forEach(function(item) {
            arr.push(item.semcourseid);
        });
        res.send(JSON.stringify(arr));
        res.end();
    });
});