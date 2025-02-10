"use client"

import Image from "next/image";
import F1Logo from "./assets/F1Logo.png";
import { useChat } from "ai/react";
import { Message } from "ai";
import Bubble from "./components/Bubble"
import LoadingBubble from "./components/LoadingBubble"
import PromptSuggestionsRow from "./components/PromptSuggestionsRow"

const Home = () => {
    const {append, isLoading, messages, input, handleInputChange, handleSubmit } = useChat();

    const noMessages = !messages || messages.length === 0;

    const handlePrompt = (promptText) => {
        const msg: Message = {
            id: crypto.randomUUID(),
            content: promptText,
            role: "user"
        }
        append(msg);
    };

    return (
        <main>
            <Image className="logo-img" src={F1Logo} width="250" alt="F1-ChatBot logo."/>
            <section className={noMessages ? "" : "populated"}>
                {noMessages ? (
                    <>
                        <p className="starter-text">
                            Ask any F1 racing question.
                        </p>
                        <br/>
                        <PromptSuggestionsRow onPromptClick={handlePrompt}/>
                    </>
                ) : (
                    <>
                        {messages.map((message, index) => <Bubble key={`message-${index}`} message={message}/>)}
                        {isLoading && <LoadingBubble/>}
                    </>
                )}
            </section>
            <form onSubmit={handleSubmit}>
                <input className="question-box" onChange={handleInputChange} value={input} placeholder="Ask any questions..."/>
                <input type="submit"/>
            </form>
        </main>
    );
}

export default Home;
