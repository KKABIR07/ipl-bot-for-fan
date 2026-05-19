const Delivery =
require("../models/Delivery");

async function getTopBatsmen() {

  const result =
    await Delivery.aggregate([

      {
        $group: {

          _id: "$batsman",

          runs: {
            $sum: {
              $toInt:
"$batsman_runs"
            }
          },

          balls: {
            $sum: 1
          },

          fours: {

            $sum: {

              $cond: [
                {
                  $eq: [
                    "$batsman_runs",
                    "4"
                  ]
                },
                1,
                0
              ]
            }
          },

          sixes: {

            $sum: {

              $cond: [
                {
                  $eq: [
                    "$batsman_runs",
                    "6"
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
        $project: {

          player: "$_id",

          runs: 1,

          strikeRate: {

            $multiply: [
              {
                $divide: [
                  "$runs",
                  "$balls"
                ]
              },
              100
            ]
          },

          fours: 1,

          sixes: 1
        }
      },

      {
        $sort: {
          runs: -1
        }
      },

      {
        $limit: 10
      }
    ]);

  return result;
}

module.exports =
getTopBatsmen;