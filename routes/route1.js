const express = require('express');
const passport = require("passport");
const bcrypt = require("bcrypt");
const LinksDB = require("../models/mongooseModel");
const UserDB = require("../models/usersDB");

const route = express.Router();


function getID() {
    return (Math.random() * 1000000).toString(36).substr(0 || Math.random() * 10, 6 || Math.random() * 10).replace(".", "-");
}

//  Add link to dataBase >>>>>
const addLink = async (req) => {
    const inputedLink = req.body.link;
    const foundLink = await LinksDB.findOne({ longURL: inputedLink });
    var rlink = "";
    if (foundLink != null) rlink = foundLink.shortURL;
    else {
        rlink = getID();
        await new LinksDB({
            shortURL: rlink,
            longURL: inputedLink
        }).save();
    }
    if (req.isAuthenticated()) {
        req.user.links.push(rlink);
        req.user.links = [...new Set(req.user.links)].reverse();
        req.user.save();
    }
    return rlink;
}

// Get data table of user
const getUserHistory = async (req) => {
    if (req.isAuthenticated()) {
        const userLinks = req.user.links;
        var returnList = [];
        // Looping
        for (i = 0; i < userLinks.length; i++){
            const linkfound = await LinksDB.findOne({ shortURL: userLinks[i] });
            if (linkfound != null) returnList.push(linkfound);
        }
        return returnList;
    }
    else return [];
}


const getLongLink = async (link) => {
    const longLink = await LinksDB.findOne({ shortURL: link });
    if (longLink != null) return longLink.longURL;
    else return "/";
}


// --------------------------------------------------


// Routes ===========================================

// Login >>>>>>>>
route.get("/login", (req, res) => {
    if (req.isAuthenticated()) res.redirect('.');
    else return res.render("login");
});

route.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
    })
);

route.get("/logout", (req, res) => {
    req.logOut();
    res.redirect("/");
})


// Register >>>>>>>
route.get("/register", (req, res) => {
    if (req.isAuthenticated()) res.redirect('.');
    else return res.render("register");
});

route.post("/register", async (req, res) => {
    const password = await bcrypt.hash(req.body.password, 10);
    new UserDB({
        email: req.body.email,
        password: password,
    }).save();
    res.redirect("/login");
});


// Home Page >>>>>>>
route.get("/", async (req, res) => {
    var shortenedLink = req.cookies.returnLink || null;
    const pastUrls = await getUserHistory(req);
    res.render('home', { link: shortenedLink, pastUrls: pastUrls ,req:req });
});

route.post("/", async (req, res) => {
    const linkcookie = await addLink(req);
    res.cookie('returnLink', linkcookie);
    res.redirect("/");
})


// Forclearing the Field >>>>>>>
route.get('/another', (req, res) => {
    res.clearCookie('returnLink')
    res.redirect("/");
})


// Redirect to page via ShortLink >>>>>>>
route.get("/:shortlink", async (req, res) => {
    const finalLink = await getLongLink(req.params.shortlink);
    res.redirect(finalLink);
})


// --------------------------------------------------


module.exports = route;