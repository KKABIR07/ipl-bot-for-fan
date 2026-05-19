const liveMatches =
require("./services/liveMatches");

require("cricket-api");

(async () => {

  const matches =
    await liveMatches();

  console.log(matches);

})();