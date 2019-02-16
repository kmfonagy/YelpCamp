//V6

const express       = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    Campground      = require("./models/campground"),
    Comment         = require("./models/comment"),
    methodOverride  = require("method-override"),
    User            = require("./models/user"),
    seedDB          = require("./seeds");
    
mongoose.connect("mongodb://localhost/yelp_camp_v6", {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
seedDB();

//passport config
app.use(require("express-session")({
    secret: "secret code entered here",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
    res.locals.currentUser = req.user;
    next();
});

app.get("/", (req, res)=>{
    res.render("landing");
});

//INDEX - show all campgrounds
app.get("/campgrounds", (req, res)=>{
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
app.post("/campgrounds", (req, res)=>{
    // get data from form and add to campgrounds array
    const name = req.body.name;
    const image = req.body.image;
    const desc = req.body.description;
    const newCampground = {name: name, image: image, description: desc}
    // Create a new campground and save to DB
    Campground.create(newCampground, (err, newlyCreated)=>{
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});

//NEW - show form to create new campground
app.get("/campgrounds/new", isLoggedIn, (req, res)=>{
   res.render("campgrounds/new"); 
});

// SHOW - shows more info about one campground
app.get("/campgrounds/:id", isLoggedIn, (req, res)=>{
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


// ====================
// COMMENTS ROUTES
// ====================

app.get("/campgrounds/:id/comments/new", isLoggedIn, (req, res)=>{
    // find campground by id
    Campground.findById(req.params.id, (err, campground)=>{
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {campground: campground});
        }
    })
});

app.post("/campgrounds/:id/comments", isLoggedIn, (req, res)=>{
   //lookup campground using ID
   Campground.findById(req.params.id, (err, campground)=>{
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else {
        Comment.create(req.body.comment, (err, comment)=>{
           if(err){
               console.log(err);
           } else {
               campground.comments.push(comment);
               campground.save();
               res.redirect('/campgrounds/' + campground._id);
           }
        });
       }
   });
   //create new comment
   //connect new comment to campground
   //redirect campground show page
});

//=================
//AUTH ROUTES
//=================

//show register form
app.get("/register", (req, res)=>{
    res.render("register");
});
//handle sign up logic
app.post("/register", (req, res)=>{
    const newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, (err, user)=>{
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, ()=>{
            res.redirect("/campgrounds");
        });
    });
});

//show login form
app.get("/login", (req, res)=>{
    res.render("login");
})

//handle login logic
app.post("/login", passport.authenticate('local', 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), (req, res)=>{
        
});

//LOGOUT LOGIC ROUTE
app.get("/logout", (req, res)=>{
   req.logout();
   res.redirect("/campgrounds");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

app.listen(process.env.PORT, process.env.IP, ()=>{
   console.log("The YelpCamp Server Has Started!");
});