// 重新導向至登入畫面
exports.index = function(req, res){
    res.redirect('/login');
};

// 瀏覽器升級畫面
exports.chrome = function(req, res){
    res.render('chrome.jade', { title: '安裝 Google Chrome Frame', bootstrap: '', siteurl: req.headers.host });
};

// 登入畫面
exports.login = function(req, res){
    // clear sessions and cookies
    req.session.destroy();
    res.clearCookie('JSESSIONID');
    res.clearCookie('jsessionid');

    res.render('login', { title: '登入選課系統', bootstrap: 'login.js' });
};

// 主畫面
exports.portal = function(req, res){
    if (req.session.user) {
        res.render('portal.jade', { title: '大仁科技大學選課系統', bootstrap: 'portal.js' });
    }
    else {
        res.redirect('login');
    }
};

// 切換為登記分發模式
exports.select = function(req, res){
    res.redirect('/login?mode=select');
};

// 切換為即選即上模式
exports.realtime = function(req, res){
    res.redirect('/login?mode=realtime');
};

//課務組手動加選網站(無管控人數上限)
exports.admin = function(req, res){
    res.redirect('/login?mode=realtime&admin=admin');
};

//登出
exports.logout = function(req, res){
    //清除 SESSION
    req.session.user = null;

    //重導至指定的 redirect
    var redirect_url = req.query.redirect;

    console.log(redirect_url);
    if (redirect_url) {
        res.redirect(redirect_url);
    }
    else {
        res.redirect('/login');
    }
};
