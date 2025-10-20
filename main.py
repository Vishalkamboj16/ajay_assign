import os
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# --- AI & DB Imports ---
import pinecone
from sentence_transformers import SentenceTransformer
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
from langchain_core.output_parsers import StrOutputParser

# --------------------------------------------------------
# APP INITIALIZATION
# --------------------------------------------------------

# Load environment variables from .env file
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Product Recommendation API",
    description="API for furniture product recommendations and analytics.",
    version="1.0.0",
)

# Enable CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------------
# AI & DATABASE INITIALIZATION
# --------------------------------------------------------

# Initialize Pinecone client
pc = pinecone.Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Connect to the correct index
INDEX_NAME = "product"
index = pc.Index(INDEX_NAME)

# Load the multimodal embedding model
embedding_model = SentenceTransformer('clip-ViT-B-32')

# Initialize LangChain LLM (OpenAI)
llm = OpenAI(
    temperature=0.7,
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

# Define product description generation prompt
prompt_template = PromptTemplate(
    input_variables=["product_name", "product_desc"],
    template=(
        "Generate a short, creative, and appealing product description for a '{product_name}'. "
        "The original description is: '{product_desc}'. "
        "Make it sound luxurious and inviting for a modern home."
    )
)

# Use LangChain Expression Language (LCEL)
description_chain = prompt_template | llm | StrOutputParser()

# --------------------------------------------------------
# DATA MODELS (Pydantic)
# --------------------------------------------------------

class QueryRequest(BaseModel):
    query: str
    top_k: int = 5


class Product(BaseModel):
    id: str
    name: str
    imageUrl: str
    description: str
    generatedDescription: str

# --------------------------------------------------------
# API ENDPOINTS
# --------------------------------------------------------

@app.get("/")
def read_root():
    """Root endpoint to confirm API is running."""
    return {"status": "API is running."}


@app.post("/recommend", response_model=list[Product])
async def recommend_products(request: QueryRequest):
    """
    Accepts a user query, embeds it, and returns top_k similar products from the vector DB.
    Also generates a new creative description for each product.
    """
    # Convert user query into an embedding vector
    query_embedding = embedding_model.encode(request.query).tolist()

    # Query Pinecone for similar items
    results = index.query(
        vector=query_embedding,
        top_k=request.top_k,
        include_metadata=True
    )

    # Prepare product recommendations
    recommendations = []
    for match in results['matches']:
        metadata = match['metadata']

        creative_description = description_chain.invoke({
            "product_name": metadata.get('title', 'N/A'),
            "product_desc": metadata.get('description', '')
        })

        recommendations.append(
            Product(
                id=match['id'],
                name=metadata.get('title', 'N/A'),
                imageUrl=metadata.get('images', ''),
                description=metadata.get('description', ''),
                generatedDescription=creative_description.strip()
            )
        )

    return recommendations


@app.get("/analytics")
async def get_analytics():
    """
    Reads the cleaned dataset and returns key analytics.
    """
    try:
        df = pd.read_csv("./data/intern_data_ikarus.csv")

        # --- Category Analysis ---
        if 'categories' in df.columns:
            df['main_category'] = df['categories'].apply(
                lambda x: x.split('>')[0].strip() if isinstance(x, str) else 'Unknown'
            )
            category_counts = df['main_category'].value_counts().to_dict()
        else:
            category_counts = {"error": "Categories column not found"}

        # --- Price Analysis ---
        if 'price' in df.columns:
            df['price'] = df['price'].astype(str).str.replace(r'[^\d.]', '', regex=True)
            df['price'] = pd.to_numeric(df['price'], errors='coerce')

            # Compute and clean stats for JSON serialization
            price_stats = df['price'].describe().to_dict()
            for key, value in price_stats.items():
                if pd.isna(value):
                    price_stats[key] = None
        else:
            price_stats = {"error": "Price column not found"}

        return {
            "product_count": len(df),
            "category_distribution": category_counts,
            "price_statistics": price_stats,
        }

    except FileNotFoundError:
        return {"error": "Analytics data file not found."}

# --------------------------------------------------------
# END OF FILE
# --------------------------------------------------------
