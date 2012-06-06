/**
 * 課程取消加選處理（學生）
 */
app.post(urlprefix + '/service/cancelcourse.json', function(req, res) {

    res.charset = 'UTF-8';
    res.contentType('application/json');

    //學生資料（SESSION）
	var user = req.session.user?req.session.user:{};

	if(user.studentid != null) {
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
				
				//tSemesterCusWeb 課程資料表
				//已選人數變更
				db.collection('tSemesterCusWeb').update( { semcourseid: course_arr[0] }, { $inc:{ selectedcount : -1 } } );

				//已選人數表更新
				db.collection('tSelectedCount').update(
					{ semcourseid: course_arr[0] },
					{ $inc: {count: -1} },
					{ upsert: false, multi: false, safe: true},
					function(err) {
						// if (err) { ... }
					}
				);
			});
		});

		res.send(JSON.stringify({
			success: true
		}));
	} else {		
		res.send(JSON.stringify({
			success: false
		}));
        res.end();
	}
});