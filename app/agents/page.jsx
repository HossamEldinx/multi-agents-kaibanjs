"use client";

import React, { useState } from "react";
import { FaLightbulb, FaPaperPlane, FaSpinner } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "./page.css";

export default function AgentPage() {
    const [topic, setTopic] = useState("");
    const [blogPost, setBlogPost] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateBlogPost = async () => {
        if (!topic) {
            alert("Please enter a topic");
            return;
        }

        setIsLoading(true);
        setError(null);
        setBlogPost("");

        try {
            const response = await fetch(
                `/api/agents?topic=${encodeURIComponent(topic)}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (data.output) {
                // Replace single and double newlines with markdown line breaks
                const formattedBlogPost = data.output
                    .replace(/\\n/g, "\n") // Convert \n to actual newlines
                    .replace(/\n\n/g, "\n\n&nbsp;\n\n"); // Add spacing for double newlines
                setBlogPost(formattedBlogPost);
            } else {
                setError(data.message || "Failed to generate blog post");
            }
        } catch (error) {
            console.error("Error generating blog post:", error);
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="ai-blog-container">
            <div className="ai-blog-wrapper">
                <h1 className="ai-blog-title">AI Blog Generator</h1>

                <div className="ai-blog-card">
                    <div className="input-container">
                        <div className="input-wrapper">
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Enter a topic... E.g. 'AI News Sep, 2024'"
                                className="topic-input"
                                onKeyPress={(e) =>
                                    e.key === "Enter" && generateBlogPost()
                                }
                            />
                        </div>
                        <button
                            onClick={generateBlogPost}
                            disabled={isLoading}
                            className={`generate-button ${
                                isLoading ? "disabled" : ""
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <FaSpinner className="mr-2 animate-spin" />{" "}
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <FaPaperPlane className="mr-2" /> Generate
                                </>
                            )}
                        </button>
                    </div>

                    {isLoading && (
                        <div className="loading-spinner">
                            <FaSpinner className="mx-auto text-2xl animate-spin" />
                            <p className="mt-2">Generating blog post...</p>
                        </div>
                    )}

                    {error && <div className="error-message">{error}</div>}

                    {blogPost && (
                        <div className="blog-post-section">
                            <h2 className="blog-post-title">
                                Generated Blog Post
                            </h2>
                            <div className="blog-post-content">
                                <div className="markdown">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeRaw]}
                                    >
                                        {blogPost}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    )}

                    {searchResults.length > 0 && (
                        <div className="search-results-section">
                            <h2 className="search-results-title">
                                Search Results
                            </h2>
                            <div className="space-y-2">
                                {searchResults.map((result, index) => (
                                    <div
                                        key={index}
                                        className="search-result-item"
                                    >
                                        <h3 className="search-result-title">
                                            {result.title}
                                        </h3>
                                        <p className="search-result-snippet">
                                            {result.snippet}
                                        </p>
                                        {result.url && result.url !== "#" && (
                                            <a
                                                href={result.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="search-result-link"
                                            >
                                                Read more
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
