const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/", async (request, response) => {
  const moviesQuery = `select movie_name from movie;`;
  const movieArray = await database.all(moviesQuery);
  response.send(
    movieArray.map((eachName) => convertDbObjectToResponseObject(eachName))
  );
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const moviedetails = `select *from movie where movie_id=${movieId};`;
  const details = await database.get(moviedetails);
  response.send(convertDbObjectToResponseObject(details));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updatemoviedetails = `update movie set movie_name ='${movieName}',
    director_id=${directorId},lead_actor='${leadActor}'
    where movie_id=${movieId}; `;
  await database.run(updatemoviedetails);
  response.send("Movie Details Updated");
});

app.get("/movies/", async (request, response) => {
  const { movieId } = request.params;
  const getQuery = `select * from movie where movie_id=${movieId};`;
  const moviedet = await database.get(getQuery);
  response.send(convertDbObjectToResponseObject(moviedet));
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;

  const postquery = `insert into movie{movie_id auto_increment,director_id,movie_name,lead_actor} values ('${directorId}',${movieName},'${leadActor}');`;
  const deatils = await database.run(postquery);
  response.send("Movie Successfully Added");
});
module.exports = app;
