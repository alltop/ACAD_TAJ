exports.index = function(req, res){
	res.redirect('/login');
};

exports.chrome = function(req, res){
	res.render('chrome.jade', { title: '安裝 Google Chrome Frame', bootstrap: '', siteurl: req.headers.host });
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
		res.render('portal.jade', { title: '大仁科技大學選課系統', bootstrap: 'portal.js' });
	}
	else {
		res.redirect('login');
	}
}

exports.select = function(req, res){
	res.redirect('/login?mode=select');
};

exports.realtime = function(req, res){
	res.redirect('/login?mode=realtime');
};

//課務組手動加選網站(無管控人數上限)
exports.admin = function(req, res){
	res.redirect('/login?mode=realtime&admin=admin');
};