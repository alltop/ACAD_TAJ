exports.index = function(req, res){
	res.redirect('/login');
	//res.render('index.jade', { title: 'redirect to portal' });
};

exports.login = function(req, res){
	res.render('login.jade', { title: '登入選課系統', bootstrap: 'login.js' });
}

exports.portal = function(req, res){
	res.render('portal.jade', { title: '先傑大學選課系統', bootstrap: 'portal.js' });
}