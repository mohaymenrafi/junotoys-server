const express = require('express');
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;
const app = express();
// middleware
app.use(cors());
app.use(express.json());

const { MongoClient } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y5cda.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db('juno');
    const productsCollection = database.collection('products');
    const feedbacksCollection = database.collection('feedbacks');

    // get products
    app.get('/products', async (req, res) => {
      const products = productsCollection.find({});
      const result = await products.toArray();
      res.send(result);
    });

    // get products with id
    app.get('/products/:id', async (req, res) => {
      const { id } = req.params;
      const query = { sku: parseInt(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    // Post to get products by id
    app.post('/products/bykeys', async (req, res) => {
      const keys = req.body;
      const query = { _id: { $in: keys } };
      const products = await productsCollection.find(query).toArray();
      res.send(products);
    });

    // Post orders
    app.post('/orders', async (req, res) => {
      const userOrder = req.body;
      const order = {
        name: userOrder.name,
        email: userOrder.email,
        phone: userOrder.phone,
        address: userOrder.address,
        zipcode: userOrder.zipcode,
        city: userOrder.city,
        state: userOrder.state,
        country: userOrder.country,
        productName: userOrder.productName,
      };
    });

    // post reviews to db
    app.post('/feedbacks', async (req, res) => {
      const userFeedback = req.body;
      const review = {
        name: userFeedback.name,
        email: userFeedback.email,
        feedback: userFeedback.feedback,
        productName: userFeedback.productName,
      };
      const result = await feedbacksCollection.insertOne(review);
      res.json(result);
    });
    // get reviews api
    app.get('/feedbacks', async (req, res) => {
      const { id } = req.query;
      const feedbacks = feedbacksCollection.find({});
      const result = await feedbacks.toArray();
      if (id) {
        const newResult = result.filter((feedback) => feedback.sku === id);
        res.send(newResult);
      } else {
        res.send(result);
      }
    });
  } finally {
    // await client.close()
  }
}
run();

app.get('/', (req, res) => {
  res.send('initial server setup for juno toys is done');
});

app.listen(port, () => {
  console.log('juno server running at: ', port);
});
