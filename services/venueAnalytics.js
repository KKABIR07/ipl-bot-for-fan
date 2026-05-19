const Delivery =
require("../models/Delivery");


// AVERAGE 1ST INNINGS SCORE

async function averageVenueScore(
  venue
) {

  const result =
    await Delivery.aggregate([

      {
        $lookup: {
          from: "matches",
          localField: "matchId",
          foreignField: "matchId",
          as: "match"
        }
      },

      {
        $unwind: "$match"
      },

      {
        $match: {
          "match.venue": {
            $regex: venue,
            $options: "i"
          },

          inning: "1"
        }
      },

      {
        $group: {

          _id: "$matchId",

          totalRuns: {
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

          avgScore: {
            $avg: "$totalRuns"
          }
        }
      }
    ]);

  return result[0]?.avgScore || 0;
}

module.exports = {
  averageVenueScore
};

const Match =
require("../models/Match");


// CHASING ANALYSIS

async function chasingStats(
  venue
) {

  const matches =
    await Match.find({
      venue: {
        $regex: venue,
        $options: "i"
      }
    });

  let battingFirstWins = 0;
  let chasingWins = 0;

  matches.forEach(match => {

    if (
      match.toss_decision === "bat" &&
      match.toss_winner === match.winner
    ) {
      battingFirstWins++;
    }

    else {
      chasingWins++;
    }
  });

  return {
    battingFirstWins,
    chasingWins
  };
}

async function powerplayScore(
  team
) {

  const result =
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

  return result[0]?.avgPowerplay || 0;
}

async function deathOversScore(
  team
) {

  const result =
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

          avgDeathRuns: {
            $avg: "$runs"
          }
        }
      }
    ]);

  return result[0]?.avgDeathRuns || 0;
}

async function bowlingEconomy(
  team
) {

  const result =
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

  return result[0]?.economy || 0;
}

module.exports = {
  averageVenueScore,
  chasingStats
};