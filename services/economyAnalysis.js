const Delivery =
require("../models/Delivery");

async function getEconomyStats(
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

          _id: "$bowler",

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
        $project: {

          bowler: "$_id",

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
          economy: 1
        }
      },

      {
        $limit: 5
      }
    ]);

  return result;
}

module.exports =
getEconomyStats;