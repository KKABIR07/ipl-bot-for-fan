const Delivery =
require("../models/Delivery");


// TOP BATSMEN

async function getTopBatsmen(team) {

  const stats =
    await Delivery.aggregate([

      {
        $match: {
          batting_team: team
        }
      },

      {
        $group: {

          _id: "$batsman",

          runs: {
            $sum: {
              $toInt: "$batsman_runs"
            }
          }
        }
      },

      {
        $sort: {
          runs: -1
        }
      },

      {
        $limit: 5
      }
    ]);

  return stats;
}


// TOP BOWLERS

async function getTopBowlers(team) {

  const stats =
    await Delivery.aggregate([

      {
        $match: {
          bowling_team: team,
          player_dismissed: {
            $ne: ""
          }
        }
      },

      {
        $group: {

          _id: "$bowler",

          wickets: {
            $sum: 1
          }
        }
      },

      {
        $sort: {
          wickets: -1
        }
      },

      {
        $limit: 5
      }
    ]);

  return stats;
}

module.exports = {
  getTopBatsmen,
  getTopBowlers
};