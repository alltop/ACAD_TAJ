/**
 * 回傳學生已選課程清單
 */
app.get(urlprefix + '/service/listselected.json/:sid', function(req, res) {
    res.charset = 'UTF-8';
    res.contentType('application/json');
    db.collection('tSelectedSemCus').find().toArray(function(err, rows){
        var arr = new Array();
        rows.forEach(function(item) {
            arr.push(item.semcourseid);
        });
        res.send(JSON.stringify(arr));
        res.end();
    });
});