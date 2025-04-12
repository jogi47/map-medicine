# Using MCP Inspector with Medicine MCP Server

The MCP Inspector is a powerful developer tool for testing and debugging MCP servers. This guide will help you set up and use the Inspector with the Medicine MCP Server.

## Prerequisites

- Node.js (v14 or higher)
- npm
- Medicine MCP Server project installed

## Installation

The MCP Inspector is already installed as a dev dependency in this project.

## Running the Inspector

We've added two convenient scripts to run the MCP Inspector with our server:

1. For the development server (using ts-node):
   ```bash
   npm run inspect-dev
   ```

2. For the built server (after running `npm run build`):
   ```bash
   npm run inspect
   ```

## Using the Inspector Interface

When you run the Inspector, it will launch a web-based interface in your browser. Here's how to use the main features:

### Server Connection Pane

- The Inspector automatically connects to your MCP server
- You can view server information, capabilities, and status
- If needed, you can reconnect to the server

### Resources Tab

In this tab, you can explore and test the medicine database resources:

- `medicine-db://all` - View all medicines
- `medicine-db://id/{id}` - Test fetching a specific medicine
- `medicine-db://symptom/{symptom}` - Search for medicines by symptom

To test a resource:
1. Select the resource from the list
2. Fill in any required parameters
3. Click "Read Resource"
4. View the returned content

### Tools Tab

In this tab, you can test the medicine database tools:

- `get-all-medicines` - Get all medicines
- `get-medicine-by-id` - Get a medicine by ID
- `get-medicines-by-symptom` - Get medicines for a symptom
- `add-medicine` - Add a new medicine
- `update-medicine` - Update an existing medicine
- `delete-medicine` - Delete a medicine

To test a tool:
1. Select the tool from the list
2. Fill in any required parameters as JSON
3. Click "Call Tool"
4. View the tool execution result

### Notifications Pane

The notifications pane shows:
- Logs from your server
- MCP notifications
- Any errors during operation

## Debugging Tips

1. **Test Tool Parameters**: Try both valid and invalid parameters to ensure proper validation
2. **Check Error Handling**: Verify that your server returns appropriate errors
3. **Resource Content**: Make sure resources return properly formatted data
4. **Watch the Logs**: The notification pane provides valuable debugging information

## Common Issues

- **Connection Errors**: Ensure your server is running
- **Parameter Validation**: Check that your Zod schemas match the Inspector's input
- **Content Type Issues**: Verify that your resources return the expected content types

## Additional Resources

- [MCP Inspector Documentation](https://modelcontextprotocol.io/docs/tools/inspector)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/docs/)

