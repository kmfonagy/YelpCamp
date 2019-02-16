const middlewareObj   = {},
      Campground      = require("../models/campground"),
      Comment         = require("../models/comment");

//CAMPGROUND MIDDLEWARE
middlewareObj.isLoggedIn = (req, res, next)=>{
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

middlewareObj.checkCampgroundOwnership = (req, res, next)=>{
    if(req.isAuthenticated()){
        //if logged in, did user own campground
        Campground.findById(req.params.id, (err, foundCampground)=>{
            if(err){
                res.redirect("back");
            } else {
                //use Mongoose object "foundCampground.author.id" !=== req.user.id, so use:
                if(foundCampground.author.id.equals(req.user._id)){
                    next();
                } else {
                    //otherwise redirect
                    res.redirect("back")   
                }
            }
        });
    } else {
        //if not redirect
        res.redirect("back");
    }
}

//COMMENTS MIDDLEWARE
middlewareObj.isLoggedIn = (req, res, next)=>{
    if(req.isAuthenticated()){
        return next();
    }
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
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                } else {
                    //otherwise redirect
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