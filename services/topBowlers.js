const Delivery =
require("../models/Delivery");

async function topBowlers() {

  const result =
    await Delivery.aggregate([

      {
        $match: {

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
          },

          balls: {
            $sum: 1
          },

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
        $project: {

          player: "$_id",

          wickets: 1,

          economy: {

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
      },

      {
        $sort: {
          wickets: -1
        }
      },

      {
        $limit: 10
      }
    ]);

  return result;
}

module.exports =
topBowlers;