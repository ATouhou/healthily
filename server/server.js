var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var app = express();

app.set('port', process.env.PORT || 3000);

app.use(express.logger('dev'));
app.use(express.compress());
app.use(express.bodyParser());
app.use(express.cookieParser('whatevfwer'));
app.use(express.session());
app.use(express.methodOverride());

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  mongoose.set('debug', true);
}

app.get('/', function(req, res){
    res.sendfile('./build/index.html');
});


var connection = mongoose.createConnection('mongodb://localhost:27017/healthily');

app.use('/users', require('./routes/users')(app, connection).middleware);

app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res){
    res.send(404);
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});