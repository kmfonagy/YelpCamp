const mongoose = require("mongoose"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment");

const data = [
    {
        name: "Buckeye Lake",
        image: "https://koa.com/content/campgrounds/buckeye-lake/photos/35101_42.jpg.axd?preset=coverphoto3",
        description: "Come and relax in our park-like setting with lots of trees and open space. We are an easy on and off from Interstate 70 (1.5 miles from interstate), but we don't have highway noise. Enjoy our long, level shady pull-through sites, ideal for big rigs or smaller campers. We have fifteen cozy, sleeping Camping Cabins or Four full-service Deluxe Cabins complete with kitchen and bathroom waiting for you and your family. If you prefer being out with nature, we have a large, shaded primitive tent area.",
    },
    {
        name: "Jackson Lake",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXclHwo4QbEsVoGUgVSS4xDOieX186CYpb59lxtIM7jRvBEBZIaw",
        description: "We Provide an Opportunity to Remember How to PLAY. We've been around since 1959 because kids do not remember their best day of television. We are a 64 acre campground and event center located 14 miles southeast of downtown Columbus, Ohio. We are close to home, yet far from City Life! Whether you are into roughin' it, cabins, or just want to play for the day we are the ultimate central Ohio camping & adventure destination. Splash around & try the obstacles in our Aqua Park, new for 2017. ",
    },
    {
        name: "Foxfire",
        image: "http://foxfirecamping.com/wp-content/uploads/2017/06/DSC_1259.jpg",
        description: "Foxfire Campground has been family owned for over 10 years. Jake, Joni and their 2 sons: Sean and Ryan have owned and managed the campground since 2014. They strive to offer a safe and fun environment for the entire family.",
    }
]
    
function seedDB(){
    //Remove all campgrounds
    Campground.deleteMany({}, (err)=>{
        if(err){
            console.log(err);
        } else {
            console.log('removed campgrounds');
            //Add a few campgrounds
            data.forEach((seed)=>{
                Campground.create(seed, (err, campground)=>{
                    if(err){
                        console.log(err);
                    } else {
                        console.log("added a campground");
                        //Add a few comments
                        Comment.create(
                            {
                                text: "This place is great, but I wish they had internet",
                                author: "Me"
                            }, (err, comment)=>{
                              if(err){
                                  console.log(err);
                              } else {
                                  campground.comments.push(comment);
                                  campground.save();
                                  console.log("created new comment");
                              }
                            });
                    }
                });
            });
        }
    });
}

module.exports = seedDB;