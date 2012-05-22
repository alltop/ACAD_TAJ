app.get(urlprefix + '/service/readdata.json', function(req, res) {
    res.charset = 'UTF-8';
    res.contentType('application/json');
    
    db.collection('tUnit').find({}, {_id: 0}).toArray(function(err, units) {
	    var results = {
	        success: req.session.user?true:false,
	        data: {
	            user: req.session.user,
	            units: units
	        }
	    };
	    res.send(JSON.stringify(results));
    });
});