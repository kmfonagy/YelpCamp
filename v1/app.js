//YelpCamp V1

const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const campgrounds = [
        {name: "Buckeye Lake", image: "https://koa.com/content/campgrounds/buckeye-lake/photos/35101_32.jpg.axd?preset=coverphoto3"},
        {name: "Lake Milton", image: "https://images.goodsam.com/trailerlifedirectory/largefeatured/1000x/pho_201131324_01.jpg"},
        {name: "Foxfire", image: "https://media.roverpass.com/pictures/images/000/031/565/full/foxfire-campground-nevada-oh-4.jpg?1487453020"},
        {name: "Indian Creek", image: "https://photos.smugmug.com/RVing-RV-Camp-Ground-Photos/Indian-Creek-Campground-Photos/2006-Indian-Creek-Northern/i-vhs73d9/1/4a82a133/L/indian%20creek%20%2850%29-L.jpg"},
        {name: "Mohican Wilderness", image: "https://thedyrt.imgix.net/photo/129419/media/ohio-mohican-state-park_7ee9278e6d8183147de1181fe2d1744e.jpeg?ixlib=rb-1.1.0"},
        {name: "Whispering Pines", image: "https://media-cdn.tripadvisor.com/media/photo-s/05/6e/10/f5/whispering-pines-campground.jpg"},
        {name: "Wapakoneta", image: "http://www.wapakacf.org/wp-content/uploads/2018/01/4HCampPalmer_Highropes6.jpg"}
    ];

app.get("/", (req, res) => {
    res.render("landing");
});

app.get("/campgrounds", (req, res) => {
    
    
    res.render("campgrounds", {campgrounds: campgrounds});
});

app.post("/campgrounds", (req, res) => {
    //get data from form & add to campgrounds array
    const name = req.body.campName;
    const image = req.body.campImg;
    const newCampground = {name: name, image: image};
    campgrounds.push(newCampground);
    //redirect to campgrounds page
    res.redirect("/campgrounds");
});

app.get("/campgrounds/new", (req, res) => {
    res.render("new.ejs");
});


app.listen(8080, process.env.IP, () => {
    console.log("YelpCamp server has started");
});