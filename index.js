const express = require("express");
const app = express();
const path = require("path");
const cors = require('cors');
const corsOptions = require('./config/corsOptions');

// Redis
const redis = require('./helpers/redis');

// Middlewares
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const verifyJWT = require('./middleware/verifyJWT');
const credentials = require('./middleware/credentials');

// loggger
app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

//  Cross Origin Resource Sharing
app.use(cors(corsOptions));


// built-in middleware for json 
app.use(express.json());

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

app.set("view engine","ejs");
app.set('views','./src/views');
app.use("/static", express.static(path.join(__dirname, "../public")));

// Route
const authRoutes = require("./routes/auth");
const memberRoutes = require("./routes/member");
const schoolRoutes = require("./routes/schools");

// run routes
app.get("/", async(_,res) => {
    return res.status(200).render("home.ejs")
});

app.use("/oauth", authRoutes);

// Token olmadan erişilmeyecek routeler
app.use(verifyJWT);
app.use("/account", memberRoutes);
app.use("/school", schoolRoutes);

// use error handler
app.use(errorHandler);

const PORT = 8080;
const startup = async () => {
    try {
        await redis.RedisClient.connect();
    }
    catch(err){
        console.error(err)
    }
   
    app.listen(PORT, () => {
        console.log('started at ' + PORT)
    });
}
startup();
 
