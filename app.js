
/**
* Module dependencies.
*/

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();

var timediff = function() {
    var begin = new Date();
    return function() {
        return (new Date().getTime()-begin.getTime());
    };
};

// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));

    //session support
    //app.use(express.cookieParser());
    //app.use(express.session({ secret: "keyboard cat", store: new MongoDBStore({url: 'localhost', maxAge: 300000}) }));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
    app.use(express.errorHandler()); 
});

// Routes
app.get('/', routes.index);
app.post('/service/login.json', routes.login);
app.get('/service/listall.json', routes.listall);

app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
