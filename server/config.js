exports.db = {
	name: 'healthily',
	port: '27017'
};

exports.sessions = {
	secret: 'here goes my top secret secret',
	maxAge: new Date(Date.now() + 3600000),
};

exports.cookies = {
	secret: 'here goes my 2nd top secret secret'
};
