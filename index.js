const pg = require("pg");
const express = require("express");
const app = express();
app.use(express.json());
app.use(require("morgan")("dev"));

const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/the_acme_flavors_db"
);

// Express APP
app.get("/api/flavors", async (req, res, next) => {
  try {
    const SQL = `
       SELECT * from flavors;
       `;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    console.log(error);
  }
});

//single flavor
app.get("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `
        SELECT * FROM flavors WHERE id= $1;
        `;
    const response = await client.query(SQL, [req.params.id]);
    res.send(response.rows);
  } catch (error) {
    console.log(error);
  }
});
//post flavor
app.post("/api/flavors", async (req, res, next) => {
  try {
    const SQL = `
        INSERT INTO flavors(name, is_favorite)
        VALUES ($1, $2)
        RETURNING *
        `;
    const response = await client.query(SQL, [
      req.body.name,
      req.body.is_favorite,
    ]);
    res.send(response.rows[0]);
  } catch (error) {
    console.log(error);
  }
});
//delete flavor
app.delete("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `
        DELETE from flavors WHERE id=$1;
        `;
    const response = await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    console.log(error);
  }
});
//update flavor
app.put("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `
        UPDATE flavors
        SET name=$1, is_favorite=$2, updated_at=now()
        WHERE id =$3
        `;
    const response = await client.query(SQL, [
      req.body.name,
      req.body.is_favorite,
      req.params.id,
    ]);
    res.send(response.rows[0]);
  } catch (error) {
    console.log(error);
  }
});

//init function
const init = async () => {
  await client.connect();
  console.log("connected to database");
  let SQL = `DROP TABLE IF EXISTS flavors;
  CREATE TABLE flavors(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
  );`;
  await client.query(SQL);
  console.log("tables created");
  SQL = `   INSERT INTO flavors(name, is_favorite, created_at) VALUES('chocolate', false, now());
  INSERT INTO flavors(name, is_favorite, created_at) VALUES('vanilla', false, now());
  INSERT INTO flavors(name, is_favorite, created_at) VALUES('strawberry', false, now());
  INSERT INTO flavors(name, is_favorite, created_at) VALUES('cookie dough', true, now());
  ;`;
  await client.query(SQL);
  console.log("data seeded");
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();
