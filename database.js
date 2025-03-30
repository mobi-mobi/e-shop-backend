import {MongoClient, ServerApiVersion} from "mongodb"
import dotenv from "dotenv"

dotenv.config();

const uri = process.env.DB_CONNECTION_URI

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function runDb() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  }
  catch (err){
    console.error("server error : ", err);
  }
}


export {client, runDb};