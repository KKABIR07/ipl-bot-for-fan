const Delivery =
require("../models/Delivery");


// =============================
// TEAM ANALYTICS
// =============================

async function getTeamAnalysis(
  team
) {

  // =========================
  // TOP BATSMEN
  // =========================

  const batsmen =
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
              $toInt:
"$batsman_runs"
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


  // =========================
  // TOP BOWLERS
  // =========================

  const bowlers =
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


  // =========================
  // POWERPLAY SCORE
  // =========================

  const powerplay =
    await Delivery.aggregate([

      {
        $match: {

          batting_team: team,

          over: {
            $in: [
              "0","1","2",
              "3","4","5"
            ]
          }
        }
      },

      {
        $group: {

          _id: "$matchId",

          runs: {
            $sum: {
              $add: [

                {
                  $toInt:
"$batsman_runs"
                },

                {
                  $toInt:
"$extras"
                }
              ]
            }
          }
        }
      },

      {
        $group: {

          _id: null,

          avgPowerplay: {
            $avg: "$runs"
          }
        }
      }
    ]);


  // =========================
  // DEATH OVERS
  // =========================

  const deathOvers =
    await Delivery.aggregate([

      {
        $match: {

          batting_team: team,

          over: {
            $in: [
              "16",
              "17",
              "18",
              "19"
            ]
          }
        }
      },

      {
        $group: {

          _id: "$matchId",

          runs: {
            $sum: {
              $add: [

                {
                  $toInt:
"$batsman_runs"
                },

                {
                  $toInt:
"$extras"
                }
              ]
            }
          }
        }
      },

      {
        $group: {

          _id: null,

          avgDeath: {
            $avg: "$runs"
          }
        }
      }
    ]);


  // =========================
  // ECONOMY
  // =========================

  const economy =
    await Delivery.aggregate([

      {
        $match: {
          bowling_team: team
        }
      },

      {
        $group: {

          _id: "$matchId",

          runs: {
            $sum: {
              $add: [

                {
                  $toInt:
"$batsman_runs"
                },

                {
                  $toInt:
"$extras"
                }
              ]
            }
          },

          balls: {
            $sum: 1
          }
        }
      },

      {
        $group: {

          _id: null,

          economy: {
            $avg: {

              $multiply: [
                {
                  $divide: [
                    "$runs",
                    "$balls"
                  ]
                },
                6
              ]
            }
          }
        }
      }
    ]);


  return {

    batsmen,

    bowlers,

    powerplay:
      powerplay[0]
        ?.avgPowerplay || 0,

    deathOvers:
      deathOvers[0]
        ?.avgDeath || 0,

    economy:
      economy[0]
        ?.economy || 0
  };
}

module.exports =
getTeamAnalysis;