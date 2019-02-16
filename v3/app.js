//YelpCamp V3
const   express     = require("express"),
        app         = express(),
        bodyParser  = require("body-parser"),
        mongoose    = require("mongoose"),
        Campground  = require("./models/campground"),
        seedDB      = require("./seeds"),
        Comment     = require("./models/comment");
        //User        = require("./models.user");
        
seedDB();
mongoose.connect("mongodb://localhost/yelp_camp_v3", {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("landing");
});

//INDEX - show all campgrounds
app.get("/campgrounds", (req, res) => {
    // get all campgrounds from DB
    Campground.find({}, (err, allCampgrounds) =>{
       if(err){
           console.log(err);
       } else {
           res.render("campgrounds", {campgrounds: allCampgrounds});
       }
    });
});

//CREATE - add new CG to DB
app.post("/campgrounds", (req, res) => {
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
           res.redirect("/campgrounds");
       }
    });
});

//NEW - shw form to create new CG
app.get("/campgrounds/new", (req, res) => {
    res.render("new.ejs");
});

//SHOW
app.get("/campgrounds/:id", (req, res) =>{
    //find CG with provided ID
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
        if(err){
            console.log(err);
        } else {
            //render show template with the CG
            res.render("show", {campground: foundCampground});
        }
    });
});


app.listen(8080, process.env.IP, () => {
    console.log("YelpCamp server has started");
});