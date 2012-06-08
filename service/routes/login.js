app.post(urlprefix + '/service/login.json', function(req, res) {
    res.charset = 'UTF-8';
    res.contentType('application/json');
	
	var query;
	var message;
	var mode = req.body['mode'];
	var is_almightyPWD = false;
	//var is_almightyPWD = (req.body['password'] == '1234' && mode == 'select') ? true : false; //即選即上時，登記可用
	//var is_almightyPWD = (req.body['password'] == '1234') ? true : false; //開發用
	is_almightyPWD = (mode == 'realtime' && req.body['admin'] == 'admin') ? true : false; //正常用(課務組可幫學生加選)
	
	if (is_almightyPWD)
	{
		query = {
			studentno: req.body['studentno']
		};
		message ='';
    }
	else{
		query = {
			studentno: req.body['studentno'],
			password: req.body['password']
		};
		message = '';
	}
	
    // SELECT * FROM tStudent WHERE [query]
    db.collection('tStudent').findOne(query, function(err, row){
        //console.log(row);
        var results = {};
        
        if (row) {
            results = {
                success: true,
                data: row
            };
            req.session.user = row;
            req.session.mode = req.body['mode'];
			req.session.admin = req.body['admin'];
        }
        else {
            results = {
                success: false,
                errors: {reason: '帳號密碼不正確'},
				message: req.body['password'] + message
            };
        }
        res.send(JSON.stringify(results));
        res.end();
    });
});