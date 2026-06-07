# mcp-openligadb

OpenLigaDB MCP — community-run, keyless football / soccer match data.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 764+ live data sources.

## Tools

| Tool | Description |
|------|-------------|

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

Or connect to the full Pipeworx gateway for access to all 764+ data sources:

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

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
