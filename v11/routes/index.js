const   express     = require("express"),
        router      = express.Router(),
        passport    = require("passport"),
        User        = require("../models/user");

//show register form
router.get("/register", (req, res)=>{
    res.render("register", {page: 'register'});
});

//handle sign up logic
router.post("/register", (req, res)=>{
    const newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, (err, user)=>{
        if(err){
            req.flash("error", err.message);
            console.log(err);
            return res.redirect("register");
        }
        passport.authenticate("local")(req, res, ()=>{
            req.flash("success", "Welcome to YelpCamp, " + user.username + "!");
            res.redirect("/campgrounds");
        });
    });
});

//show login form
router.get("/login", (req, res)=>{
    res.render("login", {page: 'login'});
})

//handle login logic
router.post("/login", passport.authenticate('local', 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), (req, res)=>{
        
});

//LOGOUT LOGIC ROUTE
router.get("/logout", (req, res)=>{
   req.logout();
   req.flash("success", "Successfully Logged Out")
   res.redirect("/campgrounds");
});

module.exports = router;