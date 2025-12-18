#!/bin/bash

# Make sure we are in the project root
cd "$(dirname "$0")/.."

echo "Generating Swagger docs..."

# Run Node.js generator script
npx ts-node scripts/swagger-generator.ts

echo "Swagger docs generated at src/docs/generated-swagger.json"
