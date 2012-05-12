app.get(urlprefix + '/service/logout.json', function(req, res) {
    res.charset = 'UTF-8';
    res.contentType('application/json');

    req.session.user = null;

    res.send(JSON.stringify({
        success: true
    }));
});