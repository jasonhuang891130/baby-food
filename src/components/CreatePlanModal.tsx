import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEEPSEEK_API_KEY = 'sk-281ce1482051497aa3e9f5d309e868ff';
const API_URL = 'https://api.deepseek.com/v1/chat/completions';
const API_TIMEOUT = 20000; // 20 seconds timeout for plan generation

const initialState = {
  age: '',
  height: '',
  weight: '',
  sex: '',
  goals: '',
  mealCount: '3',
  allergies: [] as string[],
  dietary: ''
};

export function CreatePlanModal({ isOpen, onClose }: CreatePlanModalProps) {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAllergiesChange = (allergy: string) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy]
    }));
  };

  const resetForm = () => {
    setFormData(initialState);
    setPlan(null);
    setError(null);
  };

  const savePlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Please sign in to save your food plan');
        return;
      }

      const { error: saveError } = await supabase
        .from('food_logs')
        .insert([
          {
            user_id: user.id,
            plan_details: {
              ...formData,
              plan
            }
          }
        ]);

      if (saveError) throw saveError;

      onClose();
    } catch (error) {
      console.error('Error saving plan:', error);
      setError('Failed to save the food plan');
    }
  };

  const generatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPlan(null);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const prompt = `Generate a comprehensive 3-day baby food plan. Structure the response exactly as follows:

BABY DETAILS:
Age: ${formData.age} months
Height: ${formData.height} cm
Weight: ${formData.weight} kg
Sex: ${formData.sex}
${formData.goals ? `Goals: ${formData.goals}` : ''}
Meals per day: ${formData.mealCount}
Allergies: ${formData.allergies.length > 0 ? formData.allergies.join(', ') : 'None'}
Diet: ${formData.dietary || 'Standard'}

DAY 1:
[List each meal with exact times, portions, and ingredients]

DAY 2:
[List each meal with exact times, portions, and ingredients]

DAY 3:
[List each meal with exact times, portions, and ingredients]

PREPARATION INSTRUCTIONS:
[Include specific instructions for food preparation]

SAFETY GUIDELINES:
[List key safety points]

NUTRITIONAL INFORMATION:
[Provide nutritional highlights]
${formData.goals ? '\nPROGRESS TRACKING:\n[Include specific tracking tips]' : ''}

Use bullet points and clear headings. Ensure meals are age-appropriate and portions are consistent.`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are an expert baby nutritionist creating 3-day meal plans. Always structure your response with separate sections for Day 1, Day 2, and Day 3, followed by preparation instructions and safety guidelines. Never combine days or skip days. Each day must have ${formData.mealCount} meals with specific times.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          model: 'deepseek-chat',
          temperature: 0.3,
          max_tokens: 1500, // Increased for full 3-day plan
          stream: false,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to generate food plan');
      }

      const data = await response.json();
      setPlan(data.choices[0].message.content);
    } catch (error) {
      if (error.name === 'AbortError') {
        setError("The plan generation took too long. Please try again with fewer requirements.");
      } else {
        console.error('Error generating food plan:', error);
        setError('Failed to generate the food plan. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6">Create Your Baby's Food Plan</h2>
        
        {!plan ? (
          <form onSubmit={generatePlan} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Baby's Age
              </label>
              <select 
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                required
                className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-yellow-500"
              >
                <option value=""></option>
                <option value="6-8">6-8 months</option>
                <option value="8-12">8-12 months</option>
                <option value="12-16">12-16 months</option>
                <option value="16-20">16-20 months</option>
                <option value="20-24">20-24 months</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (centimeters)
                </label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                  required
                  className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kilograms)
                </label>
                <input
                  type="number"
                  min="3"
                  max="20"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  required
                  className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sex
              </label>
              <select 
                value={formData.sex}
                onChange={(e) => setFormData(prev => ({ ...prev, sex: e.target.value }))}
                required
                className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-yellow-500"
              >
                <option value=""></option>
                <option value="boy">Boy</option>
                <option value="girl">Girl</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goals and Aspirations (Optional)
              </label>
              <select 
                value={formData.goals}
                onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-yellow-500"
              >
                <option value=""></option>
                <option value="healthy-weight-gain">Healthy Weight Gain</option>
                <option value="balanced-nutrition">Balanced Nutrition</option>
                <option value="allergy-prevention">Allergy Prevention</option>
                <option value="picky-eater">Picky Eater Solutions</option>
                <option value="digestive-health">Digestive Health</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meal Count per Day
              </label>
              <select 
                value={formData.mealCount}
                onChange={(e) => setFormData(prev => ({ ...prev, mealCount: e.target.value }))}
                required
                className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-yellow-500"
              >
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Any Allergies?
              </label>
              <div className="space-y-2">
                {['Dairy', 'Eggs', 'Nuts', 'Soy', 'Wheat'].map((allergy) => (
                  <label key={allergy} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.allergies.includes(allergy)}
                      onChange={() => handleAllergiesChange(allergy)}
                      className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 mr-2"
                    />
                    {allergy}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dietary Preferences
              </label>
              <select 
                value={formData.dietary}
                onChange={(e) => setFormData(prev => ({ ...prev, dietary: e.target.value }))}
                className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-yellow-500"
              >
                <option value=""></option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="no-preference">No Preference</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.age || !formData.height || !formData.weight || !formData.sex}
              className={`w-full bg-yellow-500 text-black font-medium py-3 px-4 rounded-full hover:bg-yellow-400 transition-colors ${
                loading || !formData.age || !formData.height || !formData.weight || !formData.sex ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Generating Plan...' : 'Generate Food Plan'}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="prose max-w-none">
              <div className="whitespace-pre-line">{plan}</div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={resetForm}
                className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-full hover:bg-gray-200 transition-colors"
              >
                Create Another Plan
              </button>
              <button
                onClick={savePlan}
                className="flex-1 bg-yellow-500 text-black font-medium py-3 px-4 rounded-full hover:bg-yellow-400 transition-colors"
              >
                Save Plan
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-black text-white font-medium py-3 px-4 rounded-full hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}