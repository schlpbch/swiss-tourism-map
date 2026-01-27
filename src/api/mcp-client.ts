/**
 * MCP Client for connecting to swiss-tourism-mcp server
 * Uses Streamable HTTP transport (JSON-RPC over HTTP with SSE)
 */

// Use local proxy in development to avoid CORS issues
// In production, use the direct URL or configure your server to proxy
const MCP_SERVER_URL = import.meta.env.DEV
  ? '/mcp'  // Proxied through Vite dev server
  : (import.meta.env.PUBLIC_MCP_SERVER_URL || 'https://swiss-tourism-mcp.fastmcp.app/mcp');

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

interface McpToolCallResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

let requestId = 0;
let sessionId: string | null = null;

function getNextId(): number {
  return ++requestId;
}

/**
 * Send a JSON-RPC request to the MCP server
 */
async function sendRequest<T>(method: string, params?: Record<string, unknown>): Promise<T> {
  const request: JsonRpcRequest = {
    jsonrpc: '2.0',
    id: getNextId(),
    method,
    params,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream',
  };

  if (sessionId) {
    headers['Mcp-Session-Id'] = sessionId;
  }

  const response = await fetch(MCP_SERVER_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });

  // Check for session ID in response headers
  const newSessionId = response.headers.get('Mcp-Session-Id');
  if (newSessionId) {
    sessionId = newSessionId;
  }

  const contentType = response.headers.get('Content-Type') || '';

  if (contentType.includes('text/event-stream')) {
    // Handle SSE response
    return handleSseResponse<T>(response);
  } else {
    // Handle regular JSON response
    const data = await response.json() as JsonRpcResponse<T>;

    if (data.error) {
      throw new Error(`MCP Error: ${data.error.message}`);
    }

    return data.result as T;
  }
}

/**
 * Handle Server-Sent Events response
 */
async function handleSseResponse<T>(response: Response): Promise<T> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let result: T | null = null;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Parse SSE events
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data) {
          try {
            const parsed = JSON.parse(data) as JsonRpcResponse<T>;
            if (parsed.result !== undefined) {
              result = parsed.result;
            }
            if (parsed.error) {
              throw new Error(`MCP Error: ${parsed.error.message}`);
            }
          } catch (e) {
            if (e instanceof SyntaxError) {
              // Ignore JSON parse errors for incomplete data
              continue;
            }
            throw e;
          }
        }
      }
    }
  }

  if (result === null) {
    throw new Error('No result received from MCP server');
  }

  return result;
}

/**
 * Send a notification (no response expected)
 */
async function sendNotification(method: string, params?: Record<string, unknown>): Promise<void> {
  const request = {
    jsonrpc: '2.0' as const,
    method,
    params,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream',
  };

  if (sessionId) {
    headers['Mcp-Session-Id'] = sessionId;
  }

  await fetch(MCP_SERVER_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });
}

/**
 * Initialize the MCP connection
 */
export async function initializeMcp(): Promise<void> {
  try {
    console.log('MCP: Sending initialize request to', MCP_SERVER_URL);

    await sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        roots: { listChanged: false },
      },
      clientInfo: {
        name: 'swiss-tourism-map',
        version: '1.0.0',
      },
    });

    // Send initialized notification (no response expected)
    await sendNotification('notifications/initialized', {});

    console.log('MCP connection initialized successfully');
  } catch (error) {
    console.error('Failed to initialize MCP:', error);
    throw error;
  }
}

/**
 * Call an MCP tool
 */
export async function callTool<T = unknown>(name: string, args: Record<string, unknown> = {}): Promise<T> {
  const result = await sendRequest<McpToolCallResult>('tools/call', {
    name,
    arguments: args,
  });

  // Extract text content from the result
  if (result.content && result.content.length > 0) {
    const textContent = result.content.find(c => c.type === 'text');
    if (textContent?.text) {
      try {
        return JSON.parse(textContent.text) as T;
      } catch {
        return textContent.text as unknown as T;
      }
    }
  }

  return result as unknown as T;
}

/**
 * List available tools
 */
export async function listTools(): Promise<Array<{ name: string; description?: string }>> {
  const result = await sendRequest<{ tools: Array<{ name: string; description?: string }> }>('tools/list', {});
  return result.tools || [];
}

export default {
  initialize: initializeMcp,
  callTool,
  listTools,
};
