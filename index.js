const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const { ObjectID, ObjectId } = require('bson');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();



const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 5000

app.get('/', (req, res) => {
    res.send('Welcome to Quick Fix server')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rxelq.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const serviceCollection = client.db(`${process.env.DB_NAME}`).collection("services");
    const reviewCollection = client.db(`${process.env.DB_NAME}`).collection("review");
    const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admin");
    const orderCollection = client.db(`${process.env.DB_NAME}`).collection("order");


    app.post('/addService', (req, res) => {
        const newService = req.body;
        serviceCollection.insertOne(newService)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.get('/services', (req, res) => {
        serviceCollection.find()
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/services/:id', (req, res) => {
        serviceCollection.find({ _id: ObjectID(req.params.id) })
            .toArray((err, service) => {
                res.send(service[0]);
            })
    })

    app.delete('/serviceDelete/:id', (req, res) => {
        serviceCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                res.send(result.deletedCount > 0)
            })
    })

    app.post('/addReview', (req, res) => {
        const newReview = req.body;
        reviewCollection.insertOne(newReview)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.get('/review', (req, res) => {
        reviewCollection.find()
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/addOrder', (req, res) => {
        orderCollection.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
            .catch(error => console.log(error))
    })

    app.get('/order', (req, res) => {
        orderCollection.find({ email: req.query.email })
            .toArray((err, totalOrder) => {
                res.send(totalOrder)
            })
    })

    app.get('/allOrders', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });


    app.patch('/updateStatus', (req, res) => {
        orderCollection.updateOne(
            { _id: ObjectID(req.body.id) },
            {
                $set: { 'status': req.body.status }
            }
        )
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
            .catch(err => console.log(err))
    })

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email
        adminCollection.find({ email: email })
            .toArray((err, admins) => {
                res.send(admins.length > 0)
            })
    })

    app.post('/addAdmin', (req, res) => {
        const newAdmin = req.body.email;
        adminCollection.insertOne({ email: newAdmin })
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

});


app.listen(port);