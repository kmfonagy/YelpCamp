const   express         = require("express"),
        router          = express.Router(),
        Campground      = require("../models/campground"),
        Comment         = require("../models/comment"),
        middleware      = require("../middleware"),
        nodeGeocoder    = require("node-geocoder");


//GEOCODER

const option = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

const geocoder = nodeGeocoder();

//INDEX - show all campgrounds
router.get("/", (req, res)=>{
    // Get all campgrounds from DB
    Campground.find({}, (err, allCampgrounds)=>{
      if(err){
          req.flash("error", "Something Went Wrong. Please Try Again.");
          console.log(err);
      } else {
          res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds'});
      }
    });
});

//CREATE - add new campground to DB
//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, (req, res)=>{
  // get data from form and add to campgrounds array
  const name = req.body.name,
        image = req.body.image,
        desc = req.body.description,
        author = {
      id: req.user._id,
      username: req.user.username
  }
  geocoder.geocode(req.body.location, (err, data)=> {
    if (err || !data.length) {
        console.log(err);
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    const lat = data[0].latitude,
        lng = data[0].longitude,
        location = data[0].formattedAddress,
        newCampground = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    Campground.create(newCampground, (err, newlyCreated)=>{
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
  });
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, (req, res)=>{
  res.render("campgrounds/new"); 
});

// SHOW - shows more info about one campground
router.get("/:id", (req, res)=>{
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground)=>{
        if(err){
            req.flash("error", "Something Went Wrong. Please Try Again.");
            console.log(err);
        } else {
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res)=>{
    Campground.findById(req.params.id, (err, foundCampground)=>{
        if(err){
            req.flash("error", "This Campground Does Not Exist.");
            console.log(err);
        } else {
        res.render("campgrounds/edit", {campground: foundCampground});
        }
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, (req, res)=>{
  geocoder.geocode(req.body.location, (err, data)=> {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, campground)=>{
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Campground Updated Successfully.");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

//DESTROY CAMPGROUND
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res)=>{
    Campground.findByIdAndRemove(req.params.id, (err, campgroundRemoved)=>{
        if(err){
            req.flash("error", "Something Went Wrong. Please Try Again.");
            res.redirect("/campgrounds/" + req.params.id);
        }
        Comment.deleteMany({
            _id: {
                $in: campgroundRemoved.comments
            }
        }, (err)=>{
            if(err){
                req.flash("error", "Something Went Wrong. Please Try Again.");
                console.log(err);
            }
            req.flash("success", "Successfully Deleted Campground.");
            res.redirect("/campgrounds");
        });
    });
});



module.exports = router;