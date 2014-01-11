var config = require('./config');

var express = require('express');
var MongoStore = require('connect-mongo')(express);
var app = express();

var http = require('http');
var path = require('path');

var baucis = require('baucis');

var mongoose = require('mongoose');
var healthily = mongoose.connect('mongodb://localhost:27017/healthily');

app.set('port', process.env.PORT || 3000);

app.use(express.logger('dev'));
app.use(express.compress());
app.use(express.bodyParser());
app.use(express.cookieParser(config.cookies.secret));

app.use(express.session({
    secret: config.sessions.secret,
    store: new MongoStore({
      db: healthily.connection.db
    })
}));

app.use(express.methodOverride());

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  mongoose.set('debug', true);
}

app.get('/', function(req, res){
    res.sendfile('./build/index.html');
});



// var ndb = mongoose.connect('mongodb://localhost:27017/nutridb');

// app.use('/users', require('./routes/users')(app, connection).middleware);

// var nutridb = require('./controllers/nutridb')(ndb);
// app.use('/nutridb', nutridb());

var usersController = require('./controllers/users')(healthily);
app.use('/', usersController());

app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res){
    res.send(404);
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});