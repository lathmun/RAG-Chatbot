# raw_ollama_test.py

import requests
import json

# Your Ollama server and model
OLLAMA_API_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "deepseek-r1"

# The message to send to the model
messages = [
    {
        "role": "system",
        "content": "You are a helpful assistant. Keep your answers brief."
    },
    {
        "role": "user",
        "content": "Hello, who are you?"
    }
]

# The payload for the POST request
payload = {
    "model": MODEL_NAME,
    "messages": messages,
    "stream": False  # We want the full response at once
}

print(f"Sending a direct POST request to {OLLAMA_API_URL}...")
print(f"Using model: {MODEL_NAME}")
print("Waiting for response...")

try:
    # Use a high timeout just in case, similar to our LlamaIndex test
    response = requests.post(OLLAMA_API_URL, json=payload, timeout=600)
    
    # Raise an exception for bad status codes (4xx or 5xx)
    response.raise_for_status()
    
    # Parse the response and print the content
    data = response.json()
    print("Response received successfully!")
    print("\n--- Response from Ollama ---")
    print(data['message']['content'])

except requests.exceptions.Timeout:
    print("Error: The request timed out. The model is too slow for the timeout setting.")
except requests.exceptions.RequestException as e:
    print(f"Error during API request: {e}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")