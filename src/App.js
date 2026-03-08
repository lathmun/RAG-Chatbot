// src/App.js

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import ModelSelector from './components/ModelSelector';
import ChatInterface from './components/ChatInterface';
import { listModels, generateResponse } from './ollamaApi';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [showThinking, setShowThinking] = useState(false);

    useEffect(() => {
        const fetchModels = async () => {
            setIsLoading(true);
            try {
                const fetchedModels = await listModels();
                setModels(fetchedModels);
                if (fetchedModels.length > 0) {
                    setSelectedModel(fetchedModels[0].name);
                }
            } catch (err) {
                setApiError("Failed to connect to Ollama server. Please ensure it's running.");
                console.error("Error fetching models:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchModels();
    }, []);

    const handleSendMessage = async (prompt) => {
        if (!selectedModel || isLoading || !prompt.trim()) return;

        const newUserMessage = { role: 'user', content: prompt };
        setMessages(prevMessages => [...prevMessages, newUserMessage]);
        
        const thinkingMessage = { role: 'assistant', content: 'Thinking...' };
        setMessages(prevMessages => [...prevMessages, thinkingMessage]);

        setIsLoading(true);

        try {
            const aiResponse = await generateResponse(selectedModel, prompt);
            
            // --- The new filtering logic is here! ---
            let finalResponse = aiResponse;
            if (!showThinking) {
                finalResponse = aiResponse.replace(/<think>[\s\S]*?<\/think>/g, '');
            }

            setMessages(prevMessages => {
                const updatedMessages = [...prevMessages];
                updatedMessages[updatedMessages.length - 1] = {
                    role: 'assistant',
                    content: finalResponse
                };
                return updatedMessages;
            });
            
        } catch (error) {
            console.error("Error generating response:", error);
            setMessages(prevMessages => {
                const updatedMessages = [...prevMessages];
                updatedMessages[updatedMessages.length - 1] = {
                    role: 'assistant',
                    content: `Error: Could not get a response from the model. ${error.message}`
                };
                return updatedMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleToggleThinking = (e) => {
        setShowThinking(e.target.checked);
    };

    return (
        <Container fluid className="vh-100 p-0">
            <Row className="h-100">
                <Col md={3} className="bg-light p-4 d-flex flex-column">
                    <h4 className="text-center mb-4">Ollama Chat</h4>
                    {apiError && <Alert variant="danger">{apiError}</Alert>}
                    {isLoading && !models.length && (
                        <div className="text-center my-5">
                            <Spinner animation="border" />
                            <p className="mt-2 text-muted">Connecting to Ollama server...</p>
                        </div>
                    )}
                    <ModelSelector
                        models={models}
                        onSelectModel={setSelectedModel}
                        selectedModel={selectedModel}
                        isLoading={isLoading}
                        showThinking={showThinking}
                        onToggleThinking={handleToggleThinking}
                    />
                </Col>
                
                <Col md={9} className="p-0 d-flex flex-column">
                    {selectedModel ? (
                        <ChatInterface
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            isLoading={isLoading}
                        />
                    ) : (
                        <div className="d-flex flex-column justify-content-center align-items-center h-100 text-muted">
                            <h3>Select a model to begin chatting.</h3>
                            <p>Make sure you have models installed with `ollama pull &lt;model_name&gt;`.</p>
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
}

export default App;