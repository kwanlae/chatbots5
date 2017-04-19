require('../messengers/slack');
const kakao = require('../messengers/kakao');
const facebook = require('../messengers/facebook');
const line = require('../messengers/line');
const wechat = require('../messengers/wechat');

const bodyParser = require('body-parser');
const xmlparser = require('express-xml-bodyparser');
const express = require('express');
const app = express();

app.set('port', (process.env.PORT || 5555));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(xmlparser());

app.use('/kakao', kakao);
app.use('/facebook', facebook);
app.use('/line', line);
app.use('/wechat', wechat);

app.listen(app.get('port'), () => {
	console.log(`app listening on port ${app.get('port')}`);
});
