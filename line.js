
let app = require('express')();
let port = process.env.PORT || 3000;
let bodyParser = require('body-parser'); 
let session = require('express-session');
let cookieParser = require('cookie-parser');
let passport = require('passport');
let LineStrategy = require('passport-line').Strategy;
let channelID = '1600858396';
let channelSecret = '8785b37ed4ae13d8468e48bbaf2799d8';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser())
app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj)
});
passport.use(new LineStrategy({
      channelID: channelID,
      channelSecret: channelSecret,
      callbackURL: "http://localhost:3000/auth/line/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      done(null, profile)
    }
));

app.get('/', (req, res) => {
    res.send('please login')
});
app.get('/auth/line', passport.authenticate('line'), function(req, res){
});
app.get('/auth/line/callback', passport.authenticate('line', { successRedirect: '/profile', failureRedirect: '/' }))

app.get('/profile', (req, res) => {
    req.session.user = req.user;
    console.log(req.user)
    res.send(req.user)
});
app.get('/logout', (req, res) => {
  req.logout();
  req.session.user = null;
  res.redirect('/');
});

app.all("*", executeApi);

function executeApi(req, res, next) {
    if(req.session.user){
        switch (req.method) {
            case "GET":
                execGet(req, res, next);
                break;
            case "POST":
                execPost(req, res, next);
                break;
        }
    }
    else
        res.send('please login')
}

function execGet(req, res, next) {
    let params = req.params[0].split('/');
    if (params.length < 3)
        res.send({ code: 530, status: "error", message: "Invalid parameters!" });
    else {
        let obj = require("./" + params[1] + '/' + params[2]);
        obj = new obj(app);
        let func = obj[params[3]];
        let inputs = req.query;
        func(inputs, function (result) {
            let rs = {};
            if (result) {
                rs = result;
            }
            res.send(rs);
        });
    }
}

function execPost(req, res, next) {
    let params = req.params[0].split('/');
    if (params.length < 3)
        res.send({ code: 530, status: "error", message: "Invalid parameters!" });
    else {
        let obj = require("./" + params[1] + '/' + params[2]);
        obj = new obj(app);
        let func = obj[params[3]];
        let re = req.body;
        func(re, function (result) {
            let rs = {};
            if (result) {
                rs = result;
            }
            res.send(rs);
        });
    }
}

app.listen(port, function () {
    console.log('Starting node.js on port ' + port);
});










