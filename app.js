/**
 * 網路選課系統
 * Powerd by ExtJS, Node.js, MongoDB
 *
 * @copyright ALLTOP Computer CO., Ltd. http://www.alltop.com.tw/
 * @author http://about.me/lyhcode
 */

// Module dependencies.

var express = require('express')
  , routes = require('./routes')
  , cache = require('connect-cache')
  , mongo = require('mongoskin')
  , mongoStore = require('connect-mongodb')
  , cloudfoundry = require('cloudfoundry')
  , config = require('./config.json');

// Test Config
//console.log('Config Data: ', config);
console.log("檢查 config.json 設定");
if (!config.mongo || !config.mongo.url) {
    console.log("缺少 MongoDB 設定");
    process.exit(1);
}
console.log("全部檢查通過");

// Setup MongoDB
var db = mongo.db(config.mongo.url);

// Express web server
var app = module.exports = express.createServer(
  cache({rules: [
    {regex: /\/cached\/.*/, ttl: 60 * 1000}
  ]})
);

// Use Socket.IO
var io = require('socket.io').listen(app);

// URL Prefix 設置（搭配 iisnode/nginx 使用）
var urlprefix = ''

db.open(function(err, nativedb) {

    // Configuration
    app.configure(function() {
        app.set('views', __dirname + '/views');
        app.set('view engine', 'jade');
        app.use(express.methodOverride());
        app.use(express.bodyParser());
        app.use(express.cookieParser());
        app.use(express.session({
            cookie: { maxAge: 3 * 60 * 60 * 1000 },
            secret: '50709ff051bfabda20ac5284fc01a1e5',
            key: 'jsessionid',
            store: new mongoStore({db: nativedb})
        }));
        app.use(express.static(__dirname + '/public'));
        app.use(app.router);
    });

    app.configure('development', function(){
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
    });

    app.configure('production', function(){
        app.use(express.errorHandler()); 
    });

    // Routes
    app.get('/', routes.index);
    app.get('/chrome.:format?', routes.chrome); //google chrome frame
    app.get('/login.:format?', routes.login);
    app.get('/logout.:format?', routes.logout);
    app.get('/portal.:format?', routes.portal);
    app.get('/select.:format?', routes.select);
    app.get('/realtime.:format?', routes.realtime);
    app.get('/admin.:format?', routes.admin); //課務組手動加選網站(無管控人數上限)

    // Load Services
    require('./service')(app, db, urlprefix);

    /*
     * process.env.PORT: Windows Azure, Cloud9, Heroku
     * process.env.VCAP_APP_PORT: Cloud Foundry
     * process.env.npm_package_config_port: package.json
     */
    app.listen(process.env.PORT || process.env.VCAP_APP_PORT || process.env.npm_package_config_port || 3000);
    console.log("伺服器已經啟動，連接埠： %d ，模式： %s", app.address().port, app.settings.env);
});
