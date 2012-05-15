/**
 * 網路選課系統
 * Powerd by ExtJS + Node.js + MongoDB
 *
 * @author lyhcode@gmail.com
 */


// Module dependencies.

var express = require('express')
  , routes = require('./routes')
  , cache = require('connect-cache')
  , mongo = require('mongoskin')
  , db = mongo.db('guest:guest@staff.mongohq.com:10028/acad_taj?auto_reconnect=true&poolSize=2')
  , mongoStore = require('connect-mongodb')
  , cloudfoundry = require('cloudfoundry');

// Express web server

var app = module.exports = express.createServer(
  cache({rules: [
    {regex: /\/cached\/.*/, ttl: 60 * 1000}
  ]})
);

// URL prefix setup for additional path like iisnode

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
            cookie: { maxAge: 30 * 60 * 60 * 1000 },
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
    app.get('/login.:format?', routes.login);
    app.get('/portal.:format?', routes.portal);

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
