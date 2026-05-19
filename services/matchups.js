const Delivery =
require("../models/Delivery");

async function batsmanVsBowler(
  batsman,
  bowler
) {

  const balls =
    await Delivery.find({

      batsman: {
        $regex: batsman,
        $options: "i"
      },

      bowler: {
        $regex: bowler,
        $options: "i"
      }
    });

  let runs = 0;
  let outs = 0;

  balls.forEach(ball => {

    runs += parseInt(
      ball.batsman_runs || 0
    );

    // DISMISSALS

    if (
      ball.player_dismissed &&
      ball.player_dismissed
        .toLowerCase()
        .includes(
          batsman.toLowerCase()
        )
    ) {

      outs++;
    }

  });


  // STRIKE RATE

  const strikeRate =
    balls.length > 0
      ? (
          (runs / balls.length) * 100
        ).toFixed(2)
      : 0;


  return {

    batsman,

    bowler,

    runs,

    balls:
      balls.length,

    outs,

    strikeRate
  };
}

module.exports =
batsmanVsBowler;