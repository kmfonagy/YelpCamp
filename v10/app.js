//VERSION 10

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
    
const   commentRoutes   = require("./routes/comments"),
        campgroundRoutes = require("./routes/campgrounds"),
        authRoutes     = require("./routes/index");
    
mongoose.connect("mongodb://localhost/yelp_camp_v10", {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
//seedDB(); //Seed the DB

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

app.use("/", authRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(process.env.PORT, process.env.IP, ()=>{
   console.log("The YelpCamp Server Has Started!");
});