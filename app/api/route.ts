import { openai } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import { z } from 'zod';

export async function POST(request: Request) {
  const { prompt } = await request.json();

  const result = await generateText({
    model: openai('gpt-4o-mini'),
    // Note: AI SDK 6/7 uses 'system' instruction contexts natively on single-turn configurations
    system: 'You are a customer service assistant. Use tools when needed.',
    prompt: prompt,
    tools: {
      checkPackage: tool({
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
      }),
    },
  });

  // If the model calls a tool, extract the value to return to your user
  const toolResult = result.toolResults?.[0]?.result as { status: string } | undefined;
  const finalAnswer = toolResult ? toolResult.status : (result.text || 'Processing complete.');

  return Response.json({ response: finalAnswer });
}
