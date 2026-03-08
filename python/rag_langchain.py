# rag_langchain.py

import os
from langchain_community.document_loaders import DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma

# --- IMPORT FIXES ---
# The new class for LLM
from langchain_ollama import OllamaLLM

# The new class for Embeddings
from langchain_ollama import OllamaEmbeddings

# The RetrievalQA chain import has changed
from langchain.chains import RetrievalQA

# --- 1. Configure the LLM and Embedding Model ---
LLM_MODEL_NAME = "deepseek-r1"
EMBED_MODEL_NAME = "nomic-embed-text"

print("Initializing RAG application with LangChain...")

# Define the Ollama LLM client for the chat model
ollama_llm = OllamaLLM(model=LLM_MODEL_NAME, timeout=600.0)

# Define the Ollama Embeddings client for vectorization
ollama_embeddings = OllamaEmbeddings(model=EMBED_MODEL_NAME)

# --- 2. Load your company's data from the 'data' directory ---
print("Loading documents from the 'data' directory...")
loader = DirectoryLoader('./data', glob="**/*.txt")
documents = loader.load()
print(f"Loaded {len(documents)} document(s).")

# --- 3. Split the documents into smaller chunks for the RAG process ---
print("Splitting documents into chunks...")
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
docs = text_splitter.split_documents(documents)

# --- 4. Create a vector store from the document chunks ---
print("Creating a vector store from the document chunks...")
db = Chroma.from_documents(docs, ollama_embeddings)
print("Vector store created successfully.")

# --- 5. Create a retrieval chain to handle the RAG process ---
print("Creating a retrieval chain...")
qa_chain = RetrievalQA.from_chain_type(
    llm=ollama_llm,
    chain_type="stuff",
    retriever=db.as_retriever(),
)
print("Retrieval chain ready. You can start asking questions.")

# --- 6. Start the chat loop ---
while True:
    try:
        user_query = input("You: ")
        if user_query.lower() in ["exit", "quit"]:
            break

        print(f"AI: Thinking using {LLM_MODEL_NAME}...")
        
        response = qa_chain.run(user_query)

        print(f"AI: {response}")

    except Exception as e:
        print(f"An error occurred: {e}")
        print("Please ensure your Ollama server is running and the models are available.")