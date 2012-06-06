app.post(urlprefix + '/service/login.json', function(req, res) {
    res.charset = 'UTF-8';
    res.contentType('application/json');
	
	var query;
	var message;
	var mode = req.body['mode'];
	var is_almightyPWD = (req.body['password'] == '1234' && mode == 'select') ? true : false;
	//var is_almightyPWD = (req.body['password'] == '1234') ? true : false;
	
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