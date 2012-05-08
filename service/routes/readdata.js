app.get(urlprefix + '/service/readdata.json', function(req, res) {
    res.charset = 'UTF-8';
    res.contentType('application/json');
        
    var results = {
        success: true,
        data: {
            user: req.session.user
        }
    };
    res.send(JSON.stringify(results));
});