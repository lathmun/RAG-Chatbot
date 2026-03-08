// src/components/ChatInterface.js

import React, { useState, useRef, useEffect } from 'react';
import { Form, InputGroup, Button, Spinner } from 'react-bootstrap';
import { FaPaperPlane } from 'react-icons/fa'; // A library for adding icons
import 'bootstrap/dist/css/bootstrap.min.css';

const ChatInterface = ({ messages, onSendMessage, isLoading }) => {
    // `useState` for the input field. This creates a "controlled component" where
    // the input's value is always controlled by React state.
    const [inputValue, setInputValue] = useState('');

    // The `useRef` hook gives us a way to access a DOM element directly.
    // Unlike `useState`, updating a ref does NOT cause a component to re-render.
    // This is perfect for things like scrolling.
    const chatContainerRef = useRef(null);

    // This `useEffect` hook handles the side effect of auto-scrolling the chat window.
    // The dependency array `[messages]` means this effect will re-run
    // every time the `messages` state changes (i.e., a new message is added).
    useEffect(() => {
        if (chatContainerRef.current) {
            // `chatContainerRef.current` gives us direct access to the DOM element.
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // This function handles the form submission event.
    const handleSend = (e) => {
        // `e.preventDefault()` stops the browser's default behavior of reloading the page on form submission.
        e.preventDefault();
        if (inputValue.trim()) {
            // We call the `onSendMessage` prop (a function from the parent)
            // with the current value of the input field.
            onSendMessage(inputValue);
            setInputValue(''); // We reset the input field's value to an empty string.
        }
    };

    return (
        <div className="d-flex flex-column h-100">
            {/* We attach the `ref` to the chat window container. */}
            <div className="chat-window flex-grow-1 overflow-auto p-3" ref={chatContainerRef}>
                {/* We map over the `messages` prop to display each message. */}
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}>
                        <div className="message-content p-2 my-1 rounded shadow-sm">
                            <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> {msg.content}
                        </div>
                    </div>
                ))}
                {/* Conditional rendering for the loading spinner. */}
                {isLoading && (
                    <div className="text-center my-3">
                        <Spinner animation="border" size="sm" />
                        <span className="ms-2 text-muted">AI is thinking...</span>
                    </div>
                )}
            </div>
            {/* The chat input form. */}
            <Form onSubmit={handleSend} className="p-3 bg-light border-top">
                <InputGroup>
                    <Form.Control
                        type="text"
                        placeholder="Type your message..."
                        // The `value` prop is bound to our `inputValue` state, making this a controlled component.
                        value={inputValue}
                        // The `onChange` handler updates the state with the new input value.
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isLoading}
                    />
                    <Button variant="primary" type="submit" disabled={isLoading}>
                        <FaPaperPlane />
                    </Button>
                </InputGroup>
            </Form>
        </div>
    );
};

export default ChatInterface;