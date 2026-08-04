# mcp-openligadb

OpenLigaDB MCP — community-run, keyless football / soccer match data.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `list_leagues` | List all available football / soccer leagues and seasons in OpenLigaDB (German football leagues like the Bundesliga, plus others). Returns league id, name, shortcut, season, and sport. |
| `get_matches` | Get football / soccer match results / scores and fixtures for a league and season (e.g. Bundesliga). Optionally narrow to a single matchday. Returns teams, kickoff datetime, final score, and whether each match is finished. |
| `get_table` | Get the league table / standings for a football / soccer league and season (e.g. the Bundesliga table). Returns each team's position, played, won, draw, lost, goals, goal difference, and points. |
| `current_matchday` | Get the current matchday's football / soccer matches (results / scores) for a league (e.g. this week's Bundesliga fixtures) in the current season. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "openligadb": {
      "url": "https://gateway.pipeworx.io/openligadb/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Openligadb data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
