const express = require("express");
const mongoose = require("mongoose");
const checkAuth = require("../checkAuth.js");
const OrderModel = require("./Order.model");
const amqp = require("amqplib");
const app = express()

var channel, connection, newOrder;
app.use(express.json());


async function createOrder(products, username) {

    let total = 0;
    for(let t=0; t<products.length; t++) {
        total+=products[t].price;
    }

    const newOrder = await OrderModel.create({
        products:products,
        user:username,
        total_price:total
    })
    
    channel.sendToQueue(
        "PRODUCT",
        Buffer.from(JSON.stringify({ newOrder }))
    );
    

}
async function connect () {

    const amqpServer = "amqp://localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue("ORDER");
}

connect().then(() => {
    channel.consume("ORDER", (data) => {
        //console.log("Consuming ORDER service");
        const { products, username } = JSON.parse(data.content);
        newOrder = createOrder(products, username)
        channel.ack(data);
    });
});



mongoose.connect("mongodb+srv://dipu71_user1:5d1ocrukARzN74Kh@cluster0.5ocpt.mongodb.net/?retryWrites=true&w=majority")
    .then( () => {
        console.log('Connected to database from user service')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. \n${err}`);
    })

app.get("/getOrders", checkAuth, async(req, res)=> {

    const data = await OrderModel.find();
    //console.log("data = ", data);
    res.status(200).send({
        "data":data
    })

})




app.listen(6000, ()=>{
    console.log("server started on 5000 for order service");
})