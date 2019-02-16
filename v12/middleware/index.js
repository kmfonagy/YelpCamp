const middlewareObj   = {},
      locus           = require("locus"),
      Campground      = require("../models/campground"),
      Comment         = require("../models/comment");

//CAMPGROUND MIDDLEWARE
middlewareObj.isLoggedIn = (req, res, next)=>{
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please Log In First.")
    res.redirect("/login");
};

middlewareObj.checkCampgroundOwnership = (req, res, next)=>{
    if(req.isAuthenticated()){
        //if logged in, did user own campground
        Campground.findById(req.params.id, (err, foundCampground)=>{
            if(err){
                req.flash("error", "Something Went Wrong. Please Try Again.");
                res.redirect("back");
            } else {
                //use Mongoose object "foundCampground.author.id" !=== req.user.id, so use:
                if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                } else {
                    //otherwise redirect
                    req.flash("error", "Please Log In First.");
                    res.redirect("back")   
                }
            }
        });
    } else {
        //if not redirect
        req.flash("error", "Please Log In First.");
        res.redirect("back");
    }
}

//COMMENTS MIDDLEWARE
middlewareObj.isLoggedIn = (req, res, next)=>{
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please Log In First")
    res.redirect("/login");
};

middlewareObj.checkCommentOwnership = (req, res, next)=>{
    
    if(req.isAuthenticated()){
        
        //if logged in, did user own comment
        Comment.findById(req.params.comment_id, (err, foundComment)=>{
            if(err){
                res.redirect("back");
            } else {
                //use Mongoose object "foundComment.author.id" !=== req.user.id, so use:
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                } else {
                    //otherwise redirect
                    req.flash("error", "You Do Not Have Permissions For This Action")
                    res.redirect("back")   
                }
            }
        });
    } else {
        //if not redirect
        res.redirect("back");
    }
}

middlewareObj.checkProfileOwnership = (req, res, next)=>{
    // eval(locus);
    if(req.isAuthenticated()){
        //if logged in, did user own comment
        Comment.findById(req.params._id, (err, foundProfile)=>{
            if(err){
                res.redirect("back");
            } else {
                // eval(locus)
                //use Mongoose object "foundComment.author.id" !=== req.user.id, so use:
                if(foundProfile.equals(req.user._id) || req.user.isAdmin){
                    next();
                } else {
                    //otherwise redirect
                    req.flash("error", "You Do Not Have Permissions For This Action")
                    res.redirect("back")   
                }
            }
        });
    } else {
        //if not redirect
        res.redirect("back");
    }
}

module.exports = middlewareObj;