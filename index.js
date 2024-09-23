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
});
