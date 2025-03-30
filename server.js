import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import Stripe from "stripe"
import {getAllProducts, getLatestProducts, getProductBySlug} from "./usercontroller.js";
import {client, runDb} from "./database.js"
import { ObjectId } from "mongodb";

dotenv.config();
const stripe = Stripe(process.env.STRIPE_PRIVATE_KEY);

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
runDb();

app.get("/api/products", async (req, res) =>{
    try{
        const products = await getAllProducts();
        res.json(products);
    }
    catch (err){
        res.status(500).json({error : "failed to fetch from server"});
    }
})

app.get("/api/product/:slug", async (req, res) =>{

    const {slug} = req.params;

    try{
        const product = await getProductBySlug(slug);
        console.log(product);
        
        res.json(product);
    }
    catch (err){
        res.status(500).json({error : "failed to fetch from server"});
    }
})

app.post("/api/checkout", async (req, res) =>{
    try{
        const session = await stripe.checkout.sessions.create({
            payment_method_types : ["card"],
            mode: "payment",
            line_items: req.body.items.map((item) =>{
                return{
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: item.name
                        },
                        unit_amount: item.price
                    },
                    quantity: item.quantity
                }
            }),
            success_url: "http://localhost:5173/success",
            cancel_url: "http://localhost:5173/cancel"
        })
        res.json({checkoutUrl: session.url})
    } catch(err){
        console.log(err)
        res.status(500).json({error : err.message})
    }
})

app.get("/api/latestProducts", async (req, res) =>{
    try{
        const products = await getLatestProducts();
        console.log(products);
        
        res.json(products);
    }
    catch (err){
        res.status(500).json({error : "failed to fetch from server"});
    }
})

app.post("/api/addProduct", async(req, res) =>{
    try{
        const db = client.db("KeyChainDb");
        const collection = db.collection("KeyChains");

        const result = await collection.insertOne(req.body.product)
        res.status(200).json({"message" : "adding succesful!", userId : result.insertedId})
    } catch (err){
        res.status(500).json({"error" : "Failed to add user:", details: err.message})
    }
})

app.post("/api/addReview", async(req, res) =>{
    try{
        
        const {id} = req.body;
        
        const objectId = new ObjectId(id);

        const {review} = req.body
        const db = client.db("KeyChainDb");
        const collection = db.collection("KeyChains");

        const result = await collection.updateOne({_id : objectId}, {$push: {reviews : {rating : review.rating, description : review.description}}})
        res.status(200).json({"message" : "adding succesful!"})
    } catch (err){
        res.status(500).json({"error" : "Failed to add review:", details: err.message})
    }
})

app.post("/api/delete", async(req, res) =>{
    try{
        const {id} = req.body;
        const objectId = new ObjectId(id);
        const db = client.db("KeyChainDb");
        const collection = db.collection("KeyChains");

        const result = await collection.deleteOne({_id : objectId})
        res.status(200).json({"message" : "delete succesful!", userId : result.insertedId})
    } catch (err){
        res.status(500).json({"error" : "Failed to delete user:", details: err.message})
    }
})

app.post("/api/update", async(req, res) =>{
    try{
        const {product} = req.body;
        
        const objectId = new ObjectId(product._id);
        delete product._id
        const db = client.db("KeyChainDb");
        const collection = db.collection("KeyChains");

        const result = await collection.updateOne({_id : objectId}, {$set: product})
        res.status(200).json({"message" : "update succesful!", userId : result.insertedId})
    } catch (err){
        res.status(500).json({"error" : "Failed to update user:", details: err.message})
    }
})
//---------------------middleware--------------------------------------


//--------------server exit and start-----------------------------------------

process.on('SIGINT', async () => {
    console.log('Received SIGINT. Closing MongoDB connection...');
    
    try {
      await client.close();
      console.log('MongoDB connection closed.');
      process.exit(0);
    } catch (error) {
      console.error('Error while closing MongoDB connection:', error);
      process.exit(1);
    }
  });

app.listen(PORT, () => {console.log(`Server started at port:`,PORT)});