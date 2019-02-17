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

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"     //users['userId'][email] ===
  }
}

const checkEmail = function(email, res) {
  for (var eachUser in users) {
    if(users[eachUser].email === email) {
      return users[eachUser].email;
    }
  }
}

const checkPassword = function(password) {
  for (var eachUser in users) {
    if(users[eachUser].password === password) {
      return users[eachUser].password;
    }
  }
}
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
  // const currUserId = req.cookies['user_id'];
  // const currUser = users[currUserId];
  let templateVars = { 
    urls: urlDatabase, 
    user: req.cookies['user_id']
  }
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const currUserId = req.cookies['user_id'];
  const currUser = users[currUserId];
  let templateVars = {
    urls: urlDatabase, 
    user: currUser
  };
  res.render("urls_news", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['username'];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const currUserId = req.cookies['user_id'];
  const currUser = users[currUserId];
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: currUser
  };
  res.render("urls_show", templateVars);
});

app.get('/registration', (req, res) => {
  res.render('registration');
})

app.post('/registration', (req, res) => {
   const userId = generateRandomString();
  const newUser = {
    id: userId,
    email: req.body.email,
    password: req.body.password
  } 
  if (!req.body.email || !req.body.password) {
    res.sendStatus(400);
  }
  for (let key in users) {
  // i need to compare the email in my datbase to the email that gets registerd
  if (req.body.email === users[key]['email']) {
    res.sendStatus(400);
  }  
  }
  
  users[userId] = newUser;
  res.cookie('user_id', userId); 
  res.redirect('/urls');
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//generates random string and redirects to root
app.post("/urls", (req, res) => {  
  let ranStr = generateRandomString();
  urlDatabase[ranStr] = req.body.longURL;    
  res.redirect('/urls');
});
//deleting urls
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});
//edit button
app.post("/urls/:shortURL/edit", (req, res) => {
  const currUserId = req.cookies['user_id'];
  const currUser = users[currUserId];
  let templateVars = {
    shortURL: req.params.shortURL,
    user: currUser
  };
  res.render('urls_show', templateVars);
})


app.post('/urls/:id', (req, res) => {
  const currUserId = req.cookies['user_id'];
  const currUser = users[currUserId];
  let templateVars = {
    urls: urlDatabase,
    user: currUser
  };
urlDatabase[req.params.id] = req.body.newURL;
res.render('urls_index', templateVars);
})

app.get('/login', (req, res) => {
  // templateVars = {
  //   user: user[req['user_id']]
  //   }
  res.render('login');
})

app.post('/login', (req, res) => {
var email = req.body.email;
var password = req.body.password;
  if (checkEmail(email) === email && checkPassword(password) === password) {
  res.cookie('user_id', password);
} else if (checkPassword(password) != password) {
  res.sendStatus('wrong password');
} else if (checkEmail(email) != email) {
  res.sendStatus('wrong email');
} else {
  res.sendStatus(403);
}
res.redirect('/urls');
})

app.post('/logout', (req, res) => {
  res.cookie('user_id', req.body.users);
  res.clearCookie('user_id');
  console.log(req.body.users)
  res.redirect('/urls')
})
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

