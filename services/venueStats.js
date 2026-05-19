const Match =
require("../models/Match");

async function venueAdvantage(
  venue,
  team
) {

  const matches =
    await Match.find({
      venue,
      winner: team
    });

  return matches.length;
}

module.exports =
venueAdvantage;