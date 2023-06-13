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
    INSERT INTO cricket_team(player_name, jersey_number, role)
    VALUES(
        '${playerName}',
        ${jerseyNumber},
        '${role}'

    );
    `;
  const dbResponse = await db.run(playerQuery);
  response.send("Player Added to Team");
});

//to get the particular player details

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
    SELECT *
    FROM cricket_team
    WHERE player_id=${playerId};
    `;
  const dbResponse = await db.get(playerQuery);
  response.send(convertDbObjectToResponseObject(dbResponse));
});

//update

app.put("/players/:playerId/", async (request, response) => {
  const playerId = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const playerQuery = `UPDATE cricket_team
    SET player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${role}';
    `;
  await db.run(playerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    SELECT *
    FROM cricket_team
    WHERE player_id=${playerId};
    `;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
