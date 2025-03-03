const axios = require('axios');

exports.handler = async function(event) {
  try {
    // Get query parameters from the request
    const params = event.queryStringParameters;
    const apiKey = process.env.API_KEY;
    
    // Build URL with the same parameters but using your server-side API key
    const url = `https://api.weatherapi.com/v1${params.endpoint}`;
    delete params.endpoint;  // Remove the custom endpoint parameter
    
    // Add API key to params
    params.key = apiKey;
    
    // Make the request from the server side
    const response = await axios.get(url, { params });
    
    // Return the response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};