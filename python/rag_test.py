# rag_test.py

import os
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.llms.ollama import Ollama
from llama_index.embeddings.ollama import OllamaEmbedding

# It's a good practice to define your models at the top
LLM_MODEL_NAME = "deepseek-r1"
EMBED_MODEL_NAME = "nomic-embed-text"

print("Initializing RAG application...")

# --- 1. Load your company's data from the 'data' directory ---
print("Loading documents from the 'data' directory...")
documents = SimpleDirectoryReader(input_dir="./data").load_data()
print(f"Loaded {len(documents)} document(s).")

# --- 2. Configure the LLM and Embedding Model to use Ollama ---
# We instantiate the LLM (deepseek-r1) for text generation.
# We have increased the request_timeout to 600.0 seconds (10 minutes)
# to give the model ample time to process the request.
print(f"Creating LLM client for model: {LLM_MODEL_NAME}")
ollama_llm = Ollama(model=LLM_MODEL_NAME, request_timeout=600.0)

# We instantiate the Embedding Model (nomic-embed-text) for converting text to vectors.
print(f"Creating Embedding client for model: {EMBED_MODEL_NAME}")
ollama_embed = OllamaEmbedding(model_name=EMBED_MODEL_NAME)

# --- 3. Create a searchable index from your documents ---
print("Creating a searchable index from the documents. This may take a moment...")
index = VectorStoreIndex.from_documents(
    documents,
    embed_model=ollama_embed,
)
print("Index created successfully.")

# --- 4. Create a query engine to interact with the index ---
print("Creating a query engine...")
query_engine = index.as_query_engine(llm=ollama_llm)
print("Query engine ready. You can start asking questions about your data.")

# --- 5. Start the chat loop ---
while True:
    try:
        user_query = input("You: ")
        if user_query.lower() in ["exit", "quit"]:
            break

        print(f"AI: Thinking using {LLM_MODEL_NAME}...")
        
        response = query_engine.query(user_query)

        print(f"AI: {response}")

    except Exception as e:
        print(f"An error occurred: {e}")
        print("Please ensure your Ollama server is running and the models are available.")