app.get(urlprefix + '/service/readdata.json', function(req, res) {
    res.charset = 'UTF-8';
    res.contentType('application/json');
    
    var results = {
        success: req.session.user?true:false,
        data: {
            user: req.session.user
        }
    };
    res.send(JSON.stringify(results));
});