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

        //must have all params
        const name = req.body.name;
        const page = req.body.page;
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

//DELETE BY NAME
// exports.deleteAllByName = functions.https.onRequest((req, res) => {
//     return cors(req, res, () => {
//         if (req.method !== 'POST') {
//             return res.status(404).json({
//                 message: 'Not allowed'
//             });
//         }
//         let items = [];
//         //return database objects where the child name is the same as the passed in name
//         return database.orderByChild('name').equalTo(req.body.name).on('value', snapshot => {
//             if (snapshot.exists()) {
//                 snapshot.forEach((item) => {
//                     items.push(item.id); 
//                 }).then(()=> {
//                     items.forEach((i) => {
//                         admin.database.ref(`/items/{i}`).remove();
//                     })
//                 });
                
//                 res.status(200).json({
//                     message: `Successfully deleted all items with name: ${req.body.name}`
//                 });
//             } else {
//                 return res.status(400).json({
//                     message: 'name not found'
//                 });
//             }
//         });
//     }, (error) => {
//         res.status(error.code).json({
//             message: `Error. ${error.message}`
//         });
//     });
// });

//GET ALL ITEMS IN DATABASE
exports.getAllItems = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        if (req.method !== 'GET') {
            return res.status(404).json({
                message: 'Not allowed'
            });
        }
        let items = [];

        return database.once('value', (snapshot) => {
            snapshot.forEach((item) => {
                items.push({
                    id: item.key,
                    name: item.val().name,
                    page: item.val().page,
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

//GET ALL MATCHING ID
exports.getAllItemsMatchingName = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        if (req.method !== 'POST') {
            return res.status(404).json({
                message: 'Not allowed'
            });
        }
        let items = [];
        //return database objects where the child name is the same as the passed in name
        return database.orderByChild('name').equalTo(req.body.name).on('value', snapshot => {
            //push all filtered items into a json object
            snapshot.forEach((item) => {
                items.push({
                    id: item.key,
                    name: item.val().name,
                    page: item.val().page,
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
