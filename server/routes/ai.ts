import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { db } from '../db.js';

const router = Router();

const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const MEDICAL_NAVIGATION_SYSTEM_INSTRUCTION = `
You are the MediLink AI Health Navigation Assistant.
CRITICAL SAFETY & OPERATIONAL GUIDELINES:
1. You MUST NEVER diagnose medical conditions or claim to prescribe treatments or medications.
2. Your role is purely triage navigation:
   - Understand the patient's stated symptoms.
   - Ask 1-2 helpful clarifying questions (e.g. onset, severity, age).
   - Suggest the most appropriate medical specialty (e.g., "General Physician", "Cardiologist", "Dermatologist", "Orthopedic Specialist", "Pediatrician", "Neurologist").
   - Guide the patient on how to book an appointment with verified doctors on MediLink.
   - If the symptoms appear life-threatening (e.g. crushing chest pain, difficulty breathing, severe bleeding, stroke signs), immediately advise emergency care (dial 112 / 108 / 911 or visit the nearest ER) and warn them not to wait for an online appointment.
3. Always maintain a warm, calm, empathetic tone.
4. Output JSON with the following structure:
{
  "responseMessage": "Clear, friendly explanation with navigation guidance",
  "suggestedSpecialty": "General Physician" | "Cardiologist" | "Dermatologist" | "Orthopedic Specialist" | "Pediatrician" | "Neurologist",
  "clarifyingQuestions": ["Question 1?", "Question 2?"],
  "urgency": "ROUTINE" | "URGENT_EMERGENCY",
  "recommendedAction": "Book an online consultation" | "Seek emergency care immediately",
  "searchQuery": "General Physician"
}
`;

router.post('/navigate', async (req: Request, res: Response) => {
  try {
    const { message, previousMessages = [] } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const lower = message.toLowerCase();

    // Check emergency triggers first
    const emergencyWords = ['chest pain', 'heart attack', 'unconscious', 'cannot breathe', 'severe bleeding', 'stroke', 'paralysis'];
    const isEmergency = emergencyWords.some((w) => lower.includes(w));

    if (isEmergency) {
      return res.json({
        responseMessage: '⚠️ URGENT SAFETY ALERT: The symptoms you described could indicate an acute medical emergency. Online telemedicine consultations cannot replace emergency resuscitation or hospital intensive care. Please immediately contact your local emergency number (112 / 108 in India or 911) or have someone take you to the nearest hospital Emergency Department immediately.',
        suggestedSpecialty: 'Emergency Medicine',
        clarifyingQuestions: ['Are you experiencing sudden shortness of breath, radiating pain, or loss of consciousness?'],
        urgency: 'URGENT_EMERGENCY',
        recommendedAction: 'Seek emergency care immediately',
        searchQuery: '',
        disclaimer: 'MediLink AI Assistant does not diagnose diseases or handle emergencies.',
      });
    }

    // Try Gemini API if available
    if (aiClient) {
      try {
        const prompt = `Patient says: "${message}". Context of previous chat: ${JSON.stringify(previousMessages.slice(-3))}`;
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: MEDICAL_NAVIGATION_SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
          },
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return res.json({
            ...parsed,
            disclaimer: 'This assistant guides you to the right specialist and does not diagnose medical conditions. Always consult a verified physician for medical advice.',
          });
        }
      } catch (geminiErr: any) {
        console.warn('Gemini API call failed, falling back to intelligent rule-based navigator:', geminiErr.message);
      }
    }

    // High quality rule-based navigation fallback
    let suggestedSpecialty = 'General Physician';
    let responseMessage = 'Based on the symptoms you described, a General Physician is the best starting specialist for a comprehensive clinical assessment.';
    let clarifyingQuestions = ['How many days have you been experiencing these symptoms?', 'Do you have any accompanying fever, chills, or body ache?'];

    if (lower.includes('skin') || lower.includes('rash') || lower.includes('itch') || lower.includes('acne') || lower.includes('pimple') || lower.includes('hair fall')) {
      suggestedSpecialty = 'Dermatologist';
      responseMessage = 'For skin rashes, irritation, allergies, or scalp concerns, consulting a Dermatologist allows detailed visual evaluation and specialized topical therapy.';
      clarifyingQuestions = ['Is the rash spreading or accompanied by warmth or swelling?', 'Have you recently changed skin products or been exposed to outdoor irritants?'];
    } else if (lower.includes('heart') || lower.includes('palpitation') || lower.includes('bp') || lower.includes('blood pressure') || lower.includes('cholesterol')) {
      suggestedSpecialty = 'Cardiologist';
      responseMessage = 'For cardiovascular monitoring, heart rate irregularities, or hypertension management, a Cardiologist is recommended.';
      clarifyingQuestions = ['Do you have a personal or family history of high blood pressure?', 'Are the palpitations triggered by exertion, stress, or caffeine?'];
    } else if (lower.includes('bone') || lower.includes('joint') || lower.includes('knee') || lower.includes('back pain') || lower.includes('shoulder') || lower.includes('sprain')) {
      suggestedSpecialty = 'Orthopedic Specialist';
      responseMessage = 'For musculoskeletal pain, joint stiffness, spine discomfort, or sports injuries, an Orthopedic Specialist can guide imaging and rehabilitation.';
      clarifyingQuestions = ['Was there a recent trauma, fall, or twist to the area?', 'Does the pain worsen during movement or weight-bearing?'];
    } else if (lower.includes('child') || lower.includes('baby') || lower.includes('kid') || lower.includes('infant') || lower.includes('toddler')) {
      suggestedSpecialty = 'Pediatrician';
      responseMessage = 'For pediatric symptoms, vaccinations, and developmental wellness in children and infants, a Pediatrician is the appropriate specialist.';
      clarifyingQuestions = ['What is the child’s age and current temperature?', 'Is the child feeding and drinking fluids adequately?'];
    } else if (lower.includes('headache') || lower.includes('migraine') || lower.includes('dizziness') || lower.includes('nerve') || lower.includes('numbness')) {
      suggestedSpecialty = 'Neurologist';
      responseMessage = 'For recurrent headaches, migraines, nerve sensitivity, or persistent dizziness, a Neurologist provides specialized diagnostic expertise.';
      clarifyingQuestions = ['Is the headache accompanied by visual disturbances, nausea, or light sensitivity?', 'How frequently do these episodes occur?'];
    }

    return res.json({
      responseMessage,
      suggestedSpecialty,
      clarifyingQuestions,
      urgency: 'ROUTINE',
      recommendedAction: 'Book an online consultation',
      searchQuery: suggestedSpecialty,
      disclaimer: 'This assistant guides you to the right specialist and does not diagnose medical conditions. Always consult a verified physician for medical advice.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error processing symptom navigation' });
  }
});

export default router;
