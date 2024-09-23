document.addEventListener("DOMContentLoaded", () => {
  const promptInput = document.getElementById("promptInput");
  const generateBtn = document.getElementById("generateBtn");
  const streamBtn = document.getElementById("streamBtn");
  const output = document.getElementById("output");

  generateBtn.addEventListener("click", async () => {
    const prompt = promptInput.value;
    if (!prompt) return;

    try {
      const response = await fetch("/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      output.innerHTML = marked.parse(data.message);
    } catch (error) {
      console.error("Error:", error);
      output.textContent = "Failed to generate content";
    }
  });

  streamBtn.addEventListener("click", async () => {
    const prompt = promptInput.value;
    if (!prompt) return;

    try {
      const response = await fetch("/generate-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      output.innerHTML = "";
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let markdown = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        markdown += chunk;
        output.innerHTML = marked.parse(markdown);
      }
    } catch (error) {
      console.error("Error:", error);
      output.textContent = "Failed to generate stream content";
    }
  });
  document
    .getElementById("generateImages")
    .addEventListener("click", async () => {
      const prompt = promptInput.value;
      if (!prompt) return;

      try {
        const response = await fetch("/generate-images", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });

        const data = await response.json();
        const imageGrid = document.getElementById("image-grid");
        imageGrid.innerHTML = ""; // Clear previous images

        data.images.forEach((imgData, index) => {
          const img = document.createElement("img");
          img.src = imgData;
          img.alt = `Generated image ${index + 1}`;
          imageGrid.appendChild(img);
        });
      } catch (error) {
        console.error("Error:", error);
        output.textContent = "Failed to generate images";
      }
    });
});
