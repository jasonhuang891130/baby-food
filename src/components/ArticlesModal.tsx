import React, { useState, useEffect } from 'react';
import { X, FileText, ChevronRight } from 'lucide-react';

interface ArticlesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ARTICLES = [
  {
    title: "Getting Started with Solid Foods",
    content: `When to Start Solid Foods

Your baby's journey into solid foods is an exciting milestone that typically begins around 6 months of age. Here's your comprehensive guide to starting solids.

Signs of Readiness:
• Can sit upright with minimal support
• Shows good head and neck control
• Lost the tongue-thrust reflex
• Shows interest in food
• Has doubled their birth weight
• Can move food to the back of their mouth

First Steps:
1. Start with single-ingredient foods
2. Wait 3-5 days between new foods
3. Begin with iron-rich foods
4. Offer food after milk feeding
5. Keep portions small (1-2 teaspoons)

Best First Foods:
• Iron-fortified infant cereal
• Pureed meat
• Mashed avocado
• Pureed sweet potato
• Mashed banana
• Pureed peas

Safety Guidelines:
• Always supervise feeding
• Ensure proper consistency
• Watch for allergic reactions
• Never force feed
• Stop at first signs of fullness

Remember: Every baby is different, and it's okay to go at your own pace. Consult your pediatrician before starting solids.`
  },
  {
    title: "Best First Foods for Your Baby",
    content: `Essential First Foods for Your Baby's Journey

Starting solids is a crucial step in your baby's development. Here's a guide to the best first foods and how to prepare them.

Iron-Rich Foods (Start Here):
• Iron-fortified infant cereal
• Pureed meat (beef, chicken, turkey)
• Pureed legumes
• Egg yolk (if approved by pediatrician)

Vegetables:
• Sweet potato
• Carrots
• Green peas
• Squash
• Green beans

Fruits:
• Banana
• Avocado
• Apple
• Pear
• Peach

Preparation Methods:
1. Steaming - Preserves nutrients
2. Boiling - Use minimal water
3. Baking - Enhances natural flavors
4. Pureeing - Ensure smooth consistency

Portion Sizes:
• Start with 1-2 teaspoons
• Gradually increase to 2-4 tablespoons
• Follow baby's hunger cues

Storage Tips:
• Refrigerate for 48 hours
• Freeze in ice cube trays
• Label with date and contents
• Thaw in refrigerator overnight

Remember: Always introduce one food at a time and watch for any reactions.`
  },
  {
    title: "Common Food Allergies in Babies",
    content: `Understanding and Managing Food Allergies in Babies

Food allergies affect up to 8% of babies and young children. Here's what you need to know about introducing allergenic foods safely.

Common Allergens:
1. Cow's milk
2. Eggs
3. Peanuts
4. Tree nuts
5. Fish
6. Shellfish
7. Soy
8. Wheat

Signs of Allergic Reaction:
• Skin rash or hives
• Swelling of face, lips, tongue
• Vomiting or diarrhea
• Difficulty breathing
• Coughing or wheezing
• Lethargy or paleness

Safe Introduction:
1. Start early (4-6 months, with doctor's approval)
2. One new food at a time
3. Small amounts first
4. Morning introductions
5. Wait 3-5 days between new foods
6. Keep a food diary

Emergency Preparedness:
• Know the signs of anaphylaxis
• Have emergency numbers ready
• Discuss action plan with doctor
• Consider medical ID bracelet

Prevention Tips:
• Follow doctor's recommendations
• Don't delay introduction
• Maintain consistent exposure
• Keep detailed records`
  },
  {
    title: "Baby-Led Weaning vs Traditional Weaning",
    content: `Comparing Baby-Led Weaning and Traditional Spoon-Feeding

Understanding different weaning approaches helps you choose the best method for your baby.

Baby-Led Weaning (BLW):
Advantages:
• Develops motor skills
• Promotes self-feeding
• Encourages food exploration
• May reduce picky eating
• Joins family meals earlier

Considerations:
• Messier mealtimes
• Initial food waste
• Requires close supervision
• May take longer to eat
• Need to modify food size/shape

Traditional Spoon-Feeding:
Advantages:
• Better portion control
• Less mess
• Easier to track intake
• Familiar to caregivers
• Potentially faster mealtimes

Considerations:
• Less sensory exploration
• May need to transition to self-feeding
• Could develop food texture issues
• Less independence at mealtimes

Safety Tips for Both Methods:
• Always supervise meals
• Proper sitting position
• Know choking hazards
• First aid knowledge
• Regular feeding schedule

Choose based on:
• Baby's development
• Family lifestyle
• Comfort level
• Pediatrician advice`
  },
  {
    title: "Creating a Balanced Baby Diet",
    content: `Building a Nutritious Diet for Your 6-12 Month Old

A balanced diet is crucial for your baby's growth and development. Here's how to ensure optimal nutrition.

Essential Nutrients:
1. Iron
   • Fortified cereals
   • Pureed meats
   • Legumes

2. Protein
   • Meat
   • Fish
   • Eggs
   • Legumes

3. Healthy Fats
   • Avocado
   • Olive oil
   • Fish
   • Breast milk/formula

4. Carbohydrates
   • Cereals
   • Sweet potato
   • Fruits
   • Vegetables

Daily Meal Planning:
• 2-3 solid meals
• 4-6 milk feeds
• Snacks as needed
• Water with meals

Portion Guidelines:
Breakfast: 2-4 tablespoons
Lunch: 2-4 tablespoons
Dinner: 2-4 tablespoons
Snacks: 1-2 tablespoons

Tips for Success:
• Offer variety
• Include all food groups
• Follow baby's cues
• Be consistent
• Make it colorful`
  }
];

export function ArticlesModal({ isOpen, onClose }: ArticlesModalProps) {
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedArticle(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-yellow-100 flex justify-between items-center bg-yellow-50">
          <h2 className="text-2xl font-bold text-yellow-900">
            Baby Feeding Articles
          </h2>
          <button 
            onClick={onClose}
            className="text-yellow-700 hover:text-yellow-900 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Article List */}
          <div className="w-1/3 border-r border-yellow-100 overflow-y-auto bg-yellow-50/30">
            {ARTICLES.map((article, index) => (
              <button
                key={index}
                onClick={() => setSelectedArticle(index)}
                className={`w-full text-left p-4 flex items-center justify-between transition-all duration-200 ${
                  selectedArticle === index 
                    ? 'bg-yellow-500 text-black shadow-md' 
                    : 'hover:bg-yellow-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText 
                    size={20} 
                    className={selectedArticle === index ? 'text-black' : 'text-yellow-600'} 
                  />
                  <span className={`font-medium ${
                    selectedArticle === index ? 'text-black' : 'text-yellow-900'
                  }`}>
                    {article.title}
                  </span>
                </div>
                <ChevronRight 
                  size={20} 
                  className={selectedArticle === index ? 'text-black' : 'text-yellow-600'} 
                />
              </button>
            ))}
          </div>

          {/* Article Content */}
          <div className="flex-1 overflow-y-auto bg-white">
            {selectedArticle !== null ? (
              <div className="p-8">
                <h2 className="text-3xl font-bold mb-6 text-yellow-900 border-b border-yellow-200 pb-4">
                  {ARTICLES[selectedArticle].title}
                </h2>
                <div className="whitespace-pre-line text-yellow-950 leading-relaxed">
                  {ARTICLES[selectedArticle].content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8">
                <FileText size={48} className="text-yellow-300 mb-4" />
                <p className="text-yellow-900 font-medium text-lg">
                  Select an article to read
                </p>
                <p className="text-yellow-600 text-sm mt-2">
                  Choose from our curated collection of baby feeding guides
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}