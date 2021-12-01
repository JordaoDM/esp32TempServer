const express = require('express');
var request = require('request');

const app = express();
const port = 5000;

app.get("/", mainHandler);
app.get("/temp", tempHandler);

var absolutePathStatic = __dirname + "/static"; //define absolute path to the static folder
app.use("/static", express.static(absolutePathStatic)); //serves static files

var absolutePathIndex = __dirname + "/views/index.html"; //define absolute path to the index.html file
function mainHandler(req, res){
    res.sendFile(absolutePathIndex)
}

function tempHandler(req, res){
    request("http://192.168.31.27/temp", function(err, body){
        res.json(body.body);
        console.log(JSON.stringify(body.body));
    });
}

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
}); 