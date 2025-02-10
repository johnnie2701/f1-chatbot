import PromptSuggestionButton from "./PrompSuggestionButton";

const PromptSuggestionsRow = ({ onPromptClick }) => {
    const prompts = [
        "Who is the newst driver for Ferrari?",
        "Who is the 2024 Formula One World Driver's Champion?",
        "Who is the oldest Formula One driver for the next season?",
        "For which Formula One team will Carlos Sainz drive next season?"
    ]

    return (
        <div className="prompt-suggestion-row">
            {prompts.map((prompt, index) =>
                <PromptSuggestionButton
                    key={`suggestion-${index}`}
                    text={prompt}
                    onClick={() => onPromptClick(prompt)}
                />)}
        </div>
    );
}

export default PromptSuggestionsRow;