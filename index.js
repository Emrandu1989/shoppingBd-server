const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",

  ],
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
const uri = 'mongodb+srv://emrandu1989:emran5200@cluster0.7h7v6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri, {
  serverApi: { 
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db('shoppingBD');
    const productsCollection = db.collection('products');



    app.get('/products', async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      try {
        const totalProducts = await productsCollection.countDocuments();
        const products = await productsCollection.find().skip(skip).limit(limit).toArray();

        res.send({
          products,
          currentPage: page,
          totalPages: Math.ceil(totalProducts / limit),
          totalProducts
        });
      } catch (error) {
        res.status(500).send({ message: 'Failed to fetch products' });
      }
    });
    app.get('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await productsCollection.findOne(query);
      res.send(result);
    })




    app.get('/logout', (req, res) => {
      try {
        res.clearCookie('token', {
          maxAge: 0,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        }).send({ success: true });
      } catch (error) {
        res.status(500).send({ message: 'Failed to log out' });
      }
    });

    app.get('/', (req, res) => {
      res.send('Server is running');
    });

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

  } finally {
    process.on('SIGINT', async () => {
      // await client.close();
      // process.exit(0);
    });
  }
}

run().catch(console.error);



















