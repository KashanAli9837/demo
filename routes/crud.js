import { Router } from "express";
import multer from "multer";
import fs from "fs/promises";

import User from "../models/users.js";

const crudRouter = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({
  storage,
}).single("image");

crudRouter.get("/", async (req, res) => {
  const users = await User.find({});
  return res.render("home", {
    title: "Home",
    users,
  });
});

crudRouter.get("/add", async (req, res) => {
  return res.render("add-user", {
    title: "Add User",
  });
});

// insert user to DB
crudRouter.post("/add", upload, async (req, res) => {
  const { name, email, phone } = req.body;
  const user = new User({
    name,
    email,
    phone,
    image: req.file.filename,
  });

  await User.create(user)
    .then(() => {
      req.session.message = {
        type: "success",
        message: "User added Successfully!",
      };
    })
    .catch((err) => {
      req.session.message = {
        message: err.message,
        type: "danger",
      };
    });
  res.redirect("/");
});

// edit user page
crudRouter.get("/edit/:id", async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id);
  return res.render("edit-user", {
    title: "Edit User",
    user,
  });
});

// update user
crudRouter.post("/update/:id", upload, async (req, res) => {
  const id = req.params.id;
  let new_img = "";
  const user = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
  };

  if (req?.file?.filename) {
    new_img = req.file.filename;
    await fs.rm("./uploads/" + req.body.old_img);
  } else {
    new_img = req.body.old_img;
  }

  await User.findByIdAndUpdate(id, { ...user, image: new_img })
    .then(() => {
      req.session.message = {
        type: "success",
        message: "User updated Successfully!",
      };
    })
    .catch((err) => {
      req.session.message = {
        message: err.message,
        type: "danger",
      };
    });

  return res.redirect("/");
});

// delete user
crudRouter.get("/delete/:id", async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id);
  await fs.rm("./uploads/" + user.image);
  await User.findByIdAndDelete(id)
    .then(() => {
      req.session.message = {
        type: "success",
        message: "User deleted Successfully!",
      };
    })
    .catch((err) => {
      req.session.message = {
        message: err.message,
        type: "danger",
      };
    });

  res.redirect("/");
});

export default crudRouter;
