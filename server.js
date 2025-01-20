const app = require("./app"), {PORT} = require("./config/config");

app.listen(PORT, function () {
  console.log(`Listening on ${PORT}`);
});