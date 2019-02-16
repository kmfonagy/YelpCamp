const   express     = require("express"),
        router      = express.Router(),
        passport    = require("passport"),
        User        = require("../models/user"),
        Campground  = require("../models/campground"),
        nodemailer  = require("nodemailer"),
        async       = require("async"),
        crypto      = require("crypto"),
        locus       = require("locus"),
        middleware  = require("../middleware");

//show register form
router.get("/register", (req, res)=>{
    res.render("users/register");
});

//handle sign up logic
router.post("/register", (req, res)=>{
    const newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email
    });
    User.register(newUser, req.body.password, (err, user)=>{
        if(err){
            req.flash("error", err.message);
            console.log(err);
            return res.redirect("register");
        }
        passport.authenticate("local")(req, res, ()=>{
            req.flash("success", "Welcome to YelpCamp, " + user.firstName + "! Would you like to finish setting up your <a href='<%= /profile/:user_id/edit%>'>profile</a>?");
            res.redirect("/campgrounds");
        });
    });
});

//show login form
router.get("/login", (req, res)=>{
    res.render("users/login");
})

//handle login logic
router.post("/login", passport.authenticate('local', 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), (req, res)=>{
        
});

//show profile form
router.get("/users/:id", (req, res)=>{
    User.findById(req.params.id, (err, foundUser)=>{
        if(err){
            console.log(err);
            req.flash("error", "There was an error handling your request. Please try again.");
            res.redirect("back");
        }
        Campground.find().where('author.id').equals(foundUser._id).exec((err, campgrounds)=>{
            if(err){
                req.flash("error", "Unable to locate campgrounds.");
                res.redirect("back");
            }
            res.render("users/profile", {user: foundUser, campgrounds: campgrounds});
        });
    });
});

//show profile edit form
router.get("/users/:id/edit", (req, res)=>{
    User.findById(req.params.id, (err, foundUser)=>{
        if(err){
            console.log(err);
            req.flash("error", "There was an error handling your request. Please try again.");
            res.redirect("back");
        }
        
        res.render("users/edit", {user: foundUser});
    });
})

//handle profile edit logic
router.post("/user/:id", passport.authenticate('local', 
    {
        successRedirect: "/profile",
        failureRedirect: "/profile/:id/edit"
    }))
    
//forgot password
router.get("/forgot", (req, res)=>{
    res.render("users/forgot");
})

//forgot logic route
router.post("/forgot", (req, res, next)=>{
    async.waterfall([
        (done)=>{
            crypto.randomBytes(20, (err, buf)=>{
                const token = buf.toString('hex');
                done(err, token);
            });
        },
        (token, done)=>{
            User.findOne({email: req.body.email}, (err, user)=>{
                if(err){
                    console.log(err);
                    req.flash('error', "Error, please try again.");
                    return res.redirect('/forgot');
                }
                if(!user){
                    req.flash('error', "No account with that email was found.");
                    return res.redirect('/forgot');
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 10800000;
                
                user.save((err)=>{
                    done(err, token, user);
                });
            });
        },
        (token, user, done)=>{
            const smtpTransport = nodemailer.createTransport({
                service: "GoDaddy", //send grid, send pulse, gmail
                auth: {
                    user: "emailaddress",
                    pass: process.env.EMAILPW //stored on a .env file for security
                }
            });
            const mailOptions = {
                to: user.email,
                from: "emailedaddress",
                subject: 'Password Reset',
                text: "You are receiving this because you (or someone else) have requested the reset of the password for the account " + req.user.username + ".\n\n" +
                    "Please click on the following link, or past this into your browser to complete the process:\n\n" +
                    "http://" + req.headers.host + "/reset/" + token + "\n\n" +
                    "If you did not request this, please ignore this email and your password will remain unchanged.\n"
            };
            smtpTransport.sendMail(mailOptions, (err)=>{
                if(err){
                    console.log(err);
                    req.flash("error", "There was a problem processing your request. Please try again.");
                    return res.redirect("back");
                }
                console.log('mail sent');
                req.flash("success", "An email has been sent to " + user.email + "with further password reset instructions.");
                done(err, done);
            });
        }
    ],
    (err)=>{
        if(err) return next(err);
        res.redirect("/forgot");
    });
});

//reset token route
router.get('/reset/:token', (req, res)=>{
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now()}}, (err, user)=>{
        if(err){
            console.log(err);
            req.flash("error", "There was an error processing your request. Please try again.");
            return res.redirect("back");
        }
        if(!user) {
            req.flash("error", "Password reset token is invalid or has expired.");
            return res.redirect("/forgot");
        }
        res.render("reset", {token: req.params.token});
    });
});

//reset password logic
router.post("/reset/:token", (req, res, next)=>{
    async.waterfall([
        (done)=>{
            User.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: { $gt: Date.now()}
            }, (err, user)=>{
                if(err){
                    console.log(err);
                    req.flash("error", "There was an error processing your request. Please try again.");
                    return res.redirect("back");
                }
                if(!user){
                    req.flash("error", "Password reset token is invalid or expired.");
                    return res.redirect("back");
                }
                if(req.body.password === req.body.confirm){
                    user.setPassword(req.body.password, (err)=>{
                        if(err){
                            console.log(err);
                            req.flash("error", "There was an error processing your request. Please try again.");
                            return res.redirect("back");
                        }
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;
                        
                        user.save((err)=>{
                            if(err){
                                console.log(err);
                                req.flash("error", "There was an error processing your request. Please try again.");
                                return res.redirect("back");
                            }
                            req.logIn(user, (err)=>{
                                if(err){
                                    console.log(err);
                                    req.flash("error", "There was an error processing your request. Please try again.");
                                    return res.redirect("back");
                                }
                                done(err, user);
                            });
                        });
                    });
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect("back");
                }
            });
        },
        (token, user, done)=>{
            const smtpTransport = nodemailer.createTransport({
                service: "GoDaddy", //send grid, send pulse, gmail
                auth: {
                    user: "emailaddress",
                    pass: process.env.EMAILPW //stored on a .env file for security
                }
            });
            const mailOptions = {
                to: user.email,
                from: "emailaddress",
                subject: 'Your password has been changed',
                text: "Hello,\n\n" +
                    "This is a confirmation that the password for your account " + user.email + " has been changed.\n"
            };
            smtpTransport.sendMail(mailOptions, (err)=>{
                if(err){
                    console.log(err);
                    req.flash("error", "There was a problem processing your request. Please try again.");
                    return res.redirect("back");
                }
                console.log('mail sent');
                req.flash("success", "You have successfully reset your password.");
                done(err, done);
            });
        }
    ],
    (err)=>{
        if(err) return next(err);
        res.redirect("/forgot");
    });
});

//LOGOUT LOGIC ROUTE
router.get("/logout", (req, res)=>{
   req.logout();
   req.flash("success", "Successfully Logged Out")
   res.redirect("/campgrounds");
});

module.exports = router;