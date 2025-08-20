# RAG (Retrieval Augmented Generation) Web Application

A powerful web application that combines document indexing, vector search, and AI-powered question answering to help you interact with your data intelligently.

## 🚀 Features

### Document Processing & Indexing
- **Multi-format Support**: Upload and process PDF files, plain text, and website content
- **Smart Text Chunking**: Automatically splits documents into optimal chunks for better retrieval
- **Website Crawling**: Index content from websites with configurable depth
- **Vector Storage**: Uses Qdrant vector database for efficient similarity search

### AI-Powered Querying
- **Intelligent Q&A**: Ask questions about your indexed documents in natural language
- **Context-Aware Responses**: Maintains conversation history for better context understanding
- **Relevant Document Retrieval**: Finds and uses the most relevant document chunks to answer queries
- **Multiple Collections**: Organize documents into separate collections for different topics

### Collection Management
- **Create Collections**: Group related documents together
- **View Collections**: List all available document collections
- **Delete Collections**: Remove collections and their associated data
- **Conversation History**: Track all questions and answers for each collection
- **Clear Chat History**: Reset conversation history while keeping documents intact

## 🛠️ Technology Stack

### Backend
- **Express.js**: RESTful API server
- **LangChain**: Document processing and AI integration
- **Azure OpenAI**: Text embeddings for vector search
- **Gemini 2.5 Flash**: Large language model for generating responses
- **Qdrant**: Vector database for document storage and similarity search

### Document Processing
- **PDF Processing**: Extract text from PDF documents
- **Web Scraping**: Recursive URL loading with HTML-to-text conversion

## 📋 API Endpoints

### Document Indexing
- `POST /index` - Upload and index documents (PDFs, text, or websites)

### Querying
- `POST /query` - Ask questions about indexed documents
- `GET /get-messages` - Retrieve conversation history for a collection

### Collection Management
- `GET /get-collections` - List all available collections
- `POST /clear-messages` - Clear chat history for a collection
- `DELETE /delete-collection` - Delete a collection and its data

## 🔧 Setup & Configuration

### Installation
```bash
npm install
npm start
```

## 💡 Use Cases

- **Research Assistant**: Upload research papers and ask specific questions
- **Document Analysis**: Analyze business documents, contracts, or reports
- **Knowledge Base**: Create searchable knowledge bases from multiple sources
- **Website Content Q&A**: Index website content and provide intelligent customer support
- **Educational Tool**: Upload course materials and get instant answers to study questions

## 🎯 How It Works

1. **Upload**: Add documents through file upload, direct text input, or website URLs
2. **Process**: Documents are automatically chunked and converted to vector embeddings
3. **Store**: Vectors are stored in Qdrant collections for fast similarity search
4. **Query**: Ask natural language questions about your documents
5. **Retrieve**: The system finds relevant document chunks using vector similarity
6. **Generate**: AI generates contextual answers based on retrieved information

## 🔒 Features

- **File Upload Limits**: Maximum 3 files per upload
- **Conversation Memory**: Maintains chat history for context-aware responses
- **Automatic Cleanup**: Temporary files are automatically deleted after processing