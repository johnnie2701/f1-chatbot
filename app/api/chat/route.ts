import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";
import { convertToCoreMessages, streamText  } from "ai";
import { google } from "@ai-sdk/google";

const { PINECONE_API_KEY, GEMINI_API_KEY } = process.env;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004"});

const pc = new Pinecone({ apiKey: PINECONE_API_KEY});

export async function POST(req: Request) {
    console.log("POST request");
    try {
        const { messages } = await req.json();
        const latestMessage = messages[messages.length - 1]?.content;

        let docContext = "";

        const embedRes = await embeddingModel.embedContent(latestMessage);

        try {
            const index = pc.index("f1-chatbot");
            const queryResult = await index.namespace("f1-latest").query({
                topK: 10,
                vector: embedRes.embedding.values,
                includeMetadata: true
            });

            const matches = queryResult.matches || [];

            type Metadata = {
                text: string,
                url: string
            }

            const docs = matches.map((match) => (match.metadata as Metadata).text);
            docContext = docs.join("\n").substring(0, 6000);

        } catch (error) {
            console.log("Error querying PineconeDB!", error);
            docContext = "";
        }

        const coreMessages = convertToCoreMessages(messages);

        const template = {
            role: "sytem",
            content: `You are an AI assistant who knows everything about Formula One.
            Use your knowladge base to answare the question.
            QUESTION: ${latestMessage}
            CONTEXT:
            ${docContext}
            `
        };

        const result  = streamText({
            model: google("gemini-2.0-flash"),
            system: template.content,
            messages: coreMessages
        })

        return result.toDataStreamResponse({});
    } catch (error) {
        console.log("Error while calling Gemini!", error);
        throw error;
    }
}
