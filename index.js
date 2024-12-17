const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path')


// express 기본 설정
const app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());

// Session
app.use(session({
  secret: 'community',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }, 
}));



app.get("/asset/:fileName.:ex", (req, res) => {
  const { fileName, ex } = req.params
  if(["html","css","js"].includes(ex)){ res.sendFile(`${fileName}.${ex}`, { root: path.join(__dirname, `public/${fileName}`) }) }
  else { res.status(404).json({Lee: "Not Found"}) }
})


app.use("/board", require("./public/board/boardRouter.js"));
app.use("/login", require("./public/login/loginRouter.js"));
app.use("/signup", require("./public/signup/signupRouter.js"));


app.get("/logout", (req, res) => {
  req.session.destroy((err) => {});
  Object.keys(req.cookies).forEach(cookie => res.clearCookie(cookie));
  res.redirect("/board")
});


// Redirect
app.use((req, res) => { res.redirect("/board") });

// Run App
app.listen(8080, () => { console.log("http://localhost:8080/") });

module.exports = app