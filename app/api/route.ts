import { openai } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import { z } from 'zod';

// FIX: Define the tool using flat parameter types that match the core SDK signatures perfectly
const checkPackageStatus = tool({
  description: 'Get the delivery status of a package using its tracking ID.',
  parameters: z.object({
    trackingId: z.string().describe('The tracking ID, e.g., PKG-123'),
  }),
  execute: async ({ trackingId }) => {
    const mockDb: Record<string, string> = {
      'PKG-GT': 'Delivered to GT today at 6:18 PM.',
      'PKG-456': 'In transit. Expected delivery: Tomorrow by 5:00 PM.',
      'PKG-123': 'Delivered yesterday at 3:15 PM.'
    };
    
    return { 
      status: mockDb[trackingId] || 'Tracking ID not found.' 
    };
  },
});

export async function POST(request: Request) {
  const { prompt } = await request.json();

  const result = await generateText({
    model: openai('gpt-4o-mini'),
    system: 'You are a customer service assistant. Use tools when needed.',
    prompt: prompt,
    tools: {
      checkPackage: checkPackageStatus,
    },
    maxSteps: 3, 
  });

  return Response.json({ response: result.text });
}
