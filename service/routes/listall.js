app.get(urlprefix + '/service/listall.json', function(req, res) {
    res.charset = 'UTF-8';
    res.contentType('application/json');
    
    var fields = {
        'semcourseid':1, 'courseid': 1, 'coursetype':1, 'coursetypename':1,
        'semcoursename':1, 'teachername':1, 'coursetime': 1, 'coursetime_view':1,
        'roomname':1, 'maxcount':1, 'selectedcount': 1, 'choose': 1, 'grade': 1,
        'credit': 1, 'semilarhr': 1, 'classname': 1, 'unitname': 1,
        'unitid': 1, 'collegeid': 1, 'studytype': 1, 'selectgpid': 1, 'englevel': 1, 'physicalgroup': 1
    };

    //使用快取機制
    var cached = cache.get('listall-output');
    if (cached != null) {
        console.log('[listall] 輸出資料快取');
        res.send(cached);
        res.end();
    }
    else {
        //計算查詢花費時間
        var begin = new Date();
        console.log('[listall] 查詢課程資料來源 tSemesterCusWeb ', begin);
        
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

            var output = JSON.stringify(arr);
            cache.put('listall-output', output, 60000);

            res.send(output);
            res.end();

            console.log('時間花費：', new Date()-begin, 'ms');
        });
    }
});