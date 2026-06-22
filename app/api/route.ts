import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { z } from 'zod';

export async function POST(request: Request) {
  const { prompt } = await request.json();

  const result = await generateText({
    model: openai('gpt-4o-mini'),
    system: 'You are a customer service assistant. Use tools when needed.',
    prompt: prompt,
    // Modern property name for execution loop limits in this SDK version
    maxAutomaticRoundTrips: 3, 
    tools: {
      checkPackage: {
        description: 'Get the delivery status of a package using its tracking ID.',
        // Modern property name for the Zod schema configuration
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
      },
    },
  });

  return Response.json({ response: result.text });
}
