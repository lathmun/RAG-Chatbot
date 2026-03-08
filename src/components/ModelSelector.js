// src/components/ModelSelector.js

import React from 'react';
import { Card, Button, ListGroup, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// This is a functional component. It takes a single argument, `props`,
// which is an object containing all the data and functions passed from the parent.
// We are using ES6 destructuring here to pull out the props we need.
const ModelSelector = ({ models, onSelectModel, selectedModel, isLoading, showThinking, onToggleThinking }) => {
    return (
        // The component returns JSX.
        <Card className="p-3 shadow-sm" style={{ minWidth: '300px' }}>
            <Card.Title className="text-center">Available Models</Card.Title>
            <ListGroup variant="flush">
                {/* This is how we render a list in React.
                We use JavaScript's `.map()` method on the `models` array.
                The `.map()` returns a new array of JSX elements. */}
                {models.length > 0 ? (
                    models.map((model) => (
                        // The `key` prop is a special prop that helps React identify which
                        // items in a list have changed, are added, or are removed. It should be a unique value.
                        <ListGroup.Item
                            key={model.name}
                            action
                            active={model.name === selectedModel}
                            // The `onClick` handler is a function that will be executed when the item is clicked.
                            // We are passing an arrow function that calls the `onSelectModel` prop with the model's name.
                            onClick={() => onSelectModel(model.name)}
                            className="d-flex justify-content-between align-items-center"
                        >
                            {model.name}
                            {/* Conditional rendering of a badge */}
                            {model.name === selectedModel && (
                                <span className="badge bg-primary rounded-pill">Selected</span>
                            )}
                        </ListGroup.Item>
                    ))
                ) : (
                    // This is also conditional rendering: if the `models` array is empty, show this message.
                    <ListGroup.Item>
                        No models found. Run `ollama pull &lt;model_name&gt;` to get started.
                    </ListGroup.Item>
                )}
            </ListGroup>

            {/* This block is only rendered if a `selectedModel` exists. */}
            {selectedModel && (
                <>
                    {/* A `<Form.Check>` is a Bootstrap-styled checkbox. */}
                    <hr className="my-3" />
                    <Form.Check
                        type="switch"
                        id="show-thinking-switch"
                        label="Show Thinking Process"
                        // The `checked` prop is controlled by the `showThinking` prop from the parent.
                        // This makes it a "controlled component."
                        checked={showThinking}
                        // The `onChange` prop calls the `onToggleThinking` function prop from the parent.
                        // This is how the child component tells the parent to update its state.
                        onChange={onToggleThinking}
                        className="mb-3"
                    />
                    <Button
                        variant="success"
                        className="mt-3"
                        disabled={isLoading}
                        // This button re-selects the model, which isn't strictly necessary but is a safety net.
                        onClick={() => onSelectModel(selectedModel)}
                    >
                        {isLoading ? "Loading..." : `Select ${selectedModel}`}
                    </Button>
                </>
            )}
        </Card>
    );
};

export default ModelSelector;