const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const admin = require('firebase-admin');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//firebase admin initialization
var serviceAccount = require('./ema-john-simple-a9151-firebase-adminsdk-l1zhr-8ce606808b.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


// midware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.far0qag.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('Travelworld');
        const servicesCollection = database.collection('services');
        const blogsCollection = database.collection('blogs');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');

        app.get('/', (req, res) => {
            res.send('Running Travel Wala server');
        })

        // Get Services
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });

        // Get single blog
        app.get('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const cursor = blogsCollection.find({ _id: ObjectId(id) });
            const result = await cursor.toArray();
            res.send(result);
        });

        // Get order
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const order = await cursor.toArray();
            res.send(order);
        });

        // get users
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        })

        // Delete order
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const finalRes = await ordersCollection.deleteOne(query);
            // console.log('delete successfull', finalRes);
            res.json(finalRes);
        })

        // Delete Service
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const finalRes = await servicesCollection.deleteOne(query);
            // console.log('delete successfull', finalRes);
            res.json(finalRes);
        })

        // Delete blog
        app.delete('/blogs/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const finalRes = await blogsCollection.deleteOne(query);
            // console.log('delete successfull', finalRes);
            res.json(finalRes);
        })

        // Update service
        app.put('/services/updateservice/:id', async (req, res) => {
            const id = req.params.id;
            const updateRes = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const finalUpdate = {
                $set: {
                    name: updateRes.name,
                    email: updateRes.email,
                    title: updateRes.title,
                    price: updateRes.price,
                    rate: updateRes.rate,
                    description: updateRes.description,
                    img: updateRes.img
                }
            };
            const result = await servicesCollection.updateOne(filter, finalUpdate, options);
            // console.log('updating', id);
            res.json(result);
        })

        // allow blog
        app.put('/blogs/allow/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const finalUpdate = {
                $set: {
                    status: status.status
                }
            };
            const result = await blogsCollection.updateOne(filter, finalUpdate, options);
            // console.log(result);
            res.json(result);
        })

        // make admin
        app.put('/users/makeadmin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const finalUpdate = {
                $set: { role: 'admin' }
            };
            const result = await usersCollection.updateOne(filter, finalUpdate, options);
            // console.log(result);
            res.json(result);
        })

        // Get Blogs
        app.get('/blogs', async (req, res) => {
            const cursor = blogsCollection.find({});
            const blog = await cursor.toArray();
            res.send(blog);
        })

        // POST services
        app.post('/services', async (req, res) => {
            const service = req.body;
            // console.log('hit the post api', service);
            const result = await servicesCollection.insertOne(service);
            // console.log(result);
            res.json(result);
        })

        // POST blog
        app.post('/blogs', async (req, res) => {
            const blog = req.body;
            // console.log('hit the post api', service);
            const result = await blogsCollection.insertOne(blog);
            // console.log(result);
            res.json(result);
        })

        // POST services
        app.post('/blogs', async (req, res) => {
            const blog = req.body;
            // console.log('hit the post api', service);
            const result = await blogsCollection.insertOne(blog);
            // console.log(result);
            res.json(result);
        })

        // Post order 
        app.post('/orders', async (req, res) => {
            const order = req.body;
            delete order['_id']
            // console.log(order);
            const result = await ordersCollection.insertOne(order);
            // console.log(result);
            res.json(result);
        })

        // Post user
        app.post('/users', async (req, res) => {
            const user = req.body;
            // console.log('hit the order api', order);
            const result = await usersCollection.insertOne(user);
            // console.log(result);
            res.json(result);
        })

        // check admin
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await usersCollection.findOne(query);
            let isAdmin = false;
            if (result?.role === 'admin')
                isAdmin = true;
            res.json({ admin: isAdmin })
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log('listening PORT', port);
})