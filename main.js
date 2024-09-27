// third party modules
import express from "express";
import mongoose from "mongoose";
import session from "express-session";

// env setup
import dotevn from "dotenv";
dotevn.config();

// local modules
import crudRouter from "./routes/crud.js";

// DB connection
mongoose
  .connect(process.env.DB_URL, { useBigInt64: true })
  .then(() => console.log("DB connected"))
  .catch(() => console.log("DB could not connect"));

// varaibles
const app = express();
const PORT = 3000;

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static("./uploads"));

app.use(
  session({
    secret: "My Secret Key",
    saveUninitialized: true,
    resave: false,
  })
);

app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

// routes
app.use(crudRouter);

// connect to PORT
app.listen(PORT, (err) => {
  if (err) {
    console.log(`app could not run on PORT ${PORT}`);
  } else {
    console.log(`app is running on PORT ${PORT}`);
  }
});
