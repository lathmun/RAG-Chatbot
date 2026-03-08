// src/App.js

// We import React itself and several "hooks" which are special functions that allow
// us to use React features in our functional components.
import React, { useState, useEffect } from 'react';

// We import UI components from 'react-bootstrap', a library that provides
// pre-built UI elements that are easy to use in React.
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';

// We import our custom components.
import ModelSelector from './components/ModelSelector';
import ChatInterface from './components/ChatInterface';

// We import the JavaScript functions from our API utility file.
import { listModels, generateResponse } from './ollamaApi_backup';

// We import Bootstrap's CSS to style our components.
import 'bootstrap/dist/css/bootstrap.min.css';

// We import our own custom CSS file for additional styling.
import './App.css';

// This is our main functional component. In React, components are functions.
// They return JSX, which is a mix of JavaScript and HTML-like syntax.
function App() {
    // We use the `useState` hook to manage component state.
    // `useState` returns an array with two elements:
    // 1. The current state value (e.g., `models`).
    // 2. A function to update that state (e.g., `setModels`).
    // When we call a state update function, React re-renders the component.
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [showThinking, setShowThinking] = useState(false);

    // The `useEffect` hook is used for "side effects," which are things
    // that don't directly affect the component's render, like data fetching or DOM manipulation.
    // The second argument, `[]`, is the dependency array. An empty array
    // means this effect will only run once when the component first "mounts" (is added to the DOM).
    useEffect(() => {
        // This function will fetch the models from the API.
        const fetchModels = async () => {
            setIsLoading(true); // Update state to show a loading spinner.
            try {
                const fetchedModels = await listModels();
                setModels(fetchedModels); // Update state with the fetched models.
                if (fetchedModels.length > 0) {
                    // Set the first model as the default selected one.
                    setSelectedModel(fetchedModels[0].name);
                }
            } catch (err) {
                setApiError("Failed to connect to Ollama server. Please ensure it's running.");
                console.error("Error fetching models:", err);
            } finally {
                setIsLoading(false); // Update state to hide the loading spinner.
            }
        };
        fetchModels();
    }, []); // Empty dependency array: runs only on initial render.

    // This is the function that handles sending a message. It will be passed
    // down to the child `ChatInterface` component as a prop.
    const handleSendMessage = async (prompt) => {
        // Basic validation: don't send a message if no model is selected or if we're already loading.
        if (!selectedModel || isLoading) return;

        // Create a new user message object.
        const newUserMessage = { role: 'user', content: prompt };
        // We create a new array with the old messages and the new user message.
        // This is crucial in React: always create a new state object/array, don't mutate the old one.
        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages); // Update the state to display the user's message.
        setIsLoading(true); // Show a loading indicator.

        try {
            // Call the `generateResponse` API function.
            await generateResponse(selectedModel, updatedMessages, (streamedText) => {
                let filteredText = streamedText;

                // This is the client-side filtering logic for the "thinking" part.
                // We check the `showThinking` state.
                if (!showThinking) {
                    // We use a regular expression to find the `<think>` block and remove it.
                    // `[\s\S]*?` is a non-greedy match for any characters, including newlines.
                    filteredText = streamedText.replace(/<think>[\s\S]*?<\/think>/g, '');
                }

                // We update the messages state with the streamed response.
                // We use a functional update (`prevMessages => ...`) to ensure we are
                // working with the latest state, which is important for real-time streaming.
                setMessages(prevMessages => {
                    const lastMessage = prevMessages[prevMessages.length - 1];
                    // If the last message is from the assistant, we update its content.
                    if (lastMessage.role === 'assistant') {
                        return [...prevMessages.slice(0, -1), { ...lastMessage, content: filteredText }];
                    } else {
                        // Otherwise, we create a new assistant message.
                        return [...prevMessages, { role: 'assistant', content: filteredText }];
                    }
                });
            });
        } catch (error) {
            console.error("Error generating response:", error);
            setMessages(prevMessages => [
                ...prevMessages,
                { role: 'assistant', content: `Error: Could not get a response from the model. ${error.message}` }
            ]);
        } finally {
            setIsLoading(false); // Hide the loading indicator.
        }
    };
    
    // Handler for the checkbox in the ModelSelector component.
    const handleToggleThinking = (e) => {
        // `e.target.checked` is a boolean value indicating if the checkbox is checked.
        setShowThinking(e.target.checked);
    };

    // The component's JSX structure. It's a mix of React Bootstrap components and our own.
    return (
        // `Container`, `Row`, `Col` are React Bootstrap components for a responsive grid layout.
        <Container fluid className="vh-100 p-0">
            <Row className="h-100">
                {/* The left sidebar column */}
                <Col md={3} className="bg-light p-4 d-flex flex-column">
                    <h4 className="text-center mb-4">Ollama Chat</h4>
                    {/* Conditional rendering: this `Alert` component will only be rendered if `apiError` is not null. */}
                    {apiError && <Alert variant="danger">{apiError}</Alert>}
                    {isLoading && !models.length && (
                        <div className="text-center my-5">
                            <Spinner animation="border" />
                            <p className="mt-2 text-muted">Connecting to Ollama server...</p>
                        </div>
                    )}
                    {/* The ModelSelector component is a child. We pass it data and functions as props. */}
                    <ModelSelector
                        models={models}
                        onSelectModel={setSelectedModel} // Passing a function to a child is a common pattern for "lifting state up".
                        selectedModel={selectedModel}
                        isLoading={isLoading}
                        showThinking={showThinking}
                        onToggleThinking={handleToggleThinking}
                    />
                </Col>
                
                {/* The main chat interface column */}
                <Col md={9} className="p-0 d-flex flex-column">
                    {selectedModel ? (
                        // If a model is selected, render the chat interface.
                        <ChatInterface
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            isLoading={isLoading}
                        />
                    ) : (
                        // Otherwise, display a placeholder message.
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

export default App; // We export the component so it can be used elsewhere in the application.