require("dotenv").config();

const axios =
require("axios");

async function liveMatches() {

  try {

    const response =
      await axios.get(

`https://api.cricapi.com/v1/currentMatches?apikey=${process.env.CRICKET_API_KEY}&offset=0`

      );

    return response.data.data;

  } catch (error) {

    console.log(error);

    return [];
  }
}

module.exports =
liveMatches;