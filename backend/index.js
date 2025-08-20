import express from "express";
import cors from "cors";
import multer from "multer";
import "dotenv/config";
import { AzureOpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { RecursiveUrlLoader } from "@langchain/community/document_loaders/web/recursive_url";
import { compile } from "html-to-text";
import { RAG_SYSTEM_PROMPT } from "./constants.js";
import { OpenAI } from "openai";
import { QdrantClient } from "@qdrant/js-client-rest";
import fs from "fs";
import { queryParser } from "express-query-parser";

//middleware
import { upload } from "./middleware/multer.middleware.js";

const port = process.env.PORT || 8000;

const app = express();

app.use(express.json());
app.use(cors());
app.use(
  queryParser({
    parseNull: true,
    parseUndefined: true,
    parseBoolean: true,
    parseNumber: true,
  })
);

//messages for all collections
const collectionMessages = {};

//creating index
app.post("/index", upload.array("files", 3), async (req, res, next) => {
  const { text, collectionName, websiteLink } = req.body;
  const files = req.files;

  try {
    //create embeddings client
    const embeddings = new AzureOpenAIEmbeddings({
      azureOpenAIApiKey: process.env.AZURE_OPENAI_KEY,
      azureOpenAIApiInstanceName: "openai-testing-transcription",
      azureOpenAIApiEmbeddingsDeploymentName: "text-embedding-3-large",
      azureOpenAIApiVersion: "2024-02-01",
    });

    var documents = [];

    //Step 1 -> index text
    if (text) {
      //read and chunk documents
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 30,
      });

      const subDocuments = await textSplitter.createDocuments([text]);
      documents.push(...subDocuments);
      console.log("text processed");
    }

    //Step 2 -> index files
    if (files) {
      for (const fileObj of files) {
        const loader = new PDFLoader(fileObj.path);
        const docsPerFile = await loader.load();
        documents.push(...docsPerFile);

        // delete file
        fs.unlinkSync(fileObj.path);
      }
      console.log("files processed");
    }

    //Step 3 -> index content from website link
    if (websiteLink) {
      const compiledConvert = compile({
        wordwrap: 130,
        tables: true,
      });

      const loader = new RecursiveUrlLoader(websiteLink, {
        extractor: compiledConvert,
        maxDepth: 1,
      });

      const subDocuments = await loader.load();
      const textSplitter = new RecursiveCharacterTextSplitter();
      console.log(`Sub documents - ${subDocuments.length}`);
      const subDocumentsSplitted = await textSplitter.splitDocuments(
        subDocuments
      );
      console.log(`Splitted sub documents - ${subDocumentsSplitted.length}`);
      documents.push(...subDocumentsSplitted);
    }

    //upload documents to vector db

    const vectorStore = await QdrantVectorStore.fromDocuments(
      documents,
      embeddings,
      {
        url: process.env.QDRANT_URL,
        //   apiKey: process.env.QDRANT_API_KEY,
        collectionName: collectionName,
      }
    );
    console.log(`added to  collection - ${collectionName}`);

    //add key to messages with empty array
    if (!collectionMessages.hasOwnProperty(collectionName)) {
      collectionMessages[collectionName] = [];
    }

    res.json({ message: "vectors added" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error });
  }
});

//querying a collection
app.post("/query", async (req, res) => {
  const { query, collectionName } = req.body;

  try {
    //embedding
    const embeddings = new AzureOpenAIEmbeddings({
      azureOpenAIApiKey: process.env.AZURE_OPENAI_KEY,
      azureOpenAIApiInstanceName: "openai-testing-transcription",
      azureOpenAIApiEmbeddingsDeploymentName: "text-embedding-3-large",
      azureOpenAIApiVersion: "2024-02-01",
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL,
        //   apiKey: process.env.QDRANT_API_KEY,
        collectionName: collectionName,
      }
    );

    const retriever = vectorStore.asRetriever(3);

    const relevantDocs = await retriever.invoke(query);

    if (!relevantDocs) {
      res.status(500).json({ message: "No similar data found" });
    }

    //answer query
    const client = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: process.env.GEMINI_BASE_URL,
    });

    console.log(RAG_SYSTEM_PROMPT + JSON.stringify(relevantDocs, null, 2));

    const response = await client.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `${RAG_SYSTEM_PROMPT}

          Conversation history until now:
          ${collectionMessages[collectionName]}

          Context:
          ${JSON.stringify(relevantDocs, null, 2)}
          `,
        },
        {
          role: "user",
          content: query,
        },
      ],
    });

    const answer = response.choices[0].message.content;

    //push query and answer to messages for that collection
    collectionMessages[collectionName].push({ role: "user", content: query });
    collectionMessages[collectionName].push({
      role: "assistant",
      content: answer,
    });

    res.status(200).json({ query: query, answer: answer, success: true });
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

//get collection names
app.get("/get-collections", async (req, res) => {
  try {
    res.json({ collections: Object.keys(collectionMessages) });
  } catch (error) {
    res.json({ messaage: error });
  }
});

//get all messages for given collectionName
app.get("/get-messages", async (req, res) => {
  const { collectionName } = req.query;

  try {
    if (!collectionName) {
      res.status(400).json({ message: "No such collection exists" });
    }
    const collectionMessageArray = collectionMessages[collectionName];

    res.json({ messages: collectionMessageArray });
  } catch (error) {
    res.json({ messaage: error });
  }
});

//clear messages of a collection
app.post("/clear-messages", async (req, res) => {
  const { collectionName } = req.body;

  try {
    collectionMessages[collectionName] = [];

    res.json({ messages: collectionMessages[collectionName], success: true });
  } catch (error) {
    res.json({ messaage: error });
  }
});

//delete collection from the db
app.delete("/delete-collection", async (req, res) => {
  const { collectionName } = req.body;

  try {
    const qdrantClient = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });

    const result = await qdrantClient.deleteCollection(collectionName);

    console.log("Collection deleted");
    delete collectionMessages[collectionName];

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
