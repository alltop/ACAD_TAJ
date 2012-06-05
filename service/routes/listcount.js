/**
 * 回傳已選課程人數統計
 */
app.get(urlprefix + '/service/listcount.json', function(req, res) {
    res.charset = 'UTF-8';
    res.contentType('application/json');

    db.collection('tSelectedCount').find({}, {_id: 0}).toArray(function(err, rows){
        var result = {};
        rows.forEach(function(item) {
            result[item.semcourseid] = item.count;

        });
        res.send(JSON.stringify(result));
        res.end();
    });
});