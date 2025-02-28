const fs = require('fs');

// Grab environment variables
const environmentVariables = process.env;

// Create environment.ts content
const environmentFileContent = `
export const environment = {
  production: true,
  apiUrl: '${environmentVariables.API_URL}',
  apiKey: '${environmentVariables.API_KEY}',
  // Add all your other environment variables here
};
`;

// Make sure directory exists
const directory = './src/environments';
if (!fs.existsSync(directory)) {
  fs.mkdirSync(directory, { recursive: true });
}

// Write environment file
fs.writeFileSync(
  `${directory}/environment.prod.ts`, 
  environmentFileContent
);

console.log('Environment file generated!');