const topBatsmen =
require("./topBatsmen");

const topBowlers =
require("./topBowlers");

async function fantasyTeam(
  team1,
  team2
) {

  const batsmen =
    await topBatsmen();

  const bowlers =
    await topBowlers();


  // =========================
  // FILTER PLAYERS
  // =========================

  const topPlayers = [

    ...batsmen.slice(0, 5),

    ...bowlers.slice(0, 5)
  ];


  // =========================
  // PICKS
  // =========================

  return {

    captain:
      topPlayers[0]?.player,

    viceCaptain:
      topPlayers[1]?.player,

    safePicks:
      topPlayers
        .slice(2, 5)
        .map(p => p.player),

    differentialPicks:
      topPlayers
        .slice(5, 8)
        .map(p => p.player)
  };
}

module.exports =
fantasyTeam;