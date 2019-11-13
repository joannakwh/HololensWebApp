const functions = require("firebase-functions");
const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');

admin.initializeApp();

const database = admin.database().ref('/items');

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

        //return message success
        return res.status(200).json({
            message: 'success!'
        });

    }, (error) => {
        res.status(error.code).json({
            message: `Error. ${error.message}`
        });
    });
});

//GET ALL ITEMS
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
                message: `Error. ${error.message}`
            });
        });
    });
});

//DELETE BY ID
exports.delete = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        //return error if not delete
        if (req.method !== 'DELETE') {
            return res.status(401).json({
                message: 'Not allowed'
            });
        }
        const id = req.query.id;
        const path = `/items/${id}`;
        admin.database().child(path).once('value', (snap) => {
            if (snap.val() == null) {
                return res.status(204).json({
                    message: 'id not found'
                });
            } else {
                admin.database().ref(path).remove();
                //return message success
                return res.status(200).json({
                    message: 'success!'
                });
            }
        });

    }, (error) => {
        res.status(error.code).json({
            message: `Error. ${error.message}`
        });
    });
});