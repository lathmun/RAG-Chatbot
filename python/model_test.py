# model_test.py

import os
from llama_index.llms.ollama import Ollama

# Ensure Ollama is running and deepseek-r1 is available
ollama_llm = Ollama(model="deepseek-r1", request_timeout=600.0)

print("Testing deepseek-r1 model with a simple query...")
print("If this gets stuck, the issue is with the model's performance on your machine.")

try:
    response = ollama_llm.complete("Hello, who are you?")
    print("Response received successfully!")
    print(response.text)
except Exception as e:
    print(f"An error occurred: {e}")