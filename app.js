const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors");
app.use(cors());
const bcrypt = require("bcryptjs");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
const BookModel = require('./library');
const Borrow = require('./borrowdb');

const jwt = require("jsonwebtoken");
var nodemailer = require("nodemailer");

const JWT_SECRET =
  "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe";



//connect to MongoDB Atlas Here:


const PORT = process.env.PORT || 3000;

mongoose.set('strictQuery', false);
const connectDB = async ()=> {
  try{
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error){
    console.log(error);
    process.exit(1);
  }
}




require("./userDetails");
require("./library");
require("./imageDetails");

const User = mongoose.model("UserInfo");
const Images = mongoose.model("ImageDetails");
app.post("/register", async (req, res) => {
  const { fname, lname, email, password, userType, college} = req.body;

  const encryptedPassword = await bcrypt.hash(password, 10);
  try {
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.json({ error: "User Exists" });
    }
    await User.create({
      fname,
      lname,
      email,
      password: encryptedPassword,
      userType,
      college
    });
    res.send({ status: "ok" });
  } catch (error) {
    res.send({ status: "error" });
  }
});

app.post('/borrow-create', (req, res) => {
  Borrow.create(req.body)
  .then(user => res.json(user))
  .catch(err => res.json(err))
})

//about book directory
app.get('/books', (req, res) => {
  BookModel.find()
    .then(Books => {
      console.log(Books); // Log fetched books
      res.json(Books);
    })
    .catch(err => res.json(err))
})

app.get('/getborrow-books', (req, res) => {
  Borrow.find()
    .then(Books => {
      console.log(Books); // Log fetched borrow books
      res.json(Books);
    })
    .catch(err => res.json(err))
})

app.put('/update/:id', (req, res) => {  //update books
  const id = req.params.id;
  BookModel.findByIdAndUpdate({_id: id}, {
    BookName: req.body.BookName,
    Author: req.body.Author,
    YearPublished: req.body.YearPublished, 
    Publisher: req.body.Publisher,
    Genre: req.body.Genre
  }).then (user => res.json(user))
    .catch(err => res.json(err))
})

app.put('/update-borrowbooks/:id', (req, res) => {  //update borrowed books
  const id = req.params.id;
  Borrow.findByIdAndUpdate({_id: id}, {
    BookName: req.body.BookName,
    Genre: req.body.YearPublished, 
    Name: req.body.Name,
    College: req.body.College
  }).then (user => res.json(user))
    .catch(err => res.json(err))
})

app.get('/get/:id', (req, res) => { //get books by id
  const id = req.params.id
  BookModel.findById({_id: id})
  .then(Books => res.json(Books))
  .catch(err => res.json(err))
})

app.get('/getborrow-books/:id', (req, res) => { //get books by id
  const id = req.params.id
  Borrow.findById({_id: id})
  .then(Books => res.json(Books))
  .catch(err => res.json(err))
})

app.put('/updateuser/:id', (req, res) => {  //update books
  const id = req.params.id;
  User.findByIdAndUpdate({_id: id}, {
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email, 
    college: req.body.college, 
  }).then (user => res.json(user))
    .catch(err => res.json(err))
})


app.get('/getusers/:id', (req, res) => { //get books by id on user/admin
  const id = req.params.id
  User.findById({_id: id})
  .then(Books => res.json(Books))
  .catch(err => res.json(err))
})

app.post('/create-book', (req, res) => {
  BookModel.create(req.body)
  .then(user => res.json(user))
  .catch(err => res.json(err))
})



app.delete('/deletebook/:id',(req, res) =>{
  const id = req.params.id;
 BookModel.findByIdAndDelete({_id: id})
  .then(response => res.json(response))
  .catch(err => res.json(err))
})

app.delete('/delete-borrowbook/:id',(req, res) =>{
  const id = req.params.id;
 Borrow.findByIdAndDelete({_id: id})
  .then(response => res.json(response))
  .catch(err => res.json(err))
})

app.get('/admins-list', (req, res) => {
  User.find({ userType: 'Admin' })
    .then(Users => {
      console.log(Users); // Log fetched Admins
      res.json(Users);
    })
    .catch(err => res.json(err))
})

app.get('/admins-list', (req, res) => {
  User.find({ userType: 'Admin' })
    .then(Users => {
      console.log(Users); // Log fetched Admins
      res.json(Users);
    })
    .catch(err => res.json(err))
})

app.delete('/deleteuser/:id',(req, res) =>{
  const id = req.params.id;
  User.findByIdAndDelete({_id: id}) //Delete either User or Admin...
  .then(response => res.json(response))
  .catch(err => res.json(err))
})

app.get('/users-list', (req, res) => {
  User.find({ userType: 'User' })
    .then(Users => {
      console.log(Users); // Log fetched Users
      res.json(Users);
    })
    .catch(err => res.json(err))
})

app.get('/users-list', (req, res) => {
  User.find({ userType: 'Admin' })
    .then(Users => {
      console.log(Users); // Log fetched books
      res.json(Users);
    })
    .catch(err => res.json(err))
})


app.post("/login-user", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ error: "User Not found" });
  }
  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ email: user.email }, JWT_SECRET, {
      expiresIn: "15m",
    });

    if (res.status(201)) {
      return res.json({ status: "ok", data: token });
    } else {
      return res.json({ error: "error" });
    }
  }
  res.json({ status: "error", error: "InvAlid Password" });
});

app.post("/userData", async (req, res) => {
  const { token } = req.body;
  try {
    const user = jwt.verify(token, JWT_SECRET, (err, res) => {
      if (err) {
        return "token expired";
      }
      return res;
    });
    console.log(user);
    if (user == "token expired") {
      return res.send({ status: "error", data: "token expired" });
    }

    const useremail = user.email;
    User.findOne({ email: useremail })
      .then((data) => {
        res.send({ status: "ok", data: data });
      })
      .catch((error) => {
        res.send({ status: "error", data: error });
      });
  } catch (error) { }
});



app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const oldUser = await User.findOne({ email });
    if (!oldUser) {
      return res.json({ status: "User Not Exists!!" });
    }
    const secret = JWT_SECRET + oldUser.password;
    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, {
      expiresIn: "5m",
    });
    const link = `http://localhost:5000/reset-password/${oldUser._id}/${token}`;
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ambotnimo@gmail.com",
        pass: "rmdklolcsmswvyfw",
      },
    });

    var mailOptions = {
      from: "youremail@gmail.com",
      to: "aranomichael6@gmail.com",
      subject: "Password Reset",
      text: link,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    console.log(link);
  } catch (error) { }
});

app.get("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  console.log(req.params);
  const oldUser = await User.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  const secret = JWT_SECRET + oldUser.password;
  try {
    const verify = jwt.verify(token, secret);
    res.render("index", { email: verify.email, status: "Not Verified" });
  } catch (error) {
    console.log(error);
    res.send("Not Verified");
  }
});

app.post("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  const oldUser = await User.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  const secret = JWT_SECRET + oldUser.password;
  try {
    const verify = jwt.verify(token, secret);
    const encryptedPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          password: encryptedPassword,
        },
      }
    );

    res.render("index", { email: verify.email, status: "verified" });
  } catch (error) {
    console.log(error);
    res.json({ status: "Something Went Wrong" });
  }
});

app.get("/getAllUser", async (req, res) => {
  try {
    const allUser = await User.find({});
    res.send({ status: "ok", data: allUser });
  } catch (error) {
    console.log(error);
  }
});

app.post("/deleteUser", async (req, res) => {
  const { userid } = req.body;
  try {
    User.deleteOne({ _id: userid }, function (err, res) {
      console.log(err);
    });
    res.send({ status: "Ok", data: "Deleted" });
  } catch (error) {
    console.log(error);
  }
});


app.post("/upload-image", async (req, res) => {
  const { base64 } = req.body;
  try {
    await Images.create({ image: base64 });
    res.send({ Status: "ok" })

  } catch (error) {
    res.send({ Status: "error", data: error });

  }
})

app.get("/get-image", async (req, res) => {
  try {
    await Images.find({}).then(data => {
      res.send({ status: "ok", data: data })
    })

  } catch (error) {

  }
})



app.get("/paginatedUsers", async (req, res) => {
  const allUser = await BookModel.find({});
  const page = parseInt(req.query.page)
  const limit = parseInt(req.query.limit)

  const startIndex = (page - 1) * limit
  const lastIndex = (page) * limit

  const results = {}
  results.totalUser=allUser.length;
  results.pageCount=Math.ceil(allUser.length/limit);

  if (lastIndex < allUser.length) {
    results.next = {
      page: page + 1,
    }
  }
  if (startIndex > 0) {
    results.prev = {
      page: page - 1,
    }
  }
  results.result = allUser.slice(startIndex, lastIndex);
  res.json(results)
})

app.get("/paginatedUsers1", async (req, res) => {
  const allUser = await Borrow.find({});
  const page = parseInt(req.query.page)
  const limit = parseInt(req.query.limit)

  const startIndex = (page - 1) * limit
  const lastIndex = (page) * limit

  const results = {}
  results.totalUser=allUser.length;
  results.pageCount=Math.ceil(allUser.length/limit);

  if (lastIndex < allUser.length) {
    results.next = {
      page: page + 1,
    }
  }
  if (startIndex > 0) {
    results.prev = {
      page: page - 1,
    }
  }
  results.result = allUser.slice(startIndex, lastIndex);
  res.json(results)
})





/*WebTrafficChart: */


app.get('/getCollegeCASS', (req, res) => {
  Borrow.find({College: 'CASS' })
    .then(Users => {
      console.log(Users); // Log fetched Users
      res.json(Users);
    })
    .catch(err => res.json(err))
})


app.get('/getCollegeCCS', (req, res) => {
  Borrow.find({College: 'CCS' })
    .then(Users1 => {
      console.log(Users1); // Log fetched Users
      res.json(Users1);
    })
    .catch(err => res.json(err))
})



app.get('/getCollegeCEBA', (req, res) => {
  Borrow.find({College: 'CEBA' })
    .then(Users2 => {
      console.log(Users2); // Log fetched Users
      res.json(Users2);
    })
    .catch(err => res.json(err))
})


app.get('/getCollegeCED', (req, res) => {
  Borrow.find({College: 'CED' })
    .then(Users3 => {
      console.log(Users3); // Log fetched Users
      res.json(Users3);
    })
    .catch(err => res.json(err))
})

app.get('/getCollegeCOE', (req, res) => {
  Borrow.find({College: 'COE' })
    .then(Users4 => {
      console.log(Users4); // Log fetched Users
      res.json(Users4);
    })
    .catch(err => res.json(err))
})

app.get('/getCollegeCON', (req, res) => {
  Borrow.find({College: 'CON' })
    .then(Users5 => {
      console.log(Users5); // Log fetched Users
      res.json(Users5);
    })
    .catch(err => res.json(err))
})

app.get('/getCollegeCSM', (req, res) => {
  Borrow.find({College: 'CSM' })
    .then(Users6 => {
      console.log(Users6); // Log fetched Users
      res.json(Users6);
    })
    .catch(err => res.json(err))
})


      /*BudgetChart: */
      /* 1- Reference */
      /* 2- Fiction */
      /* 3- Non-fiction */

      
      /*CASS: */

app.get('/getCollegeCASS1', (req, res) => {
  Borrow.find({ $and: [{ College: 'CASS' }, { Genre: 'Reference' }] })
          .then(cass1 => {
            console.log(cass1); // Log fetched Users
            res.json(cass1);
          })
          .catch(err => res.json(err))
      })

      app.get('/getCollegeCASS2', (req, res) => {
        Borrow.find({ $and: [{ College: 'CASS' }, { Genre: 'Fiction' }] })
          .then(cass2 => {
            console.log(cass2); // Log fetched Users
            res.json(cass2);
          })
          .catch(err => res.json(err))
      })

      app.get('/getCollegeCASS3', (req, res) => {
        Borrow.find({ $and: [{ College: 'CASS' }, { Genre: 'Non-Fiction' }] })
          .then(cass3 => {
            console.log(cass3); // Log fetched Users
            res.json(cass3);
          })
          .catch(err => res.json(err))
      })




           /*CCS: */

 app.get('/getCollegeCCS1', (req, res) => {
  Borrow.find({ $and: [{ College: 'CCS' }, { Genre: 'Reference' }] })
          .then(ccs1 => {
            console.log(ccs1); // Log fetched Users
            res.json(ccs1);
          })
          .catch(err => res.json(err))
      })

      app.get('/getCollegeCCS2', (req, res) => {
        Borrow.find({ $and: [{ College: 'CCS' }, { Genre: 'Fiction' }] })
          .then(ccs2 => {
            console.log(ccs2); // Log fetched Users
            res.json(ccs2);
          })
          .catch(err => res.json(err))
      })

      app.get('/getCollegeCCS3', (req, res) => {
        Borrow.find({ $and: [{ College: 'CCS' }, { Genre: 'Non-Fiction' }] })
          .then(ccs3 => {
            console.log(ccs3); // Log fetched Users
            res.json(ccs3);
          })
          .catch(err => res.json(err))
      })



           /*CEBA: */

 app.get('/getCollegeCEBA1', (req, res) => {
  Borrow.find({ $and: [{ College: 'CEBA' }, { Genre: 'Reference' }] })
          .then(ceba1 => {
            console.log(ceba1); // Log fetched Users
            res.json(ceba1);
          })
          .catch(err => res.json(err))
      })

      app.get('/getCollegeCEBA2', (req, res) => {
        Borrow.find({ $and: [{ College: 'CEBA' }, { Genre: 'Fiction' }] })
          .then(ceba2 => {
            console.log(ceba2); // Log fetched Users
            res.json(ceba2);
          })
          .catch(err => res.json(err))
      })

      app.get('/getCollegeCEBA3', (req, res) => {
        Borrow.find({ $and: [{ College: 'CEBA' }, { Genre: 'Non-Fiction' }] })
          .then(ceba3 => {
            console.log(ceba3); // Log fetched Users
            res.json(ceba3);
          })
          .catch(err => res.json(err))
      })



                      /*CED: */

      app.get('/getCollegeCED1', (req, res) => {
        Borrow.find({ $and: [{ College: 'CED' }, { Genre: 'Reference' }] })
                .then(ced1 => {
                  console.log(ced1); // Log fetched Users
                  res.json(ced1);
                })
                .catch(err => res.json(err))
            })

            app.get('/getCollegeCED2', (req, res) => {
              Borrow.find({ $and: [{ College: 'CED' }, { Genre: 'Fiction' }] })
                .then(ced2 => {
                  console.log(ced2); // Log fetched Users
                  res.json(ced2);
                })
                .catch(err => res.json(err))
            })

            app.get('/getCollegeCED3', (req, res) => {
              Borrow.find({ $and: [{ College: 'CED' }, { Genre: 'Non-Fiction' }] })
                .then(ced3 => {
                  console.log(ced3); // Log fetched Users
                  res.json(ced3);
                })
                .catch(err => res.json(err))
            })


            
                      /*COE: */

      app.get('/getCollegeCOE1', (req, res) => {
        Borrow.find({ $and: [{ College: 'COE' }, { Genre: 'Reference' }] })
                .then(coe1 => {
                  console.log(coe1); // Log fetched Users
                  res.json(coe1);
                })
                .catch(err => res.json(err))
            })

            app.get('/getCollegeCOE2', (req, res) => {
              Borrow.find({ $and: [{ College: 'COE' }, { Genre: 'Fiction' }] })
                .then(coe2 => {
                  console.log(coe2); // Log fetched Users
                  res.json(coe2);
                })
                .catch(err => res.json(err))
            })

            app.get('/getCollegeCOE3', (req, res) => {
              Borrow.find({ $and: [{ College: 'COE' }, { Genre: 'Non-Fiction' }] })
                .then(coe3 => {
                  console.log(coe3); // Log fetched Users
                  res.json(coe3);
                })
                .catch(err => res.json(err))
            })


                                  /*CON: */

      app.get('/getCollegeCON1', (req, res) => {
        Borrow.find({ $and: [{ College: 'CON' }, { Genre: 'Reference' }] })
                .then(con1 => {
                  console.log(con1); // Log fetched Users
                  res.json(con1);
                })
                .catch(err => res.json(err))
            })

            app.get('/getCollegeCON2', (req, res) => {
              Borrow.find({ $and: [{ College: 'CON' }, { Genre: 'Fiction' }] })
                .then(con2 => {
                  console.log(con2); // Log fetched Users
                  res.json(con2);
                })
                .catch(err => res.json(err))
            })

            app.get('/getCollegeCON3', (req, res) => {
              Borrow.find({ $and: [{ College: 'CON' }, { Genre: 'Non-Fiction' }] })
                .then(con3 => {
                  console.log(con3); // Log fetched Users
                  res.json(con3);
                })
                .catch(err => res.json(err))
            })


            
                                  /*CSM: */

      app.get('/getCollegeCSM1', (req, res) => {
        Borrow.find({ $and: [{ College: 'CSM' }, { Genre: 'Reference' }] })
                .then(csm1 => {
                  console.log(csm1); // Log fetched Users
                  res.json(csm1);
                })
                .catch(err => res.json(err))
            })

            app.get('/getCollegeCSM2', (req, res) => {
              Borrow.find({ $and: [{ College: 'CSM' }, { Genre: 'Fiction' }] })
                .then(csm2 => {
                  console.log(csm2); // Log fetched Users
                  res.json(csm2);
                })
                .catch(err => res.json(err))
            })

            app.get('/getCollegeCSM3', (req, res) => {
              Borrow.find({ $and: [{ College: 'CSM' }, { Genre: 'Non-Fiction' }] })
                .then(csm3 => {
                  console.log(csm3); // Log fetched Users
                  res.json(csm3);
                })
                .catch(err => res.json(err))
            })

      

           // Modify your backend code to aggregate data for the report chart

// Add this endpoint to get aggregated data for the report chart
app.get('/getReportData', async (req, res) => {
  try {
    const referenceData = await Borrow.aggregate([
      { $match: { Genre: 'Reference' } },
      { $group: { _id: "$timestamp", count: { $sum: 1 } } }
    ]);

    const fictionData = await Borrow.aggregate([
      { $match: { Genre: 'Fiction' } },
      { $group: { _id: "$timestamp", count: { $sum: 1 } } }
    ]);

    const nonFictionData = await Borrow.aggregate([
      { $match: { Genre: 'Non-Fiction' } },
      { $group: { _id: "$timestamp", count: { $sum: 1 } } }
    ]);

    res.json({ referenceData, fictionData, nonFictionData });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
