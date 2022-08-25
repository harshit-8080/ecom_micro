const express = require("express");
const mongoose = require("mongoose");
const checkAuth = require("../checkAuth.js");
const ProductModel = require("./Product.model.js");
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");
const app = express()

app.use(express.json());

var channel, connection;
var order;

mongoose.connect("mongodb+srv://dipu71_user1:5d1ocrukARzN74Kh@cluster0.5ocpt.mongodb.net/?retryWrites=true&w=majority")
    .then( () => {
        console.log('Connected to database from product service')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. \n${err}`);
    })


async function connect() {
  
    // step 1 : Create Connection
    connection = await amqp.connect("amqp://localhost:5672");

    // step 2 : Create Channel
    channel = await connection.createChannel();

    // step 3 : Assert queue
    channel.assertQueue("PRODUCT");
}    
connect();


app.get("/", checkAuth, (req, res)=> {
    res.status(200).send({
        "msg":"from product service"
    })
})

app.post("/product/create", checkAuth, async (req, res) => {
    const { name, description, price } = req.body;

    const product = {
        name:req.body.name,
        description:req.body.description,
        price:req.body.price
    }

    const newProduct = await ProductModel.create(product);

    res.status(201).send({
        "msg":"product created"
    })

});

app.post("/product/buy", checkAuth , async(req,res) => {

    const {ids} = req.body;
    const products = await ProductModel.find({_id: {$in:ids}});

    //console.log("products = ", products);
    channel.sendToQueue("ORDER", Buffer.from(
        JSON.stringify({
            products,
            userEmail:req.user.email,
        })
    ))

    await channel.consume("PRODUCT", (data) => {
       // console.log("order 71 = ", order);
        order = JSON.parse(data.content);
    });
   // console.log("order = ", order);

    return res.status(200).send({
        "msg":order
    })


})



app.get("/products", checkAuth,  async(req, res) => {

    const data = await ProductModel.find();

    res.status(200).send({
        "msg": data
    })

})









app.listen(4000, ()=>{
    console.log("server started on 4000 for products service");
})