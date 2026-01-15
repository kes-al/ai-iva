import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ChatRequest, ChatResponse, Intent, ConversationPhase, Brand, TherapeuticArea } from '@/lib/types';
import { SLIDE_TEMPLATES } from '@/lib/templates';

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an assistant helping pharmaceutical field teams create IVAs (Interactive Visual Aids) for Bristol Myers Squibb.

Your job is to:
1. Guide users through creating IVAs conversationally
2. Extract structured data from their responses
3. Keep the conversation focused and efficient

Available brands: Opdivo, Yervoy, Reblozyl, Breyanzi, Camzyos, Sotyktu
Therapeutic areas: Oncology, Immunology, Cardiovascular, Dermatology, Hematology

Brand to therapeutic area mapping:
- Opdivo: Oncology
- Yervoy: Oncology
- Reblozyl: Hematology
- Breyanzi: Oncology (CAR-T)
- Camzyos: Cardiovascular
- Sotyktu: Dermatology

Available slide templates:
${SLIDE_TEMPLATES.map((t) => `- ${t.id}: ${t.name} - ${t.description}`).join('\n')}

Conversation flow:
1. If user wants to create a new IVA, ask about the brand first
2. Then ask about target audience (what type of HCP)
3. Then ask about slide structure (how many slides and what each covers)
4. For each slide, help them select a layout and populate content
5. At the end, offer to configure ISI and then export

Always respond with valid JSON in this exact format:
{
  "reply": "Your conversational response to the user",
  "intent": { "type": "intent_type", ...additional_fields },
  "nextPhase": "next_conversation_phase" | null
}

Intent types and their fields:
- create_iva: { "type": "create_iva" }
- set_brand: { "type": "set_brand", "brand": "Opdivo|Yervoy|Reblozyl|Breyanzi|Camzyos|Sotyktu" }
- set_audience: { "type": "set_audience", "audience": "string describing HCP type" }
- set_therapeutic_area: { "type": "set_therapeutic_area", "area": "Oncology|Immunology|Cardiovascular|Dermatology|Hematology" }
- set_slide_count: { "type": "set_slide_count", "count": number }
- set_iva_name: { "type": "set_iva_name", "name": "string" }
- select_layout: { "type": "select_layout", "slideIndex": number, "layoutId": "template_id" }
- set_content: { "type": "set_content", "slideIndex": number, "field": "slot_id", "value": "content" }
- show_archive: { "type": "show_archive" }
- export_iva: { "type": "export_iva" }
- save_iva: { "type": "save_iva" }
- go_back: { "type": "go_back" }
- unknown: { "type": "unknown", "rawInput": "original message" }

Conversation phases: initial, brand_selection, audience_selection, slide_structure, layout_selection, content_population, isi_configuration, review, editing

Keep responses concise and professional. This is for pharma—be precise.
When suggesting layouts, mention 2-3 that would work best for their content needs.
If the user's intent is unclear, ask for clarification rather than guessing.`;

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, context } = body;

    // Build context message
    const contextInfo = buildContextInfo(context);

    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Current context:
${contextInfo}

User message: ${message}

Respond with JSON only. No markdown code blocks.`,
        },
      ],
    });

    // Extract text from response
    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    // Parse JSON response
    let parsed: { reply: string; intent: Intent; nextPhase?: ConversationPhase };
    try {
      // Try to extract JSON from the response (handle potential markdown wrapping)
      let jsonStr = textContent.text.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
      }
      parsed = JSON.parse(jsonStr);
    } catch (parseError) {
      // If parsing fails, create a default response
      console.error('Failed to parse AI response:', textContent.text);
      parsed = {
        reply: textContent.text,
        intent: { type: 'unknown', rawInput: message },
      };
    }

    // Add UI actions based on conversation phase
    const uiActions = getUIActions(parsed.intent, context.conversationPhase);

    const chatResponse: ChatResponse = {
      reply: parsed.reply,
      intent: parsed.intent,
      uiActions,
      nextPhase: parsed.nextPhase,
    };

    return NextResponse.json(chatResponse);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        reply: 'Sorry, I encountered an error. Please try again.',
        intent: { type: 'unknown', rawInput: '' },
      },
      { status: 500 }
    );
  }
}

function buildContextInfo(context: ChatRequest['context']): string {
  const lines: string[] = [];

  lines.push(`Current state: ${context.currentState}`);
  lines.push(`Conversation phase: ${context.conversationPhase}`);

  if (context.currentIVA) {
    const meta = context.currentIVA.metadata;
    if (meta) {
      lines.push(`Current IVA:`);
      if (meta.name) lines.push(`  - Name: ${meta.name}`);
      if (meta.brand) lines.push(`  - Brand: ${meta.brand}`);
      if (meta.targetAudience) lines.push(`  - Target Audience: ${meta.targetAudience}`);
      if (meta.slideCount) lines.push(`  - Slide Count: ${meta.slideCount}`);
    }

    if (context.currentIVA.slides && context.currentIVA.slides.length > 0) {
      lines.push(`  - Current slide index: ${context.currentSlideIndex}`);
      lines.push(`  - Slides defined: ${context.currentIVA.slides.length}`);
    }
  }

  if (context.conversationHistory.length > 0) {
    const recentMessages = context.conversationHistory.slice(-4);
    lines.push(`Recent conversation:`);
    recentMessages.forEach((msg) => {
      lines.push(`  ${msg.role}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
    });
  }

  return lines.join('\n');
}

function getUIActions(intent: Intent, phase: ConversationPhase) {
  const actions = [];

  if (intent.type === 'set_slide_count' || phase === 'layout_selection') {
    actions.push({
      type: 'show_layouts' as const,
      layouts: SLIDE_TEMPLATES,
    });
  }

  if (intent.type === 'show_archive') {
    actions.push({
      type: 'navigate_to' as const,
      state: 'ARCHIVE' as const,
    });
  }

  if (intent.type === 'export_iva') {
    actions.push({
      type: 'trigger_export' as const,
    });
  }

  return actions.length > 0 ? actions : undefined;
}
