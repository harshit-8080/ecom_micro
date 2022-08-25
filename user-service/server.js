const express = require("express");
const mongoose = require("mongoose");
const UserModel = require("./User.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express()

app.use(express.json());

mongoose.connect("mongodb+srv://dipu71_user1:5d1ocrukARzN74Kh@cluster0.5ocpt.mongodb.net/?retryWrites=true&w=majority")
    .then( () => {
        console.log('Connected to database from user service')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. \n${err}`);
    })


app.post("/register", async(req, res) => {

  try {
    
    const user = {
        username:req.body.username,
        password:req.body.password
    }

    result = await UserModel.create(user);

    if(result){
        res.status(201).send({
            "msg":"user created"
        })
    }
    else{
        res.status(500).send({
            "msg":"internal server error"
        })
    }

  } catch (error) {
    
    res.status(5000).send({
        "msg":"internal server error"
    })
  }

})

app.post("/login", async(req, res)=> {

try{
    const user = await UserModel.find({username:req.body.username});

    if(user.length > 0) {
      //console.log("user = ", user);
        bcrypt.compare(req.body.password, user[0].password, function(err, result) {
            if(result) {

                let payload = { username: req.body.username };
                //console.log("payload = ", payload);
                let accessToken = jwt.sign(payload,"SECRET", {
                    algorithm: "HS256",
                    expiresIn: "2h"
                  });

                res.status(200)
                return res.send({
                "msg":"user logged in",
                accessToken: accessToken
                })
            }
            else{
                return res.status(401).send({"data":"password not correct"});
            }

        });
    }
    else {
        res.status(400).send({
            "msg":"invalid username"
        })
    }

  } catch (error) {
    
    console.log("catch error = ", error);
    res.status(500).send({
        "msg":"internal server error"
    })
  }



})

app.get("/users", async(req, res) => {

    const data = await UserModel.find();

    res.status(200).send({
        "user list": data
    })
})


app.listen(3000, ()=>{
    console.log("server started on 3000 for user service");
})