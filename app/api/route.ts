import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export async function POST(request: Request) {
  const { prompt } = await request.json();

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: 'You are a customer service assistant. Use tools when needed to discover order status, then format a helpful summary sentence back to the user.',
    prompt: prompt,
    // Fully supported natively inside streamText for auto-looping agent executions
    maxSteps: 5, 
    tools: {
      checkPackage: tool({
        description: 'Get the delivery status of a package using its tracking ID.',
        inputSchema: z.object({
          trackingId: z.string().describe('The tracking ID, e.g., PKG-123'),
        }),
        execute: async ({ trackingId }: { trackingId: string }) => {
          const mockDb: Record<string, string> = {
            'PKG-GT': 'Delivered to GT today at 6:18 PM.',
            'PKG-456': 'In transit. Expected delivery: Tomorrow by 5:00 PM.',
            'PKG-123': 'Delivered yesterday at 3:15 PM.'
          };
          
          return { 
            status: mockDb[trackingId] || 'Tracking ID not found.' 
          };
        },
      }),
    },
  });

  // Returns the streaming data chunks back to the client natively
  return result.toDataStreamResponse();
}
