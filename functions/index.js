const functions = require("firebase-functions");
const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');

admin.initializeApp();

const database = admin.database().ref('/items');

exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello from a Severless Database!");
});

//https://blog.usejournal.com/build-a-serverless-full-stack-app-using-firebase-cloud-functions-81afe34a64fc
//CRUD HTTP ENDPOINTS

//addItem
exports.addItem = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        if (req.method !== 'POST') {
            return res.status(401).json({
                message: 'Not allowed'
            })
        }
        console.log(req.body)

        //must have all params
        const name = req.body.name;
        const category = req.body.category;
        const text = req.body.text;
        const imgurl = req.body.imgurl;
        const audiourl = req.body.audiourl;

        const obj = {
            'name': name,
            'category': category,
            'text': text,
            'imgurl': imgurl,
            'audiourl': audiourl
        };

        database.push(obj);

        let items = [];

        return database.on('value', (snapshot) => {
            snapshot.forEach((item) => {
                items.push({
                    id: item.key,
                    name: item.val().name
                });
            });

            res.status(200).json(items)
        }, (error) => {
            res.status(error.code).json({
                message: `Something went wrong. ${error.message}`
            });
        });
    });
});

//get all items
exports.getAllItems = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        if (req.method !== 'GET') {
            return res.status(404).json({
                message: 'Not allowed'
            });
        }

        let items = [];

        return database.on('value', (snapshot) => {
            snapshot.forEach((item) => {
                items.push({
                    id: item.key,
                    name: item.val().name,
                    category: item.val().category,
                    text: item.val().text,
                    imgurl: item.val().imgurl,
                    audiourl: item.val().audiourl
                });
            });

            res.status(200).json(items)
        }, (error) => {
            res.status(error.code).json({
                message: `Something went wrong. ${error.message}`
            });
        });
    });
});

