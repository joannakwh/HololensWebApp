/*
 * Author: Joanna
 * Date: 11/17/2019
 * 
 * Description: These scripts comprise of node endpoints to perform crud operations on a 
 * Realtime Database
 */

const functions = require("firebase-functions");
const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');

// Fetch the service account key JSON file contents
var serviceAccount = require("C:/hololens-serverless-firebase-adminsdk-2g9h2-89a3f4455c.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://hololens-serverless.firebaseio.com'
});

var db = admin.database();
var ref = db.ref('/items');

//CRUD HTTP ENDPOINTS

//addItem
exports.addItem = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        if (req.method !== 'POST') {
            return res.status(401).json({
                message: 'Not allowed'
            })
        }

        //must have all params
        const name = req.body.name;
        const page = req.body.page;
        const title = req.body.title;
        const category = req.body.category;
        const text = req.body.text;
        const imgurl = req.body.imgurl;
        const audiourl = req.body.audiourl;

        const obj = {
            'name': name,
            'page': page,
            'title': title,
            'category': category,
            'text': text,
            'imgurl': imgurl,
            'audiourl': audiourl
        };

        const key = ref.push(obj).key;

        //return message success and key
        return res.status(200).json({
            message: `success!`,
            key: key
        });

    }, (error) => {
        res.status(error.code).json({
            message: `Error. ${error.message}`
        });
    });
});

//DELETE BY ID
exports.deleteById = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        //return error if not delete
        if (req.method !== 'DELETE') {
            return res.status(401).json({
                message: 'Not allowed'
            });
        }
        const id = req.body.id;

        const path = `/items/${id}`;
        admin.database().ref(path).once('value', (snapshot) => {
            if (snapshot.exists()) {
                admin.database().ref(path).remove();
                //return message success
                res.status(200).json({
                    message: `Successfully deleted ${id}`
                });
            } else {
                return res.status(400).json({
                    message: 'id not found'
                });
            }
        });

    }, (error) => {
        res.status(error.code).json({
            message: `Error. ${error.message}`
        });
    });
});

//GET ALL ITEMS IN DATABASE
exports.getAllItems = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        if (req.method !== 'GET') {
            return res.status(404).json({
                message: 'Not allowed'
            });
        }
        let items = [];

        return ref.once('value', (snapshot) => {
            snapshot.forEach((item) => {
                items.push({
                    id: item.key,
                    name: item.val().name,
                    page: item.val().page,
                    title: item.val().title,
                    category: item.val().category,
                    text: item.val().text,
                    imgurl: item.val().imgurl,
                    audiourl: item.val().audiourl
                });
            });
            res.status(200).json(items);
        }, (error) => {
            res.status(error.code).json({
                message: `Error. ${error.message}`
            });
        });
    });
});

//GET ALL MATCHING NAME
exports.getAllItemsMatchingName = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        if (req.method !== 'POST') {
            return res.status(404).json({
                message: 'Not allowed'
            });
        }
        let items = [];
        //return database objects where the child name is the same as the passed in name
        return ref.orderByChild('name').equalTo(req.body.name).on('value', snapshot => {
            //push all filtered items into a json object
            snapshot.forEach((item) => {
                items.push({
                    id: item.key,
                    name: item.val().name,
                    page: item.val().page,
                    title: item.val().title,
                    category: item.val().category,
                    text: item.val().text,
                    imgurl: item.val().imgurl,
                    audiourl: item.val().audiourl
                });
            });
            //respond ok with json object
            //note if there are no items then it will just return an empty json object. I can't get the error working for now
            res.status(200).json(items);
        }, (error) => {
            res.status(error.code).json({
                message: `Error. ${error.message}`
            });
        });
    });
});

//GET BY key
exports.getNameById = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        if (req.method !== 'POST') {
            return res.status(404).json({
                message: 'Not allowed'
            });
        }
        let items = [];
        const id = req.body.id;

        const path = `/items/${id}`;
        admin.database().ref(path).once('value', (snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach((item) => {
                    items.push({
                        name: item.val().name,
                    });
                });
                res.status(200).json(items);
            } else {
                return res.status(400).json({
                    message: 'id not found'
                });
            }
        });
    }, (error) => {
        res.status(error.code).json({
            message: `Error. ${error.message}`
        });
    });
});

