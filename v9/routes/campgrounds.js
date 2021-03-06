const   express     = require("express"),
        router      = express.Router(),
        Campground  = require("../models/campground");

//INDEX - show all campgrounds
router.get("/", (req, res)=>{
    // Get all campgrounds from DB
    Campground.find({}, (err, allCampgrounds)=>{
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds:allCampgrounds});
       }
    });
});

//CREATE - add new campground to DB
router.post("/", isLoggedIn, (req, res)=>{
    // get data from form and add to campgrounds array
    const   name = req.body.name,
            image = req.body.image,
            desc = req.body.description,
            author = {
                id: req.user._id,
                username: req.user.username
            },
            newCampground = {name: name, image: image, description: desc, author: author};
    // Create a new campground and save to DB
    Campground.create(newCampground, (err, newlyCreated)=>{
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            res.redirect("/");
        }
    });
});

//NEW - show form to create new campground
router.get("/new", isLoggedIn, (req, res)=>{
   res.render("campgrounds/new"); 
});

// SHOW - shows more info about one campground
router.get("/:id", (req, res)=>{
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground)=>{
        if(err){
            console.log(err);
        } else {
            console.log(foundCampground)
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

module.exports = router;