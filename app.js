//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const _ = require("lodash");

// const express = require("express");



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
mongoose.set('strictQuery', false);

//important
//url will change with system config

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = new mongoose.model("item",itemSchema);

const item1 = new Item({
  name:"Welcome to your to-do List"
});
const item2 = new Item({
  name: "Hit the + button to add a new Item."
})
const item3 = new Item({
  name:"<-- Hit this to delete an item"
})

const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
  name:String,
  items:[itemSchema]
})

const List = new mongoose.model("list",listSchema);

// const item = new Item({
//   name: "Test3"
// })

// item.save();
app.get("/", function(req, res) {

  Item.find({},function(err,results){

    if(results.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Default items inserted successfully!");
        }
      })
      res.redirect("/");
    }else{
      res.render("list", {listTitle:"Today", newListItems: results});
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  })

  if(listName == "Today"){
    // Item.insertOne(item);
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      if(err){
        console.log(err)
      }else{
        foundList.items.push(item);
        foundList.save();
        res.redirect("/category/"+listName);
      }
    })
  }
  

  
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Successfully deleted an Item!");
      }
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/category/"+listName);
      }
    });
  }
  
})
// app.get("/work", function(req,res){
//   Item.find({},function(err,results){
//     res.render("list", {listTitle: "Work List", newListItems: results});
//   })
  
// });

// app.get("/about", function(req, res){
//   res.render("about");
// });

// /category
app.get("/category/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  // console.log(customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(err){
      console.log(err)
    }else{
      if(!foundList){
        const list = new List({
          name:customListName,
          items:defaultItems
        })
        list.save();
        res.redirect("/category/" + customListName);

      }else{
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items})
      }
    }
  })
});




app.listen(3000, function() {
  console.log("Server started on port 3000");
});
