/**
 * Test API for Claude Skills via AI Gateway
 * Tests both with and without Skills enabled
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, model, modelName, useSkills, skillId } = req.body;

  if (!prompt || !model) {
    return res.status(400).json({ error: 'Missing prompt or model' });
  }

  const AI_GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions';
  const AI_GATEWAY_KEY = process.env.AI_GATEWAY_API_KEY;

  if (!AI_GATEWAY_KEY) {
    return res.status(500).json({ error: 'AI_GATEWAY_API_KEY not configured' });
  }

  try {
    // Build the request body
    const requestBody = {
      model: model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4096,
      temperature: 0.7
    };

    // Build headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_GATEWAY_KEY}`
    };

    // If using Skills, add the beta headers and container config
    if (useSkills && skillId) {
      // Add Anthropic beta headers
      headers['anthropic-beta'] = 'code-execution-2025-08-25,skills-2025-10-02,files-api-2025-04-14';
      
      // Add container with skills configuration
      requestBody.container = {
        skills: [
          {
            type: 'anthropic',
            skill_id: skillId,
            version: 'latest'
          }
        ]
      };

      // Add code execution tool (required for Skills)
      requestBody.tools = [
        {
          type: 'code_execution_20250825',
          name: 'code_execution'
        }
      ];
    }

    console.log('\n=== TEST SKILLS REQUEST ===');
    console.log('Model:', model);
    console.log('Use Skills:', useSkills);
    console.log('Skill ID:', skillId);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Body:', JSON.stringify(requestBody, null, 2));
    console.log('===========================\n');

    const startTime = Date.now();
    
    const response = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    console.log('\n=== TEST SKILLS RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Duration:', duration, 'ms');
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('============================\n');

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || `API error: ${response.status}`,
        rawRequest: requestBody,
        rawResponse: data
      });
    }

    // Extract the response text
    let responseText = '';
    
    if (data.choices && data.choices[0]) {
      const choice = data.choices[0];
      
      // Standard OpenAI format
      if (choice.message?.content) {
        responseText = choice.message.content;
      }
      // Check for tool calls or other content types
      else if (choice.message?.tool_calls) {
        responseText = `[Tool Calls]\n${JSON.stringify(choice.message.tool_calls, null, 2)}`;
      }
    } 
    // Anthropic format (if returned directly)
    else if (data.content && Array.isArray(data.content)) {
      responseText = data.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n');
        
      // Include tool results if any
      const toolResults = data.content.filter(block => 
        block.type === 'tool_use' || 
        block.type === 'bash_code_execution_tool_result'
      );
      
      if (toolResults.length > 0) {
        responseText += `\n\n[Tool Results]\n${JSON.stringify(toolResults, null, 2)}`;
      }
    }

    return res.status(200).json({
      response: responseText || JSON.stringify(data),
      model: modelName,
      useSkills,
      skillId,
      duration,
      rawRequest: requestBody,
      rawResponse: data
    });

  } catch (error) {
    console.error('Test Skills Error:', error);
    return res.status(500).json({
      error: `Server error: ${error.message}`,
      rawRequest: null,
      rawResponse: null
    });
  }
}
