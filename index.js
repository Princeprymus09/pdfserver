const axios = require("axios");
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const path = require("path");
const fs = require("fs");

app.use(cors());

app.get("/getPdfData", async function (req, res) {
  const { fileUrl } = req.query;
  if (!fileUrl) {
    res.send("url not provided in correct format.");
    return;
  }

  axios({
    method: "GET",
    url: fileUrl,
    responseType: "stream",
  })
    .then((response) => {
      const filename = "test.pdf";
      const filePath = path.join(__dirname, filename);
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
      writer.on("finish", () => {
        res.download(filePath, (err) => {
          if (err) {
            console.error("Error occurred while sending PDF as response", err);
            res
              .status(500)
              .send("Error occurred while sending PDF as response");
          } else {
            console.log("PDF file sent as response successfully");
            fs.unlinkSync(filePath); // Delete the downloaded file from disk
          }
        });
      });
    })
    .catch((error) => {
      console.error("Error occurred while downloading PDF", error);
      res.status(500).send("Error occurred while downloading PDF");
    });
});

app.listen(PORT, function () {
  console.log("CORS-enabled web server listening on port " + PORT);
});
