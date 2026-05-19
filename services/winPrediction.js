const {
  getHeadToHead,
  getRecentForm
} = require("./statsEngine");

const Match =
require("../models/Match");

async function predictWinner(
  team1,
  team2,
  venue
) {

  const h2h =
    await getHeadToHead(team1, team2);

  const form1 =
    await getRecentForm(team1);

  const form2 =
    await getRecentForm(team2);

  let score1 = 0;
  let score2 = 0;

  // HEAD TO HEAD

  score1 += h2h.team1Wins;
  score2 += h2h.team2Wins;

  // RECENT FORM

  score1 += form1.wins * 2;
  score2 += form2.wins * 2;


  // =========================
  // ADD VENUE LOGIC HERE
  // =========================

  let venue1 = 0;
  let venue2 = 0;

  if (venue) {

    venue1 =
      await Match.countDocuments({

      venue: {
        $regex: venue,
        $options: "i"
      },

      winner: team1
    });

    venue2 =
      await Match.countDocuments({

      venue: {
        $regex: venue,
        $options: "i"
      },

      winner: team2
    });

    score1 += venue1 * 2;
    score2 += venue2 * 2;
  }

  // =========================
  // TOTAL SCORE
  // =========================

  const total =
    score1 + score2;

  if (total === 0) {

    return {
      probability: 50,
      probability2: 50
    };
  }

  return {

    probability:
      ((score1 / total) * 100)
      .toFixed(2),

    probability2:
      ((score2 / total) * 100)
      .toFixed(2),

    venueStats: {
      venue,
      venue1,
      venue2
    },

    stats: {
      h2h,
      form1,
      form2
    }
  };
}

module.exports =
predictWinner;