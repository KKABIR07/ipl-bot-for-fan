const Match =
require("../models/Match");

async function getHeadToHead(
  team1,
  team2
) {

  const matches = await Match.find({
    $or: [
      { team1, team2 },
      { team1: team2, team2: team1 }
    ]
  });

  let t1Wins = 0;
  let t2Wins = 0;

  matches.forEach(match => {

    if (match.winner === team1)
      t1Wins++;

    if (match.winner === team2)
      t2Wins++;
  });

  return {
    totalMatches: matches.length,
    team1Wins: t1Wins,
    team2Wins: t2Wins
  };
}


// RECENT FORM

async function getRecentForm(team) {

  const recentMatches =
    await Match.find({
      $or: [
        { team1: team },
        { team2: team }
      ]
    })
    .sort({ date: -1 })
    .limit(5);

  let wins = 0;

  recentMatches.forEach(match => {

    if (match.winner === team)
      wins++;
  });

  return {
    matches: recentMatches.length,
    wins
  };
}

module.exports = {
  getHeadToHead,
  getRecentForm
};