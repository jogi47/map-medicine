#!/bin/bash
echo "Checking if server is running on port 3000..."
curl -s http://localhost:3000/health || echo "Server not running on port 3000"
