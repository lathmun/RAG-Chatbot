// ollamaApi_backup.js

const API_SERVER_URL = "http://127.0.0.1:5001";

// Fetches the list of available models from the Flask API.
export const listModels = async () => {
  try {
    const response = await fetch(`${API_SERVER_URL}/api/tags`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.models;
  } catch (error) {
    console.error("Error fetching models:", error);
    return [];
  }
};

// Sends a single user prompt string to the Flask API.
// This version is non-streaming and returns the complete response.
export const generateResponse = async (model, userPrompt) => {
  try {
    const response = await fetch(`${API_SERVER_URL}/api/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // The body now sends only the single user prompt string
      body: JSON.stringify({
        model: model,
        prompt: userPrompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // We parse the full JSON response body
    const data = await response.json();

    // The Flask server sends the response in an object like { response: "..." }
    return data.response;
  } catch (error) {
    console.error("Error generating response:", error);
    return "Error: Could not get a response from the API.";
  }
};