document.getElementById("generateBtn").addEventListener("click", async () => {
  const prompt = document.getElementById("promptInput").value;
  const outputElement = document.getElementById("output");
  outputElement.innerHTML = "Generating story...";

  try {
    const response = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();
    outputElement.innerHTML = `<p>${data.message}</p>`;
  } catch (error) {
    console.error("Error:", error);
    outputElement.innerHTML = "Failed to generate story.";
  }
});

document.getElementById("streamBtn").addEventListener("click", async () => {
  const prompt = document.getElementById("promptInput").value;
  const outputElement = document.getElementById("output");
  outputElement.innerHTML = ""; // Clear output

  try {
    const response = await fetch("/generate-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    // Use a reader to stream the response
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      outputElement.innerHTML += chunk; // Append the chunk to the output
    }
  } catch (error) {
    console.error("Error:", error);
    outputElement.innerHTML = "Failed to stream content.";
  }
});
