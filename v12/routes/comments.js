const   express     = require("express"),
        router      = express.Router({mergeParams: true}),
        middleware  = require("../middleware"),
        Campground  = require("../models/campground"),
        Comment     = require("../models/comment");

//comments new
router.get("/new", middleware.isLoggedIn, (req, res)=>{
    // find campground by id
    Campground.findById(req.params.id, (err, campground)=>{
        if(err){
            req.flash("error", "Something Went Wrong. Please Try Again.");
            console.log(err);
        } else {
             res.render("comments/new", {campground: campground});
        }
    })
});

//comments create
router.post("/", middleware.isLoggedIn, (req, res)=>{
   //lookup campground using ID
   Campground.findById(req.params.id, (err, campground)=>{
       if(err){
           req.flash("error", "Something Went Wrong. Please Try Again.");
           console.log(err);
           res.redirect("/campgrounds");
       } else {
        Comment.create(req.body.comment, (err, comment)=>{
           if(err){
               req.flash("error", "Something Went Wrong. Please Try Again.");
               console.log(err);
           } else {
               //add username & ID to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               campground.comments.push(comment);
               campground.save();
               req.flash("success", "Comment Successfully Created.");
               res.redirect('/campgrounds/' + campground._id);
           }
        });
       }
   });
});

//COMMENT EDIT
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res)=>{
    Comment.findById(req.params.comment_id, (err, foundComment)=>{
        if(err){
            req.flash("error", "Something Went Wrong. Please Try Again.");
            res.redirect("back");
        } else {
            req.flash("success", "Successfully Edited Comment.");
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        }
    });
});

//COMMENT UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res)=>{
    //find and update the correct comment
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err)=>{
       if(err){
           req.flash("error", "Something Went Wrong. Please Try Again.");
           console.log(err);
           //redirect somewhere
           res.redirect("back");
       } else {
           //redirect somewhere
           req.flash("success", "Successfully Updated Comment.");
           res.redirect('/campgrounds/' + req.params.id);
       }
   });
});

//DESTROY COMMENT
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res)=>{
    Comment.findByIdAndRemove(req.params.comment_id, (err)=>{
        if(err){
            req.flash("error", "Something Went Wrong. Please Try Again.");
            res.redirect("back");
        } else {
            req.flash("success", "Successfully Deleted Comment.");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;