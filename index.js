require('dotenv').config()

const express = require('express');
var request = require('request');

const cron = require('node-cron');

//database setup
const { MongoClient } = require("mongodb");
const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9m3po.mongodb.net/tempDB?retryWrites=true&w=majority`;
const client = new MongoClient(url);
const dbName = "tempDB"

//express setup
const app = express();
const port = 3000;

app.get("/", mainHandler);
app.get("/temp", tempHandler);

var absolutePathStatic = __dirname + "/static"; //define absolute path to the static folder
app.use("/static", express.static(absolutePathStatic)); //serves static files

var absolutePathIndex = __dirname + "/views/index.html"; //define absolute path to the index.html file
function mainHandler(req, res){
    res.sendFile(absolutePathIndex)
}

function tempHandler(req, res){ //gets the data from the esp32
    request("http://192.168.31.27/temp", function(err, body){
        res.json(body.body);
        console.log(JSON.stringify(body.body));
        //var timestamp = new Date().getTime();
        //saveData(body.body, timestamp);
    });
}

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
}); 

//saves the data and time to database
async function saveData(rawData, timestamp){
    try {
        await client.connect();
        //console.log("Connected to database!");
        const db = client.db(dbName);

        const col = db.collection("data")

        data = JSON.parse(rawData);

        //console.log(data.temperature);

        let temperatureDocument = {
            "temperature": data.temperature,
            "humidity": data.humidity,
            "time": timestamp
        }

        const p = await col.insertOne(temperatureDocument);
        //console.log(temperatureDocument);

    } catch (err) {
        console.log(err.stack);
    }

    finally {
        await client.close();
    }
}

//saves data on DB every 5 minutes
cron.schedule('*/12 * * * *', () => {
    console.log('Fecthing data from ESP32!');
    request("http://192.168.31.27/temp", function(err, body){
        var timestamp = new Date().getTime();
        console.log('Saving data!');
        saveData(body.body, timestamp);
        console.log(body.body);
    });
});