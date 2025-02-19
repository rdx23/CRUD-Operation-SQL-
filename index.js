const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const express = require("express");
const path = require("path");
const methodOverride = require("method-override");

const app = express();
const { v4: uuidv4 } = require("uuid");
// Middleware setup
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

// Configure view engine and views path
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// Create connection pool for database
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "RD_app",
  password: "Rahul2002",
});

// Generate random user data
const getRandomUser = () => [
  faker.datatype.uuid(),
  faker.internet.username(),
  faker.internet.email(),
  faker.internet.password(),
];



// Route to fetch and display the user count
app.get("/", (req, res) => {
  const q = `SELECT count(*) AS total FROM user`;

  pool.query(q, (err, result) => {
    if (err) {
      console.error("Error in database query:", err.message);
      return res
        .status(500)
        .send("An error occurred while fetching data from the database.");
    }

    const count = result[0].total;
    res.render("index.ejs", { count });
  });
});

// Route to fetch and display all users
app.get("/users", (req, res) => {
  const query = "SELECT * FROM user";
  pool.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).send("Database query error");
    }
    res.render("showUser.ejs", { users: results });
  });
});

// Route to edit a specific user
app.get("/user/:id/edit", (req, res) => {
  const userId = req.params.id;

  const q = `SELECT * FROM user WHERE id = ?`;
  pool.query(q, [userId], (err, result) => {
    if (err) {
      console.error("Error in database query:", err);
      return res.status(500).send("Database error occurred.");
    }

    if (result.length === 0) {
      return res.status(404).send("User not found.");
    }

    res.render("edit.ejs", { user: result[0] });
  });
});

// Route to update a user's details
app.patch("/user/:id", (req, res) => {
  const { id } = req.params;
  const { password: formPass, username: newUsername } = req.body;

  const q = `SELECT * FROM user WHERE id = ?`;

  pool.query(q, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Some error in db");
    }

    if (result.length === 0) {
      return res.status(404).send("User not found");
    }

    const user = result[0];
    if (formPass !== user.password) {
      return res.status(400).send("Wrong Password Enter");
    }

    const q2 = `UPDATE user SET username = ? WHERE id = ?`;
    pool.query(q2, [newUsername, id], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Some error in db");
      }

      res.redirect("/users");
    });
  });
});

app.get("/user/:id/delete", (req, res) => {
  const userId = req.params.id;
  let q = `SELECT * FROM user WHERE id = '${userId}'`;

  pool.query(q, (err, result) => {
    if (err) {
      console.log(err);
      return res.send("Error in database");
    }
    const user = result[0];
    res.render("delete.ejs", { user });
  });
});


app.delete("/user/:id/delete", (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  let q = `SELECT * FROM user WHERE id = '${id}'`;

  pool.query(q, (err, result) => {
    if (err) {
      console.log(err);
      return res.send("Error in database");
    }
    const user = result[0];

    // Check if the email entered matches the user's email
    if (email !== user.email) {
      return res.send("Incorrect email entered");
    }

    // Delete the username if the email is correct
    let deleteQuery = `UPDATE user SET username = NULL WHERE id = '${id}'`;

    pool.query(deleteQuery, (err, result) => {
      if (err) {
        console.log(err);
        return res.send("Error deleting username");
      }
      res.redirect("/users");
    });
  });
});





// Start the server
app.listen(8080, () => {
  console.log("Server is listening successfully on port 8080");
});
