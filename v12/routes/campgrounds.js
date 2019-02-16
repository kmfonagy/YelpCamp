const   express     = require("express"),
        router      = express.Router(),
        Campground  = require("../models/campground"),
        Comment     = require("../models/comment"),
        middleware  = require("../middleware");

//INDEX - show all campgrounds
router.get("/", (req, res)=>{
    // var noMatch = null;
    // if(req.query.search){
    //     const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    //     // Get all campgrounds from DB
    //     Campground.find({name: regex}, function(err, allCampgrounds){
    //       if(err){
    //           console.log(err);
    //       } else {
    //           if(allCampgrounds.length < 1) {
    //               noMatch = "No campgrounds match that query, please try again.";
    //           }
    //           res.render("campgrounds/index", {campgrounds:allCampgrounds, noMatch: noMatch});
    //       }
    //     });
    // }else{
        // Get all campgrounds from DB
        Campground.find({}, (err, allCampgrounds)=>{
           if(err){
               req.flash("error", "Something Went Wrong. Please Try Again.");
               console.log(err);
           } else {
              res.render("campgrounds/index",{campgrounds:allCampgrounds});
           }
        });    
    // }
});

//CREATE - add new campground to DB
router.get("/", (req, res)=>{
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB
        Campground.find({name: regex}, function(err, allCampgrounds){
           if(err){
               req.flash("error", err.message)
               console.log(err);
               return res.redirect("/campgrounds");
           } else {
              if(allCampgrounds.length < 1) {
                  noMatch = "No campgrounds match that query, please try again.";
              }
              res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch});
           }
        });
    } else {
        // Get all campgrounds from DB
        Campground.find({}, (err, allCampgrounds)=>{
           if(err){
               console.log(err);
           } else {
              res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch});
           }
        });
    }
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

//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, (req, res)=>{
   //find and update the correct campground
   Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground)=>{
       if(err){
           //redirect somewhere
           req.flash("error", "Something Went Wrong. Please Try Again.");
           res.redirect("back");
       } else {
           //redirect somewhere
           req.flash("success", "Campground Updated Successfully.");
           res.redirect('/campgrounds/' + req.params.id);
       }
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

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;