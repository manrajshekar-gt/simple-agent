import { openai } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import { z } from 'zod';

const checkPackageStatus = tool({
  description: 'Get the delivery status of a package using its tracking ID.',
  parameters: z.object({
    trackingId: z.string().describe('The tracking ID, e.g., PKG-123'),
  }),
  execute: async ({ trackingId }) => {
    // This is your mock data. In the future, this would be a live PostgreSQL query.
    const mockDb: Record<string, string> = {
      'PKG-GT': 'Delivered to GT today at 6:18 PM.',
      'PKG-456': 'In transit. Expected delivery: Tomorrow by 5:00 PM.',
      'PKG-123': 'Delivered yesterday at 3:15 PM.',
    };
    return { status: mockDb[trackingId] || 'Tracking ID not found.' };
  },
});

export async function POST(request: Request) {
  const { prompt } = await request.json(); // The incoming question from the user

  const result = await generateText({
    model: openai('gpt-4o-mini'), // Calling OpenAI's brain
    system: 'You are a customer service assistant. Use tools when needed.',
    prompt: prompt,
    tools: { checkPackage: checkPackageStatus },
    maxSteps: 3, // This tells the SDK it can loop up to 3 times to think and run tools
  });

  return Response.json({ response: result.text }); // The final text answer
}
