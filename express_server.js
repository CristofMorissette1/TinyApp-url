var express = require("express");
var app = express();
var cookieSession = require('cookie-session');
var PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['Cristof'],
  maxAge: 24 * 60 * 60 * 1000 
}))
const urlDatabase = {
  "b2xVn2": {'longURL': "http://www.lighthouselabs.ca", 'user_id': 'userRandomID'},
  "9sm5xK": {'longURL': "http://www.google.com", 'user_id': 'userRandomID'}
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
const userIdFromEmail = function(email1, res) {
  for (var eachUser in users) {
    if(users[eachUser].email === email1) {
      return users[eachUser].id;
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
  res.redirect("/urls");
});

//gets urls and converts it into a json string
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const perURLS = {};
  const currUserId = req.session.user_id;
  const currUser = users[currUserId];
  for(let key in urlDatabase) {
    if (urlDatabase[key].user_id === req.session.user_id) {
    perURLS[key] = urlDatabase[key];
    };
  }

  let templateVars = { 
    urls: urlDatabase, 
    user: currUser,
    newURLS: perURLS
  } 
  console.log(templateVars);
  console.log(req.session.user_id);
  
  
   //const currUser = users[currUserId];
   if (req.session.user_id){
    res.render('urls_index', templateVars);
    } else {
    res.redirect("/login");
    }
  });

app.get("/urls/new", (req, res) => {
  const currUserId = req.session.user_id;
  const currUser = users[currUserId];
  let templateVars = {
    urls: urlDatabase, 
    user: currUser,
  };
  if (req.session.user_id) {
  res.render('urls_news', templateVars)
  } else {
    res.redirect('/login')
  }
  });

  
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['username'];
  res.redirect('/longURL');
});

app.get("/urls/:shortURL", (req, res) => {
  const currUserId = req.session.user_id;
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
   const password = req.body.password;
   const hashedPassword = bcrypt.hashSync(password, 10);
function emailcheck(email1) {
  for (let key in users) {
    if (email1 === users[key].email) {
      return true 
    }
  } 
}

  if (!req.body.email || !req.body.password) {
    res.sendStatus(400);
  }
  // i need to compare the email in my datbase to the email that gets registerd
  else if (!checkEmail(req.body.email) == true) {
    users[userId] = {
      id: userId,
      email: req.body.email,
      password: hashedPassword
    } 

    req.session.user_id = userId 
    res.redirect('/urls');
  } else {
    res.sendStatus(400);
  }
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//generates random string and redirects to root
app.post("/urls", (req, res) => {  
  let cook = req.session.user_id;
  let ranStr = generateRandomString();
  urlDatabase[ranStr] = {
    longURL: req.body.longURL,
    user_id: cook   
  } 
  res.redirect('/urls');
});
//deleting urls
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});
//edit button
app.post("/urls/:shortURL/edit", (req, res) => {
  const currUserId = req.session.user_id;
  const currUser = users[currUserId];
  let templateVars = {
    shortURL: req.params.shortURL,
    user: currUser
  };
  res.render('/urls_show', templateVars);
})


app.post('/urls/:id', (req, res) => {
  const currUserId = req.session.user_id;
  const currUser = users[currUserId];
  let templateVars = {
    urls: urlDatabase,
    user: currUser
  };
  console.log(req.params.id);
urlDatabase[req.params.id].longURL = req.body.newURL;
res.redirect('/urls');
})

app.get('/login', (req, res) => {
   templateVars = {
     user: users[req['user_id']]
     }
  res.render('login');
})

app.post('/login', (req, res) => {
var email = req.body.email;
var password = req.body.password;
let idd = userIdFromEmail(req.body.email)
  if (checkEmail(email) === email && bcrypt.compareSync(password, users[idd].password)) {
  req.session.user_id =  userIdFromEmail(req.body.email);
} else if (checkPassword(password) != password) {
  res.render('login', {error: 'wrong password'});
} else if (checkEmail(email) != email) {
  res.render('login', {error: 'Wrong email'});
}
res.redirect('/urls');
})

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login')
})
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

