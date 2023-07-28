const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

const app = express();

app.set('view engine' , 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

try {
    mongoose.connect("mongodb://0.0.0.0:27017/wikiAPI").then(()=>{
        console.log("Connected to MongoDB");
})
} catch (error) {
    console.log(error);
}

const articleSchema = mongoose.Schema({
    title: {
        type: String,
        
    },
    content: {
        type: String,
        
    }
});

const article = mongoose.model("articles" , articleSchema , "articles");

app.route("/articles")
    .get(async(req , res)=>{
        try {
            let cur = await article.find();
            res.json(cur);
            console.log("Successful GET /articles");
        } catch (error) {
            console.log("Error in get '/articles'"+error);
        }
    })
    .post(async(req , res)=>{
        try {
        
            const newArticle = new article({
                title: req.body.title,
                content: req.body.content
            });
            newArticle.save();
            let cur = await article.find({title:req.body.title});
            console.log(cur);
            res.sendStatus(200);
        } catch (error) {
            console.log("POST /articles error" + error);
            res.sendStatus(403);
        }
    })
    .delete(async(req , res)=>{
        try {
            // await article.deleteOne({});
            console.log("successfully deleted all the documents in Articles collection"); 
            res.sendStatus(200);
        } catch (error) {
            console.log(error);
        }
    });

app.route("/articles/:title")
    .get( async(req , res)=>{
        try {
            const query = article.where({title:req.params.title});
            // const cur = await article.findOne({title:req.params.title});
            const cur = await query.findOne();
            res.json(cur);
        } catch (err) {
            console.log("/POST/"+req.params.title+": "+err);
            res.send(404);
        }
    })
    .put((req , res)=>{
        try {
            console.log(req.params.title , req.body);
            const filter = {title: req.params.title};
            const update = {title:req.body.title , content:req.body.content};
            article.findOneAndUpdate(filter , update , {new: true})
                .then(()=>{
                    console.log("200");
                    res.sendStatus(200);
                });
            // await article.updateOne({title: req.params.title} , {title:req.body.title , content:req.body.content});
        } catch (error) {
            console.log(error);
            res.status(404);
        }
    })
    .patch((req , res)=>{
        try{
            const filter = {title: req.params.title};
            const update = {title:req.body.title , content:req.body.content};
            article.findOneAndUpdate(filter , { $set: req.body } , {new: true})
                .then(()=>{
                    console.log("200");
                    res.sendStatus(200);
                });
        }catch(err){ 
            console.log(err);
        }
    })
    .delete(async (req , res)=>{
        let cur = await article.findOne({title:req.params.title});
        await article.deleteOne({_id:cur._id});
        res.sendStatus(200);
    });


app.listen(3000 , (req , res)=>{
    console.log("server  listening at port 3000");
});