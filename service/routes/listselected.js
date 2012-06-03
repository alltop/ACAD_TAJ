/**
 * 回傳學生已選課程清單
 */
app.get(urlprefix + '/service/listselected.json', function(req, res) {
    
    res.charset = 'UTF-8';
    res.contentType('application/json');

    //學生資料（SESSION）
    var user = req.session.user;

    if (user) {
        //查詢條件
        var where = {
            studentid: user.studentid,
            regtype: '1' //登記分發
        };

        //SELECT * FROM tSelectedSemCus WHERE studentid=?
        //SORT BY serialseq ASC, serialno ASC
        db.collection('tSelectedSemCus').find(where).sort({serialseq: 1, serialno: 1}).toArray(function(err, rows){
            var arr = new Array();
            rows.forEach(function(item) {
                arr.push(item.semcourseid);
                //arr.push(item.semcourseid + ':' + item.serialseq + ':' + item.serialno);
                // + ':' + item.serialseq + ':' + item.serialno
            });
            res.send(JSON.stringify(arr));
            res.end();
        });
    }
});