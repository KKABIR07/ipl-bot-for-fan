require("dotenv").config({ path: "../.env" });

const { App } = require("@slack/bolt");

const teamMap =
require("../utils/teamMap");

const connectDB =
require("../db/connect");

const predictWinner =
require("../services/winPrediction");

const askGrok =
require("../services/grokService");

const {
  getTopBatsmen,
  getTopBowlers
} = require("../services/playerStats");


const {
  averageVenueScore,
  chasingStats
} = require("../services/venueAnalytics");

const batsmanVsBowler =
require("../services/matchups");

const getTeamAnalysis =
require("../services/teamAnalysis");

const getPowerplayStats =
require("../services/powerplayAnalysis");

const getDeathOversStats =
require("../services/deathOversAnalysis");

const getEconomyStats =
require("../services/economyAnalysis");

const getMiddleOversStats =
require("../services/middleOversAnalysis");

const topBatsmen =
require("../services/topBatsmen");

const topBowlers =
require("../services/topBowlers");

const fantasyTeam =
require("../services/fantasyTeam");

const liveMatches =
require("../services/liveMatches");

// CONNECT DATABASE

connectDB();


// CREATE SLACK APP

const app = new App({

  token:
    process.env.SLACK_BOT_TOKEN,

  signingSecret:
    process.env.SLACK_SIGNING_SECRET,

  socketMode: true,

  appToken:
    process.env.SLACK_APP_TOKEN
});


// ======================================
// TEST MESSAGE
// ======================================

app.message(async ({ message, say }) => {

  console.log(message.text);

  if (
    message.text &&
    message.text.toLowerCase().includes("hello")
  ) {

    await say(
      `Hello <@${message.user}> 🏏`
    );
  }
});


// ======================================
// RAW PREDICTION COMMAND
// ======================================

app.command("/predict",
async ({ command, ack, respond }) => {

  await ack();

  try {

    // SPLIT INPUT

    const [
      short1,
      short2,
      ...venueParts
    ] = command.text.split(" ");

    const venue =
      venueParts.join(" ");


    // TEAM MAP

    const team1 =
      teamMap[short1?.toUpperCase()];

    const team2 =
      teamMap[short2?.toUpperCase()];


    // VALIDATION

    if (!team1 || !team2) {

      return respond(
`Usage:
/predict CSK MI Wankhede`
      );
    }


    // PREDICTION

    const result =
      await predictWinner(
        team1,
        team2,
        venue
      );


    // RESPONSE

    await respond(`
🏏 IPL Match Prediction

${team1}: ${result.probability}%
${team2}: ${result.probability2}%

📍 Venue:
${venue || "Neutral"}

Based on historical IPL data.
    `);

  } catch (error) {

    console.log(error);

    await respond(
      "Prediction failed ❌"
    );
  }
});


// ======================================
// AI PREDICTION COMMAND
// ======================================

app.command("/ai-predict",
async ({ command, ack, say }) => {

  await ack();

  try {

    // =====================================
    // INPUT
    // =====================================

    const [
      short1,
      short2,
      ...venueParts
    ] = command.text.split(" ");

    const venue =
      venueParts.join(" ");


    // =====================================
    // TEAM MAP
    // =====================================

    const team1 =
      teamMap[short1?.toUpperCase()];

    const team2 =
      teamMap[short2?.toUpperCase()];


    // =====================================
    // VALIDATION
    // =====================================

    if (!team1 || !team2) {

      return say(
`Usage:
/ai-predict CSK MI Wankhede`
      );
    }


    // =====================================
    // MATCH PREDICTION
    // =====================================

    const result =
      await predictWinner(
        team1,
        team2,
        venue
      );


    // =====================================
    // PLAYER ANALYTICS
    // =====================================

    const batsmen1 =
      await getTopBatsmen(team1);

    const batsmen2 =
      await getTopBatsmen(team2);

    const bowlers1 =
      await getTopBowlers(team1);

    const bowlers2 =
      await getTopBowlers(team2);


    // =====================================
    // AI ANALYSIS
    // =====================================

    const analysis =
      await askGrok(`

Analyze this IPL match prediction professionally.

TEAM 1:
${team1}

TEAM 2:
${team2}

VENUE:
${venue || "Neutral"}

WIN PROBABILITY:
${team1}: ${result.probability}%
${team2}: ${result.probability2}%

HEAD TO HEAD:
${JSON.stringify(result.stats.h2h)}

RECENT FORM:
${JSON.stringify(result.stats.form1)}
${JSON.stringify(result.stats.form2)}

VENUE STATS:
${JSON.stringify(result.venueStats)}

TOP BATSMEN TEAM 1:
${JSON.stringify(batsmen1)}

TOP BATSMEN TEAM 2:
${JSON.stringify(batsmen2)}

TOP BOWLERS TEAM 1:
${JSON.stringify(bowlers1)}

TOP BOWLERS TEAM 2:
${JSON.stringify(bowlers2)}

Analyze:
- batting depth
- bowling strength
- venue advantage
- recent form
- key players

Give short professional cricket analysis.
`);


    // =====================================
    // RESPONSE
    // =====================================

    await say(`
🏏 AI IPL Match Prediction

${team1}: ${result.probability}%
${team2}: ${result.probability2}%

📍 Venue:
${venue || "Neutral"}

🤖 AI Analysis:
${analysis}
    `);

  } catch (error) {

    console.log(error);

    await say(
      "AI Prediction failed ❌"
    );
  }

});

app.command("/venue",
async ({ command, ack, respond }) => {

  await ack();

  try {

    const venue =
      command.text;

    if (!venue) {

      return respond(
`Usage:
/venue Wankhede`
      );
    }


    // =========================
    // VENUE ANALYTICS
    // =========================

    const avgScore =
      await averageVenueScore(
        venue
      );

      console.log("AVG SCORE:", avgScore);

    const chaseStats =
      await chasingStats(
        venue
      );

        console.log("CHASE:", chaseStats);
    // =========================
    // AI ANALYSIS
    // =========================

    const analysis =
await askGrok(`

Analyze this IPL cricket venue professionally.

Venue:
${venue}

Average First Innings Score:
${avgScore}

Batting First Wins:
${chaseStats.battingFirstWins}

Chasing Wins:
${chaseStats.chasingWins}

IMPORTANT:
- If chasing wins are higher,
the venue favors chasing.
- If batting first wins are higher,
the venue favors defending.
- Use the stats correctly.
- Mention dew impact if chasing is dominant.

Analyze:
- pitch behavior
- batting conditions
- bowling conditions
- chasing advantage
- dew factor

Do NOT mention specific teams.

Give accurate professional cricket analysis.
`);


    // =========================
    // RESPONSE
    // =========================

    await respond(`
🏟 IPL Venue Analytics

📍 Venue:
${venue}

📊 Average 1st Innings Score:
${Number(avgScore || 0).toFixed(0)}

🏏 Batting First Wins:
${chaseStats.battingFirstWins}

🎯 Chasing Wins:
${chaseStats.chasingWins}

🤖 AI Analysis:
${analysis}
    `);

  } catch (error) {

    console.log(error);

    await respond(
      "Venue analysis failed ❌"
    );
  }

});

app.command("/matchup",
async ({ command, ack, say }) => {

  await ack();

  try {

    const text =
      command.text;

    if (!text) {

      return say(
`Usage:
/matchup Kohli Bumrah`
      );
    }

    const words =
      text.split(" ");

    if (words.length < 2) {

      return say(
`Usage:
/matchup Kohli Bumrah`
      );
    }


    // =========================
    // PLAYER NAMES
    // =========================

    const batsman =
      words[0];

    const bowler =
      words[1];


    // =========================
    // MATCHUP STATS
    // =========================

    const result =
      await batsmanVsBowler(
        batsman,
        bowler
      );


    // =========================
    // AI ANALYSIS
    // =========================

    const analysis =
      await askGrok(`

Analyze this IPL player matchup.

Batsman:
${result.batsman}

Bowler:
${result.bowler}

Runs:
${result.runs}

Balls:
${result.balls}

Dismissals:
${result.outs}

Strike Rate:
${result.strikeRate}

Give short tactical cricket analysis.
`);


    // =========================
    // RESPONSE
    // =========================

    await say(`
🏏 IPL Player Matchup

🧢 Batsman:
${result.batsman}

🎯 Bowler:
${result.bowler}

📊 Runs:
${result.runs}

⚾ Balls:
${result.balls}

❌ Dismissals:
${result.outs}

🚀 Strike Rate:
${result.strikeRate}

🤖 AI Analysis:
${analysis}
    `);

  } catch (error) {

    console.log(error);

    await say(
      "Matchup analysis failed ❌"
    );
  }

});
app.command("/team",
async ({ command, ack, say }) => {

  await ack();

  try {

    const shortName =
      command.text
        .trim()
        .toUpperCase();

    if (!shortName) {

      return say(
`Usage:
/team MI`
      );
    }


    // =========================
    // TEAM MAP
    // =========================

    const team =
      teamMap[shortName];

    if (!team) {

      return say(
        "Invalid team ❌"
      );
    }


    // =========================
    // ANALYTICS
    // =========================

    const stats =
      await getTeamAnalysis(
        team
      );


    // =========================
    // AI ANALYSIS
    // =========================

    const analysis =
      await askGrok(`

Analyze this IPL team professionally.

Team:
${team}

Top Batsmen:
${JSON.stringify(stats.batsmen)}

Top Bowlers:
${JSON.stringify(stats.bowlers)}

Average Powerplay Score:
${stats.powerplay}

Average Death Overs Score:
${stats.deathOvers}

Bowling Economy:
${stats.economy}

Analyze:
- batting depth
- bowling strength
- death overs
- powerplay performance
- key players

Keep response under 120 words.
`);


    // =========================
    // RESPONSE
    // =========================

    await say(`
🏏 IPL Team Analysis

📌 Team:
${team}

⚡ Average Powerplay:
${stats.powerplay.toFixed(0)}

🔥 Average Death Overs:
${stats.deathOvers.toFixed(0)}

🎯 Bowling Economy:
${stats.economy.toFixed(2)}

🤖 AI Analysis:
${analysis}
    `);

  } catch (error) {

    console.log(error);

    await say(
      "Team analysis failed ❌"
    );
  }

});

app.command("/powerplay",
async ({ command, ack, say }) => {

  await ack();

  try {

    const shortName =
      command.text
        .trim()
        .toUpperCase();

    if (!shortName) {

      return say(
`Usage:
/powerplay MI`
      );
    }


    // =========================
    // TEAM MAP
    // =========================

    const team =
      teamMap[shortName];

    if (!team) {

      return say(
        "Invalid team ❌"
      );
    }


    // =========================
    // POWERPLAY STATS
    // =========================

    const stats =
      await getPowerplayStats(
        team
      );


    // =========================
    // AI ANALYSIS
    // =========================

    const analysis =
      await askGrok(`

Analyze this IPL team's powerplay performance.

Team:
${team}

Average Powerplay Runs:
${stats.avgRuns}

Average Powerplay Wickets Lost:
${stats.avgWickets}

Instructions:
- Analyze aggression
- Analyze stability
- Analyze attacking approach
- Mention batting intent
- Mention risk level

Keep response under 80 words.
`);


    // =========================
    // RESPONSE
    // =========================

    await say(`
⚡ IPL Powerplay Analysis

📌 Team:
${team}

🏏 Average Powerplay Score:
${stats.avgRuns.toFixed(0)}

❌ Average Wickets Lost:
${stats.avgWickets.toFixed(1)}

🤖 AI Analysis:
${analysis}
    `);

  } catch (error) {

    console.log(error);

    await say(
      "Powerplay analysis failed ❌"
    );
  }

});

app.command("/deathovers",
async ({ command, ack, say }) => {

  await ack();

  try {

    const shortName =
      command.text
        .trim()
        .toUpperCase();

    if (!shortName) {

      return say(
`Usage:
/deathovers MI`
      );
    }


    // =========================
    // TEAM MAP
    // =========================

    const team =
      teamMap[shortName];

    if (!team) {

      return say(
        "Invalid team ❌"
      );
    }


    // =========================
    // DEATH OVERS STATS
    // =========================

    const stats =
      await getDeathOversStats(
        team
      );


    // =========================
    // AI ANALYSIS
    // =========================

    const analysis =
      await askGrok(`

Analyze this IPL team's death overs performance.

Team:
${team}

Average Death Overs Runs:
${stats.avgRuns}

Average Wickets Lost:
${stats.avgWickets}

Instructions:
- Analyze finishing ability
- Analyze aggression
- Analyze boundary hitting
- Analyze risk level
- Analyze lower-order batting

Keep response under 80 words.
`);


    // =========================
    // RESPONSE
    // =========================

    await say(`
🔥 IPL Death Overs Analysis

📌 Team:
${team}

🏏 Average Death Overs Runs:
${stats.avgRuns.toFixed(0)}

❌ Average Wickets Lost:
${stats.avgWickets.toFixed(1)}

🤖 AI Analysis:
${analysis}
    `);

  } catch (error) {

    console.log(error);

    await say(
      "Death overs analysis failed ❌"
    );
  }

});

app.command("/economy",
async ({ command, ack, say }) => {

  await ack();

  try {

    const shortName =
      command.text
        .trim()
        .toUpperCase();

    if (!shortName) {

      return say(
`Usage:
/economy MI`
      );
    }


    // =========================
    // TEAM MAP
    // =========================

    const team =
      teamMap[shortName];

    if (!team) {

      return say(
        "Invalid team ❌"
      );
    }


    // =========================
    // ECONOMY STATS
    // =========================

    const stats =
      await getEconomyStats(
        team
      );


    // =========================
    // FORMAT BOWLERS
    // =========================

    const bowlersText =
      stats.map((b, index) =>

`${index + 1}. ${b.bowler}
Economy: ${b.economy.toFixed(2)}`

      ).join("\n\n");


    // =========================
    // AI ANALYSIS
    // =========================

    const analysis =
      await askGrok(`

Analyze this IPL bowling economy data.

Team:
${team}

Bowling Stats:
${JSON.stringify(stats)}

Instructions:
- Analyze bowling control
- Analyze economy strength
- Mention disciplined bowlers
- Mention pressure building
- Mention bowling quality

Keep response under 80 words.
`);


    // =========================
    // RESPONSE
    // =========================

    await say(`
🎯 IPL Bowling Economy Analysis

📌 Team:
${team}

${bowlersText}

🤖 AI Analysis:
${analysis}
    `);

  } catch (error) {

    console.log(error);

    await say(
      "Economy analysis failed ❌"
    );
  }

});

app.command("/middleovers",
async ({ command, ack, say }) => {

  await ack();

  try {

    const shortName =
      command.text
        .trim()
        .toUpperCase();

    if (!shortName) {

      return say(
`Usage:
/middleovers MI`
      );
    }


    // =========================
    // TEAM MAP
    // =========================

    const team =
      teamMap[shortName];

    if (!team) {

      return say(
        "Invalid team ❌"
      );
    }


    // =========================
    // MIDDLE OVERS STATS
    // =========================

    const stats =
      await getMiddleOversStats(
        team
      );


    // =========================
    // AI ANALYSIS
    // =========================

    const analysis =
      await askGrok(`

Analyze this IPL team's middle overs performance.

Team:
${team}

Average Middle Overs Runs:
${stats.avgRuns}

Average Wickets Lost:
${stats.avgWickets}

Instructions:
- Analyze stability
- Analyze strike rotation
- Analyze spin handling
- Analyze innings control
- Analyze tactical batting

Keep response under 80 words.
`);


    // =========================
    // RESPONSE
    // =========================

    await say(`
📊 IPL Middle Overs Analysis

📌 Team:
${team}

🏏 Average Middle Overs Runs:
${stats.avgRuns.toFixed(0)}

❌ Average Wickets Lost:
${stats.avgWickets.toFixed(1)}

🤖 AI Analysis:
${analysis}
    `);

  } catch (error) {

    console.log(error);

    await say(
      "Middle overs analysis failed ❌"
    );
  }

});

app.command("/top-batsmen",
async ({ ack, say }) => {

  await ack();

  try {

    const stats =
      await topBatsmen();


    // =========================
    // FORMAT
    // =========================

    const playersText =
      stats.map((p, index) =>

`${index + 1}. ${p.player}

Runs: ${p.runs}

Strike Rate:
${p.strikeRate.toFixed(2)}

4s: ${p.fours}

6s: ${p.sixes}`

      ).join("\n\n");


    // =========================
    // AI ANALYSIS
    // =========================

    const analysis =
      await askGrok(`

Analyze these IPL batting rankings.

Players:
${JSON.stringify(stats)}

Instructions:
- Analyze consistency
- Analyze aggressive batting
- Mention boundary hitters
- Mention elite performers

Keep response under 80 words.
`);


    // =========================
    // RESPONSE
    // =========================

    await say(`
🏏 IPL Top Batsmen

${playersText}

🤖 AI Analysis:
${analysis}
    `);

  } catch (error) {

    console.log(error);

    await say(
      "Top batsmen analysis failed ❌"
    );
  }

});

app.command("/top-bowlers",
async ({ ack, say }) => {

  await ack();

  try {

    const stats =
      await topBowlers();


    // =========================
    // FORMAT
    // =========================

    const bowlersText =
      stats.map((p, index) =>

`${index + 1}. ${p.player}

Wickets:
${p.wickets}

Economy:
${p.economy.toFixed(2)}`

      ).join("\n\n");


    // =========================
    // AI ANALYSIS
    // =========================

    const analysis =
      await askGrok(`

Analyze these IPL bowling rankings.

Bowlers:
${JSON.stringify(stats)}

Instructions:
- Analyze wicket taking ability
- Analyze bowling control
- Mention economy strength
- Mention elite bowlers

Keep response under 80 words.
`);


    // =========================
    // RESPONSE
    // =========================

    await say(`
🎯 IPL Top Bowlers

${bowlersText}

🤖 AI Analysis:
${analysis}
    `);

  } catch (error) {

    console.log(error);

    await say(
      "Top bowlers analysis failed ❌"
    );
  }

});

app.command("/fantasy",
async ({ command, ack, say }) => {

  await ack();

  try {

    const [
      short1,
      short2
    ] = command.text
      .split(" ");

    if (!short1 || !short2) {

      return say(
`Usage:
/fantasy MI CSK`
      );
    }


    // =========================
    // TEAM MAP
    // =========================

    const team1 =
      teamMap[
        short1.toUpperCase()
      ];

    const team2 =
      teamMap[
        short2.toUpperCase()
      ];

    if (!team1 || !team2) {

      return say(
        "Invalid teams ❌"
      );
    }


    // =========================
    // FANTASY PICKS
    // =========================

    const result =
      await fantasyTeam(
        team1,
        team2
      );


    // =========================
    // AI ANALYSIS
    // =========================

    const analysis =
      await askGrok(`

Analyze this IPL fantasy team.

Match:
${team1} vs ${team2}

Captain:
${result.captain}

Vice Captain:
${result.viceCaptain}

Safe Picks:
${result.safePicks.join(", ")}

Differential Picks:
${result.differentialPicks.join(", ")}

Instructions:
- Analyze fantasy strategy
- Mention captaincy logic
- Mention risk/reward picks
- Mention safe players

Keep response under 100 words.
`);


    // =========================
    // RESPONSE
    // =========================

    await say(`
🏏 IPL Fantasy Suggestions

⚔ Match:
${team1}
vs
${team2}

⭐ Captain:
${result.captain}

🥈 Vice Captain:
${result.viceCaptain}

🔥 Safe Picks:
${result.safePicks.join(", ")}

🎯 Differential Picks:
${result.differentialPicks.join(", ")}

🤖 AI Analysis:
${analysis}
    `);

  } catch (error) {

    console.log(error);

    await say(
      "Fantasy analysis failed ❌"
    );
  }

});

app.command("/live",
async ({ ack, say }) => {

  await ack();

  try {

    const matches =
      await liveMatches();

      const filtered =
matches.filter(match =>

  match.matchStarted &&
  !match.matchEnded
);

    if (!filtered.length) {

      return say(
"No live matches found ❌"
      );
    }


    // =========================
    // FORMAT MATCHES
    // =========================

    const text =
      matches
      .slice(0, 5)
      .map(match => {

        const team1 =
          match.teams?.[0] || "Team 1";

        const team2 =
          match.teams?.[1] || "Team 2";

        const status =
          match.status || "No status";

        const venue =
          match.venue || "Unknown venue";

        return `
🏏 ${team1}
vs
${team2}

📍 ${venue}

📊 ${status}
`;
      })
      .join("\n====================\n");


    // =========================
    // SEND RESPONSE
    // =========================

    await say(`
🔥 Live Cricket Matches

${text}
    `);

  } catch (error) {

    console.log(error);

    await say(
      "Live match fetch failed ❌"
    );
  }

});
// ======================================
// EXPORT
// ======================================

module.exports = { app };


// ======================================
// START BOT
// ======================================

(async () => {

  await app.start(
    process.env.PORT || 3000
  );

  console.log(
    "⚡ IPL Prediction Bot Running"
  );

})();