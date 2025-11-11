# LeAgentDiary

LeAgentDiary is a **version controller for agents**: a place to save, reuse, and evolve your AI agents across projects. It connects your handoffs and logs (via the HTDI Agentic Framework) into a single interface where you can:

- Track contributions per agent and session  
- Re-summon previous agents with their context and history  
- Let agents grow through memory, self-reflection, and iteration  
- Attach smart 3D personas, either self-chosen or assigned at creation  

LeAgentDiary sits at the intersection of **HCI research**, **agentic workflows**, and **developer tooling**. It borrows the best ideas from version control systems (like Git) and applies them to **multi-agent ecosystems**: handoffs become commits, agents become contributors, and your lab turns into a navigable history of decisions, experiments, and narratives.

## Why this exists

Modern agent systems are powerful but ephemeral:
- Agent prompts get lost in chats.
- Handoffs live in random docs.
- There’s no canonical view of *who* did *what*, *when*, and *why*.

LeAgentDiary turns that chaos into an explicit, inspectable system:

- **HTDI Agentic Framework integration**  
  Use structured `HANDOFFS.md` files and agent logs as the backbone for your diary and dashboards.

- **Github-like history for agents**  
  Browse sessions as if they were commits, see which agents touched which files, and understand how your system evolved over time.

- **Reflection-first workflows**  
  Encourage agents to summarize, reflect, and propose next steps at the end of each session, making the system steadily more debuggable and learnable.

- **Room for narrative and personality**  
  While staying production-safe, LeAgentDiary lets agents keep self-chosen names, roles, and personas, so the ecosystem stays human-readable and memorable.

## Status

LeAgentDiary is currently an **MVP in active development**.  
The initial focus:

1. A timeline UI for visualizing agent sessions and handoffs  
2. A simple schema for `HANDOFFS.md` and agent logs  
3. Hooks for future integrations (MCP servers, RAG backends, 3D persona renderers)

Contributions, experiments, and weird ideas are welcome.
