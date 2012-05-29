app.get(urlprefix + '/service/readdata.json', function(req, res) {
    res.charset = 'UTF-8';
    res.contentType('application/json');

    var user = req.session.user?req.session.user:{};
    
    db.collection('tUnit').find({}, {_id: 0}).toArray(function(err, units) {

	    db.collection('blocklist').find({studentno: user.studentno}, {'_id': 0}).toArray(function(err, blocklist){
			var results = {
		        success: req.session.user?true:false,
		        data: {
		            user: user,
		            units: units,
		            blocklist: blocklist
		        }
		    };
		    res.send(JSON.stringify(results));
		    res.end();
	    });
    });
});