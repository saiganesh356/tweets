const exe = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const bcrypt = require("bcrypt");
const app = exe();
const jwt = require("jsonwebtoken");
app.use(exe.json());
const db_path = path.join(__dirname, "twitterClone.db");
let db = null;
const connectionServer = async () => {
  try {
    db = await open({
      filename: db_path,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server has started");
    });
  } catch (e) {
    console.log(e.message);
  }
};
connectionServer();

//authorization Check

const authorization = async (request, response, next) => {
  let token;
  let header = request.headers["authorization"];
  if (header !== undefined) {
    token = header.split(" ")[1];
    jwt.verify(token, async (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        next();
      }
    });
  } else {
    response.status(401);
    response.send("Invalid JWT Token");
  }
};

// API 1

app.post("/register/", async (request, response) => {
  const { username, password, name, gender } = request.body;
  let query = `
  SELECT 
  *
  FROM 
  user
  WHERE
  username='${username}';`;
  let result = await db.get(query);
  if (result !== undefined) {
    response.status(400);
    response.send("User already exists");
  } else {
    if (password.length < 6) {
      response.status(400);
      response.send("Password is too short");
    } else {
      let password_hash = await bcrypt.hash(password, 10);
      console.log(password_hash);
      let query = `
      INSERT INTO user 
      (name,username,password,gender)
      VALUES(
          '${name}',
          '${username}',
          '${password_hash}',
          '${gender}' );`;
      await db.run(query);
      response.status(200);
      response.send("User created successfully");
    }
  }
});

//API 2 login
app.post("/login/", authorization, async (request, response) => {
  const { username, password } = request.body;
  let query = `
  SELECT 
  *
  FROM 
  user
  WHERE
  username='${username}';`;
  let user_details = await db.get(query);
  if (user_details !== undefined) {
    let verification = await bcrypt.compare(password, user_details.password);
    if (verification === false) {
      response.status(400);
      response.send("Invalid password");
    } else {
      let payload = {
        username: user_details.username,
      };
      let jwttoken = jwt.sign(payload, "sec_key");
      response.status(200);
      response.send({
        jwtToken: `${jwttoken}`,
      });
    }
  } else {
    response.status(400);
    response.send("Invalid user");
  }
});

//API 3

app.get("/user/tweets/feed/", authorization, async (request, response) => {
  let query = `
    SELECT 
    user.name as name,
    tweet.tweet AS tweet,
    tweet.date_time AS date
    FROM 
    user naturl
    `;
});
