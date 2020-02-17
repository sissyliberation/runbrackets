const express = require('express');
const path = require('path');
const chalk = require('chalk');

const port = process.env.PORT || 8080;

const app = express();

app.use(express.static(__dirname));

const prodPath = '/public/';

app.use(express.static(path.join(__dirname, prodPath)));
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, `${prodPath}index.html`));
});

app.listen(port, () => console.log(chalk(`listening on port ${port}`)));
