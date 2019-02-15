var express = require("express");
var app = express();
var cookieParser = require('cookie-parser');
var PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(cookieParser());
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Generates random string
function generateRandomString() {
 return Math.random().toString(36).substr(2, 6);
}

//parses the body to be readable
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//getting root directory
app.get("/", (req, res) => {
  res.send("Hello!");
});

//gets urls and converts it into a json string
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase, 
    username: req.cookies['username'] 
  }
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    urls: urlDatabase, 
    username: req.cookies['username']
  };
  res.render("urls_news", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['username'];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies['username']
  };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//generates random string and redirects to root
app.post("/urls", (req, res) => {
  console.log(req.body);  
  let ranStr = generateRandomString();
  urlDatabase[ranStr] = req.body.longURL;    
  res.redirect('/urls');
  console.log(urlDatabase);
});
//deleting urls
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});
//edit button
app.post("/urls/:shortURL/edit", (req, res) => {
let templateVars = {
  shortURL: req.params.shortURL, 
  username: req.cookies['username']};
  res.render('urls_show', templateVars);
})


app.post('/urls/:id', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies['username']
  };
urlDatabase[req.params.id] = req.body.newURL;
res.render('urls_index', templateVars);
})

app.post('/login', (req, res) => {
res.cookie('username', req.body.username);
res.redirect('/urls');
})

app.post('/logout', (req, res) => {
  res.cookie('username', req.body.username);
  res.clearCookie('username');
  res.redirect('/urls')
})
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

