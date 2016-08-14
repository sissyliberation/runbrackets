var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 8080;
const root_public = __dirname + '/public';
CHALLONGE_API_KEY = process.env.CHALLONGE_API_KEY;

app
	.set('view engine', 'ejs')
	.use(bodyParser.json())
	.use(bodyParser.urlencoded({extended: true}))
	.use(express.static(__dirname))
	.use(express.static(root_public))

	.use('/query', require('./routes/queries'))

	.get('*', function (req, res) {
		res.sendFile('./index.html', {root: root_public});
	})

	.listen(port);

console.log('Server started on port: ' + port);