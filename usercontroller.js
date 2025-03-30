import {client} from "./database.js"


async function getAllProducts() {
    try{
        const db = client.db("KeyChainDb");
        const collection = db.collection("KeyChains");
        const products = await collection.find({}).toArray();
        return products
    }
    catch (err){
        console.error("error occured : ", err)
        throw err
    }

}

async function getLatestProducts(){
    try{
        const db = client.db("KeyChainDb");
        const collection = db.collection("KeyChains");
        const products = await collection.find().sort({_id:-1}).limit(6).toArray();
        return products
    }
    catch (err){
        console.error("error occured : ", err)
        throw err
    }
}

async function getProductBySlug(slug) {
    try{
        const db = client.db("KeyChainDb");
        const collection = db.collection("KeyChains");
        const product = await collection.findOne({slug : slug});
        if(product){
            return product
        }
        else{
            return null
        }
    }
    catch (err){
        console.error("error occured : ", err)
        throw err
    }
}
export {getAllProducts, getProductBySlug, getLatestProducts}