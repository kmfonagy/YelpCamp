const   express     = require("express"),
        app         = express(),
        bodyParser  = require("body-parser"),
        mongoose    = require("mongoose");

mongoose.connect("mongodb://localhost/yelp_camp", {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//SCHEMA SETUP

const campgroundSchema = new mongoose.Schema({
   name: String,
   image: String,
   description: String
});

const Campground = mongoose.model("Campground", campgroundSchema);

// Campground.create(
//     {name: "Buckeye Lake", image: "https://koa.com/content/index/buckeye-lake/photos/35101_27.jpg.axd?preset=coverphoto3", description: "We are the closest KOA to Columbus, Ohio, Ohio state fairgrounds, Ohio State University, Denison University, German Village and National Trails/NHRA race track."}
//     )

app.get("/", (req, res) => {
    res.render("landing");
});

//INDEX - show all campgrounds
app.get("/index", (req, res) => {
    // get all campgrounds from DB
    Campground.find({}, (err, allCampgrounds) =>{
       if(err){
           console.log(err);
       } else {
           res.render("index", {campgrounds: allCampgrounds});
       }
    });
});

//CREATE - add new CG to DB
app.post("/index", (req, res) => {
    //get data from form & add to campgrounds array
    const name = req.body.campName;
    const image = req.body.campImg;
    const desc = req.body.description;
    const newCampground = {name: name, image: image, description: desc};
    //create a new CG and save to DB
    Campground.create(newCampground, (err, newlyCreated) => {
       if(err){
           console.log(err);
       } else {
           //redirect to campgrounds page
           res.redirect("/index");
       }
    });
});

//NEW - shw form to create new CG
app.get("/index/new", (req, res) => {
    res.render("new.ejs");
});

//SHOW
app.get("/index/:id", (req, res) =>{
    //find CG with provided ID
    Campground.findById(req.params.id, (err, foundCampground) => {
        if(err){
            console.loge(err);
        } else {
            //render show template with the CG
            res.render("show", {campground: foundCampground});
        }
    });
});


app.listen(8080, process.env.IP, () => {
    console.log("YelpCamp server has started");
});