
/**
* Module dependencies.
*/

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();

/**
* MongoDB Native Driver
*/
var mongodb = require('mongodb');
var dbserver = function() {
    return new mongodb.Server('staff.mongohq.com', 10028, {});
};
var dbclient = function() {
    return new mongodb.Db('acad_taj', dbserver(), {});
};
var dbquery = function(collection, callback) {
    dbclient().open(function (error, client) {
        if (error) throw error;
        //console.log(callback);
        callback(new mongodb.Collection(client, collection));
    });
};
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

//

var renderAsJSON = function (res, obj) {
    res.charset = 'UTF-8';
    res.contentType('application/json'); 
    res.send(JSON.stringify(obj));
};

// Routes

app.get('/', routes.index);

app.get('/service/login.json', routes.login);

app.get('/readData.json', function(req, res) {
    var t = timediff();
    //req.params.table
    dbquery('foo', function(collection) {
        collection.find({}, {limit: 65535}).toArray(function(err, docs) {
            renderAsJSON(res, {'results': docs});
            console.log(t());
        });
    });
});

app.get('/service/listall.json', function(req, res) {
    renderAsJSON(res, {'result': [
        {a: 1, b: 2, c: 3},
        {a: 1, b: 2, c: 3},
        {a: 1, b: 2, c: 3},
        {a: 1, b: 2, c: 3}
    ]});
});

app.get('/service/listdept.json', function(req, res) {
    renderAsJSON(res, {'result': '9991234 login ok'});
});


app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
