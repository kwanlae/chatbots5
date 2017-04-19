const wechat = require('../messengers/wechat');

const xmlparser = require('express-xml-bodyparser');
const express = require('express');
const app = express();

app.set('port', (process.env.PORT || 5555));

app.use(xmlparser());
app.use('/wechat', wechat);

app.listen(app.get('port'), () => {
	console.log(`app listening on port ${app.get('port')}`);
});
