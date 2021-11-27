const express = require('express');
var request = require('request');

const app = express();
const port = 5000;

app.get("/temp", tempHandler);

function tempHandler(req, res){
    request("http://192.168.31.27/temp", function(err, body){
        res.json(body.body);
        console.log(JSON.stringify(body.body));
    });
}

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
}); 