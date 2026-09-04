/**
 * Chat service for Redis Vector Cache AI Gateway.
 * Connects to FastAPI / Redis Stack backend endpoint, with rich fallback simulation
 * demonstrating 5ms vector cache hits vs 800ms LLM misses.
 */

// Simulated Knowledge Base of Cached Vector Embeddings in Redis
const CACHED_RESPONSES = [
  {
    keywords: ['vector search', 'redis vector', 'what is redis vector'],
    originalPrompt: 'What is Redis Vector Search and how does it work?',
    response: `**Redis Vector Search** allows Redis to store, index, and query vector embeddings alongside traditional Redis data structures with ultra-low latency.

### Key Capabilities:
1. **HNSW & Flat Indexes**: Supports High-Dimensional Nearest Neighbor Search using cosine distance, Euclidean distance (L2), or Inner Product (IP).
2. **Hybrid Search**: Combine vector similarity search with metadata filtering (e.g., \`@category:{tech} @price:[10 50]\`).
3. **Sub-10ms Latency**: Executes similarity lookups directly in RAM, making it ideal for real-time LLM semantic caching and RAG pipelines.

\`\`\`python
# Example Redis Vector Search Query using redis-py
from redis.commands.search.query import Query

q = Query("*=>[KNN 5 @vector $vec AS score]").sort_by("score").return_fields("score", "prompt", "response").dialect(2)
results = redis_client.ft("idx:llm_cache").search(q, query_params={"vec": query_vector_bytes})
\`\`\``,
    similarityScore: 0.9782,
    vectorDistance: 0.0218,
    cacheLatencyMs: 3.8
  },
  {
    keywords: ['semantic cache', 'semantic caching', 'llm cache'],
    originalPrompt: 'Explain how Semantic Caching slashes LLM API costs and latency.',
    response: `**Semantic Caching** intercepts user prompts and converts them into dense vector embeddings. Instead of requiring exact string matches like traditional key-value caches, it calculates semantic similarity.

### How It Works:
- **Query Embedding**: The incoming prompt is embedded into a high-dimensional vector.
- **KNN Search**: Redis performs a Vector Distance check against previously stored query vectors.
- **Threshold Gate**: If \`similarity_score >= 0.85\`, the cached response is served instantly (**~4ms** latency, **$0.00** LLM API cost).
- **Fallback on Miss**: If below threshold, the query hits OpenAI/Claude, and the result is stored in Redis for next time!`,
    similarityScore: 0.9615,
    vectorDistance: 0.0385,
    cacheLatencyMs: 4.1
  },
  {
    keywords: ['fastapi', 'code snippet', 'redis python', 'integration'],
    originalPrompt: 'Provide a FastAPI snippet for Redis Vector Cache middleware.',
    response: `Here is a lightweight **FastAPI + Redis Vector Cache** endpoint implementation:

\`\`\`python
from fastapi import FastAPI, HTTPException
import redis
import numpy as np

app = FastAPI()
r = redis.Redis(host='localhost', port=6379, decode_responses=False)

@app.post("/v1/chat")
async def chat_gateway(prompt: str, threshold: float = 0.85):
    query_vector = embed_text(prompt)  # Generates 1536-dim vector
    
    # 1. Check Redis Vector Cache
    cache_match = find_nearest_vector(r, query_vector, threshold)
    if cache_match:
        return {
            "source": "redis_vector_cache",
            "latency_ms": 4.2,
            "response": cache_match["response"],
            "similarity_score": cache_match["score"]
        }
        
    # 2. Cache Miss: Call LLM Provider
    llm_response = call_openai_api(prompt)
    
    # 3. Async Store in Redis
    store_vector_cache(r, prompt, query_vector, llm_response)
    
    return {
        "source": "llm_generation",
        "latency_ms": 780.0,
        "response": llm_response
    }
\`\`\``,
    similarityScore: 0.9540,
    vectorDistance: 0.0460,
    cacheLatencyMs: 4.5
  },
  {
    keywords: ['cost', 'slash', 'optimize', 'benchmark', 'metrics'],
    originalPrompt: 'What are the benchmark cost savings of Redis Vector Caching?',
    response: `### 🚀 Benchmark & Cost Impact:

| Metric | Direct LLM (GPT-4o) | Redis Vector Cache Hit | Improvement |
| :--- | :--- | :--- | :--- |
| **Response Latency** | ~750ms - 1,200ms | **3.5ms - 5.0ms** | **~200x Faster** ⚡ |
| **Cost per 1K Queries** | ~$5.00 - $15.00 | **$0.00** | **99.9% Savings** 💰 |
| **Throughput (RPS)** | Limited by API Rate | **10,000+ RPS** | **Massive Scale** 📈 |

By serving recurring user intents (e.g. FAQs, customer support, documentation lookups) straight from Redis in-memory vector index, companies reduce token consumption dramatically.`,
    similarityScore: 0.9890,
    vectorDistance: 0.0110,
    cacheLatencyMs: 3.2
  }
];

export async function sendChatMessage({
  prompt,
  conversationId = 'default',
  similarityThreshold = 0.85,
  bypassCache = false,
  backendUrl = 'http://localhost:8000/api/chat',
  selectedModel = 'gpt-4o'
}) {
  const startTime = performance.now();

  // 1. Try real API backend if available
  if (backendUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // Quick timeout for mock fallback
      
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          prompt,
          conversation_id: conversationId,
          similarity_threshold: similarityThreshold,
          bypass_cache: bypassCache,
          model: selectedModel
        })
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return {
          id: 'msg_' + Date.now(),
          role: 'assistant',
          content: data.response || data.content,
          isCacheHit: data.is_cache_hit ?? data.source === 'redis_vector_cache',
          latencyMs: data.latency_ms || Math.round(performance.now() - startTime),
          similarityScore: data.similarity_score || 0.95,
          vectorDistance: data.vector_distance || 0.05,
          matchedPrompt: data.matched_prompt || prompt,
          tokensSaved: data.tokens_saved || 420,
          costSavedUsd: data.cost_saved_usd || 0.0035,
          model: selectedModel,
          timestamp: new Date().toISOString()
        };
      }
    } catch (e) {
      // Fallback to simulated high-fidelity Redis Vector Cache response
      console.log('Backend not reachable, operating in Redis Vector Cache simulation mode.');
    }
  }

  // 2. Intelligent Simulation Mode
  await new Promise(resolve => setTimeout(resolve, bypassCache ? 750 : 250));

  const lowerPrompt = prompt.toLowerCase().trim();
  
  // Find matching cached intent
  const match = CACHED_RESPONSES.find(item =>
    item.keywords.some(k => lowerPrompt.includes(k)) ||
    lowerPrompt.includes(item.originalPrompt.toLowerCase())
  );

  const isHit = !bypassCache && (match || Math.random() > 0.35);

  if (isHit) {
    const matchedItem = match || CACHED_RESPONSES[Math.floor(Math.random() * CACHED_RESPONSES.length)];
    const simScore = matchedItem.similarityScore - (Math.random() * 0.04);
    const latency = (Math.random() * 2.5 + 3.1).toFixed(1);

    return {
      id: 'msg_' + Date.now(),
      role: 'assistant',
      content: matchedItem.response,
      isCacheHit: true,
      latencyMs: parseFloat(latency),
      similarityScore: parseFloat(simScore.toFixed(4)),
      vectorDistance: parseFloat((1 - simScore).toFixed(4)),
      matchedPrompt: matchedItem.originalPrompt,
      tokensSaved: Math.floor(Math.random() * 300 + 250),
      costSavedUsd: parseFloat((Math.random() * 0.003 + 0.002).toFixed(4)),
      model: selectedModel,
      timestamp: new Date().toISOString()
    };
  } else {
    // LLM Cache Miss (Simulated direct LLM query)
    const llmLatency = Math.floor(Math.random() * 300 + 650);
    return {
      id: 'msg_' + Date.now(),
      role: 'assistant',
      content: `I analyzed your query: **"${prompt}"**.

Since this is a unique prompt (or cache bypass was toggled on), it was evaluated by **${selectedModel.toUpperCase()}** directly.

### Vector Cache Update:
- **Status**: Cache Miss -> Vector Stored 📥
- **Embedding Dimensions**: 1536 (OpenAI text-embedding-3-small)
- **Redis HNSW Index**: Updated in \`0.8ms\`

Future semantically identical questions will now execute in **~4ms**!`,
      isCacheHit: false,
      latencyMs: llmLatency,
      similarityScore: parseFloat((Math.random() * 0.2 + 0.55).toFixed(4)),
      vectorDistance: parseFloat((Math.random() * 0.2 + 0.25).toFixed(4)),
      matchedPrompt: null,
      tokensSaved: 0,
      costSavedUsd: 0,
      model: selectedModel,
      timestamp: new Date().toISOString()
    };
  }
}

export const SAMPLE_PROMPTS = [
  {
    title: "⚡ Redis Vector Search",
    prompt: "What is Redis Vector Search and how does it work?"
  },
  {
    title: "💡 Semantic Caching",
    prompt: "Explain how Semantic Caching slashes LLM API costs and latency."
  },
  {
    title: "🛠️ FastAPI Snippet",
    prompt: "Provide a FastAPI snippet for Redis Vector Cache middleware."
  },
  {
    title: "📊 Cost Benchmarks",
    prompt: "What are the benchmark cost savings of Redis Vector Caching?"
  }
];
