import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { GoogleGenerativeAI } from "@google/generative-ai";
import md5 from "md5";
import "dotenv/config"

const { PINECONE_API_KEY, GEMINI_API_KEY } = process.env;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "text-embedding-004"});

const f1Data = [
    "https://en.wikipedia.org/wiki/Formula_One",
    "https://www.skysports.com/f1",
    "https://www.formula1.com/en/latest/all",
    "https://www.autosport.com/f1/",
    "https://www.formula1.com/en/latest/article/breaking-carlos-sainz-signs-for-williams-as-spaniards-f1-future-is-confirmed.2wsM0VoH6D7H2akmtW9uXe",
    "https://www.formula1.com/en/results/2024/drivers",
    "https://www.formula1.com/en/results/2023/drivers",
    "https://www.formula1.com/en/results/2024/team",
    "https://www.formula1.com/en/results/2023/team",
    "https://www.formula1.com/en/results/2025/team",
    "https://www.formula1.com/en/results/2025/drivers",
];

const pc = new Pinecone({ apiKey: PINECONE_API_KEY});
const index = pc.index("f1-chatbot");

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100
});

const loadSampleData = async () => {

    let vectors: PineconeRecord[] = [];

    for await (const url of f1Data) {
        const content = await scrapePage(url);
        const chunks = await splitter.splitText(content);
        const embeddings = await Promise.all(chunks.map(chunk => embedText(chunk, url)));
        vectors = vectors.concat(embeddings);
    }

    await index.namespace("f1-latest").upsert(vectors);
};

async function embedText(chunk: string, url: string) {
    try {
        // Use setTimeout to delay the call to model.embedContent to avoid RATE_LIMIT_EXCEEDED error
        const result = await new Promise((resolve) => {
            setTimeout(async () => {
                const embedResult = await model.embedContent(chunk);
                const hash = md5(chunk);

                resolve({
                    id: hash,
                    values: embedResult.embedding.values,
                    metadata: {
                        text: chunk,
                        url: url
                    }
                });
            }, 3000);
        });

        return result as PineconeRecord;

    } catch (error) {
        console.error("error embedding text", error);
        throw error;
    }
}

async function scrapePage(url: string) {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: {
            headless: true
        },
        gotoOptions: {
            waitUntil: "domcontentloaded"
        },
        evaluate: async (page, browser) => {
            const result = await page.evaluate(() => document.body.innerText);
            await browser.close();
            return result;
        }
    })

    return await loader.scrape();
}

loadSampleData();
