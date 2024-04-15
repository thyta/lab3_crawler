// index.js
const express = require('express');
const app = express();
const port = 1012;

const bodyParser = require('body-parser');
const path = require('path');

const tikiController = require('./controllers/tiki');

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', tikiController.renderForm);
app.post('/tiki', tikiController.submitForm);

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
