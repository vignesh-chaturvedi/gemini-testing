require("dotenv").config();
const express = require("express");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const https = require("https");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const maxImages = 1;

// Regular generation route
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Generation config
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        candidateCount: 1,
        // stopSequences: ["x"],
        maxOutputTokens: 1024,
        temperature: 1.0,
      },
    });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    res.json({
      message: responseText,
    });
  } catch (error) {
    console.error("Error with Gemini API:", error);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

// Stream generation route
app.post("/generate-stream", async (req, res) => {
  try {
    const { prompt } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContentStream(prompt);

    // Streaming the result back to the frontend
    res.writeHead(200, { "Content-Type": "text/plain" });
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText); // Stream each chunk to the frontend
    }
    res.end(); // End the response after the stream is done
  } catch (error) {
    console.error("Error with Gemini API (stream):", error);
    res.status(500).json({ error: "Failed to generate stream content" });
  }
});

app.post("/generate-images", async (req, res) => {
  try {
    const { prompt } = req.body;
    const imageData = [];

    for (let i = 0; i < maxImages; i++) {
      const randomNumber = Math.floor(Math.random() * 10000 + 1);
      const imageBuffer = await new Promise((resolve, reject) => {
        const options = {
          hostname: "api-inference.huggingface.co",
          path: "/models/prompthero/openjourney",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          },
        };

        const req = https.request(options, (res) => {
          let data = [];
          res.on("data", (chunk) => {
            data.push(chunk);
          });
          res.on("end", () => {
            resolve(Buffer.concat(data));
          });
        });

        req.on("error", (error) => {
          reject(error);
        });

        req.write(JSON.stringify({ inputs: `${prompt} ${randomNumber}` }));
        req.end();
      });

      const base64Image = imageBuffer.toString("base64");
      imageData.push(`data:image/jpeg;base64,${base64Image}`);
    }

    res.json({ images: imageData });
  } catch (error) {
    console.error("Error generating images:", error);
    res.status(500).json({ error: "Failed to generate images" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
