const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const app = express();

const uri = "mongodb+srv://katarzynatruch:zDcgC7IVwo6QonUO@christmascluster.vk7zb.mongodb.net/?retryWrites=true&w=majority&appName=ChristmasCluster";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.use(cors());
app.use(express.json());

app.get("/reset", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("christmas_draw");
    const collection = database.collection("userData");
    const clear = await collection.updateMany({}, { $set: { draw: null } });
}catch (error) {
  console.error(error);
  res.status(500).send('Internal Server Error');
}
});


app.get('/names', async (req, res) => {
  try {
    await client.connect();
    const database = client.db("christmas_draw");
    const collection = database.collection("userData");
    const names = await collection.find({ draw: null }, { projection: { id: 1, name: 1, draw: 1, _id: 0} }).toArray();
    console.log("names - server", names);
    res.json(names);
  }catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
  });

app.get('/people_left', async (req, res) => {
  try {
    await client.connect();
    const database = client.db("christmas_draw");
    const collection = database.collection("userData");
    const names = await collection.find({}, { projection: {id: 1, name: 1, draw: 1, _id: 0 } }).toArray();
    const chosenIds = names.map(name => name.draw);
    const namesLeft = names.filter(name => !chosenIds.includes(name.id));
    console.log("namesLeft - server", namesLeft);
    res.json(namesLeft);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/draw', async (req, res) => {
  try {
    await client.connect();
    const database = client.db("christmas_draw");
    const collection = database.collection("userData");
    const { id, drawnId } = req.query;
    console.log("server draw", id, drawnId);
    if (!id || !drawnId) {
      return res.status(400).json({ error: 'Missing id or drawnId' });
    }
    const updatedNames = await collection.updateOne({ id: parseInt(id) }, { $set: { draw: parseInt(drawnId) } });
    res.json(updatedNames);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});