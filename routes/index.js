exports.index = function(req, res){
	res.redirect('/login');
	//res.render('index.jade', { title: 'redirect to portal' });
};

exports.login = function(req, res){
	// clear sessions and cookies
	req.session.destroy();
	res.clearCookie('JSESSIONID');
	res.clearCookie('jsessionid');

	res.render('login.jade', { title: '登入選課系統', bootstrap: 'login.js' });
}

exports.portal = function(req, res){
	if (req.session.user) {
		res.render('portal.jade', { title: '先傑大學選課系統', bootstrap: 'portal.js' });
	}
	else {
		res.redirect('login');
	}
}