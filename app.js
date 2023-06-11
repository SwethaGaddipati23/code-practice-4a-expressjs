const express = require("express");
const app = express();
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`error is :${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

app.get("/players/", async (request, response) => {
  const playerQuery = `SELECT * FROM cricket_team;`;
  const playersArray = await db.all(playerQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//post
app.use(express.json());
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const playerQuery = `
    INSERT INTO cricket_team
    VALUES(
        '${playerName}',
        ${jerseyNumber},
        '${role}'

    );
    `;
  await db.run(playerQuery);
  response.send("Player Added to Team");
});
