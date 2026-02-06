/**
 * Environment variable validation and configuration
 */

interface EnvConfig {
  MCP_SERVER_URL: string;
  isDev: boolean;
}

/**
 * Validate and return environment configuration
 */
export function getEnvConfig(): EnvConfig {
  const isDev = import.meta.env.DEV;

  // In development, use proxy
  if (isDev) {
    return {
      MCP_SERVER_URL: '/mcp',
      isDev: true,
    };
  }

  // In production, require PUBLIC_MCP_SERVER_URL
  const mcpServerUrl = import.meta.env.PUBLIC_MCP_SERVER_URL;

  if (!mcpServerUrl) {
    const errorMessage =
      'Missing required environment variable: PUBLIC_MCP_SERVER_URL\n' +
      'Please set it in your .env file or deployment configuration.\n' +
      'Example: PUBLIC_MCP_SERVER_URL=https://swiss-tourism-mcp.fastmcp.app/mcp';

    console.error(errorMessage);
    throw new Error('Missing required environment variable: PUBLIC_MCP_SERVER_URL');
  }

  // Validate URL format
  try {
    new URL(mcpServerUrl);
  } catch {
    const errorMessage = `Invalid PUBLIC_MCP_SERVER_URL: ${mcpServerUrl}\nMust be a valid URL.`;
    console.error(errorMessage);
    throw new Error('Invalid PUBLIC_MCP_SERVER_URL format');
  }

  return {
    MCP_SERVER_URL: mcpServerUrl,
    isDev: false,
  };
}

/**
 * Get validated environment config (cached)
 */
let cachedConfig: EnvConfig | null = null;

export function getValidatedEnv(): EnvConfig {
  if (!cachedConfig) {
    cachedConfig = getEnvConfig();
  }
  return cachedConfig;
}
