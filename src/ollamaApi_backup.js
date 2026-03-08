// src/ollamaApi.js

// This constant holds the URL of our local Ollama server.
// It's a standard practice to keep URLs and configurations separate.
const OLLAMA_API_URL = 'http://localhost:11434';

// This function is an asynchronous JavaScript function.
// The `async` keyword allows us to use `await` inside the function.
// The purpose of this function is to get a list of all models available on our Ollama server.
export const listModels = async () => {
    try {
        // We use the browser's native `fetch` API to make a network request.
        // `await` pauses the function execution until the promise from `fetch` is resolved.
        const response = await fetch(`${OLLAMA_API_URL}/api/tags`);

        // We check if the HTTP response was successful. `response.ok` is a built-in property.
        if (!response.ok) {
            // If the request failed, we throw an error to be caught by the `catch` block.
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // We parse the JSON data from the response. This is also an async operation.
        const data = await response.json();

        // The API returns an object with a 'models' array, which is what we need.
        return data.models;
    } catch (error) {
        // If any error occurs in the `try` block, execution jumps here.
        console.error("Error fetching models:", error);
        // We return an empty array to prevent the app from crashing if the API is unreachable.
        return [];
    }
};

// This function handles the core functionality of sending a message to a model
// and receiving a response. The response is streamed token by token.
// 'onStream' is a callback function passed from our React component.
export const generateResponse = async (model, messages, onStream) => {
    // The `fetch` API is used again, this time with a POST request.
    const response = await fetch(`${OLLAMA_API_URL}/api/chat`, {
        // We specify the HTTP method.
        method: 'POST',
        // Headers are metadata for the request.
        headers: {
            'Content-Type': 'application/json',
        },
        // The `body` contains the data we are sending to the server.
        // `JSON.stringify` converts our JavaScript object into a JSON string.
        // `stream: true` is a crucial setting for the Ollama API to send responses token by token.
        body: JSON.stringify({
            model: model,
            messages: messages,
            stream: true,
        }),
    });

    // The response `body` is a readable stream. `getReader()` gives us a way to read from it.
    const reader = response.body.getReader();
    // `TextDecoder` helps us convert the raw binary data from the stream into a readable string.
    const decoder = new TextDecoder('utf-8');

    let fullResponse = '';
    // This `while` loop runs continuously as long as the stream is not finished (`done` is false).
    while (true) {
        // `reader.read()` reads the next chunk of data from the stream. It's an async operation.
        const { value, done } = await reader.read();
        // If `done` is true, it means we have reached the end of the stream.
        if (done) {
            break;
        }

        // We decode the chunk of binary data into a string.
        const chunk = decoder.decode(value);
        // The streamed data can contain multiple JSON objects separated by newlines.
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
            try {
                // We parse each line as a JSON object.
                const data = JSON.parse(line);
                // The `done` field is a property from the Ollama API indicating the stream's status.
                if (data.done === false) {
                    // We extract the actual content from the message.
                    const content = data.message.content;
                    // We append the new chunk to our full response string.
                    fullResponse += content;
                    // We call the `onStream` callback function, which updates the UI with the new text.
                    onStream(fullResponse);
                }
            } catch (e) {
                console.error("Error parsing streaming JSON:", e);
            }
        }
    }
    // Finally, we return the complete response string.
    return fullResponse;
};