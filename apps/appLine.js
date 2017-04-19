const line = require('../messengers/line');

const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.set('port', (process.env.PORT || 5555));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/line', line);

app.listen(app.get('port'), () => {
	console.log(`app listening on port ${app.get('port')}`);
});
