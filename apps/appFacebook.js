const facebook = require('../messengers/facebook');

const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.set('port', (process.env.PORT || 5555));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/facebook', facebook);

app.listen(app.get('port'), () => {
	console.log(`app listening on port ${app.get('port')}`);
});
