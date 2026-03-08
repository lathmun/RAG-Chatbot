# api.py

import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_community.document_loaders import DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain.chains import RetrievalQA

# --- 1. Initialize LangChain Components ---
LLM_MODEL_NAME = "deepseek-r1"
EMBED_MODEL_NAME = "nomic-embed-text"
OLLAMA_SERVER_URL = "http://localhost:11434"

ollama_llm = OllamaLLM(model=LLM_MODEL_NAME, timeout=600.0)
ollama_embeddings = OllamaEmbeddings(model=EMBED_MODEL_NAME)

print("Loading documents and setting up RAG pipeline...")
loader = DirectoryLoader('./data', glob="**/*.txt")
documents = loader.load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
docs = text_splitter.split_documents(documents)
db = Chroma.from_documents(docs, ollama_embeddings)
qa_chain = RetrievalQA.from_chain_type(
    llm=ollama_llm,
    chain_type="stuff",
    retriever=db.as_retriever(),
)

# --- 2. Initialize Flask App and CORS ---
app = Flask(__name__)
CORS(app)

# --- 3. Create API Endpoints ---

# Endpoint to handle RAG queries from React
@app.route("/api/ask", methods=["POST"])
def ask_question():
    data = request.get_json()
    # The prompt is now a simple string, so no need for list parsing
    question_string = data.get("prompt")
    
    if not question_string:
        return jsonify({"error": "No prompt provided"}), 400

    print(f"Received prompt from React: {question_string}")

    try:
        response = qa_chain.run(question_string)
        print(f"Sending response back to React: {response}")
        return jsonify({"response": response})
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": str(e)}), 500

# Endpoint to list available Ollama models
@app.route("/api/tags", methods=["GET"])
def get_ollama_models():
    try:
        ollama_response = requests.get(f"{OLLAMA_SERVER_URL}/api/tags")
        ollama_response.raise_for_status()
        return jsonify(ollama_response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to connect to Ollama server: {e}"}), 500

# --- 4. Run the App ---
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)