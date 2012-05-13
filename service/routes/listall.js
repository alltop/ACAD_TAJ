app.get(urlprefix + '/service/cached/listall.json', function(req, res) {
    res.charset = 'UTF-8';
    res.contentType('application/json');
    
    var fields = {
        'semcourseid':1, 'courseid': 1, 'coursetype':1, 'coursetypename':1,
        'semcoursename':1, 'teachername':1, 'coursetime': 1, 'coursetime_view':1,
        'roomname':1, 'maxcount':1, 'selectedcount': 1,
        'unitid': 1, 'collegeid': 1, 'studytype': 1, 'selectgpid': 1, 'englevel': 1
    };

    console.log('Query tSemesterCusWeb from MongoDB '+new Date());
    
    db.collection('tSemesterCusWeb').find({}, fields).toArray(function(err, rows){
        //res.send(JSON.stringify(rows));
        var arr = new Array();
        rows.forEach(function(item) {
            var arr2 = new Array();
            Object.keys(fields).forEach(function(key) {
                arr2.push(item[key]);
            });
            arr.push(arr2);
        });
        res.send(JSON.stringify(arr));
        res.end();
    });
});