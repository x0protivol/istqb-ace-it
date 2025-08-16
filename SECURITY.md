# API Key Security & Rotation

- Never commit API keys to source control. `.env` and `*.env` files are now ignored by `.gitignore`.
- If a key is exposed or suspected to be exposed:
  1. Revoke the key in the provider’s dashboard.
  2. Create a new key.
  3. Update `.env` locally and redeploy/restart the agent.
- Providers used: Groq, OpenAI, Tavily, Jina, Qdrant, Supabase.
- Rotate keys periodically and use different keys per environment if possible.