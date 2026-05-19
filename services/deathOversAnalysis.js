const Delivery =
require("../models/Delivery");

async function getDeathOversStats(
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
          },

          wickets: {

            $sum: {

              $cond: [
                {
                  $ne: [
                    "$player_dismissed",
                    ""
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },

      {
        $group: {

          _id: null,

          avgRuns: {
            $avg: "$runs"
          },

          avgWickets: {
            $avg: "$wickets"
          }
        }
      }
    ]);

  return {

    avgRuns:
      result[0]?.avgRuns || 0,

    avgWickets:
      result[0]?.avgWickets || 0
  };
}

module.exports =
getDeathOversStats;