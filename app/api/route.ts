
import { openai } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import { z } from 'zod';

// Define the schema as a standalone constant so TypeScript can read its type layout
const packageParameters = z.object({
  trackingId: z.string().describe('The tracking ID, e.g., PKG-123'),
});

const checkPackageStatus = tool({
  description: 'Get the delivery status of a package using its tracking ID.',
  parameters: packageParameters,
  // FIX: Explicitly infer the type from the Zod schema to satisfy the strict compiler overload
  execute: async (args: z.infer<typeof packageParameters>) => {
    const mockDb: Record<string, string> = {
      'PKG-GT': 'Delivered to GT today at 6:18 PM.',
      'PKG-456': 'In transit. Expected delivery: Tomorrow by 5:00 PM.',
      'PKG-123': 'Delivered yesterday at 3:15 PM.'
    };
    
    return { 
      status: mockDb[args.trackingId] || 'Tracking ID not found.' 
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
