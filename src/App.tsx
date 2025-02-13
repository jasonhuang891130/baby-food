import React, { useState, useEffect, useRef } from 'react';
import { Baby, LogIn, LogOut, User, Book, FileText, Star, HelpCircle } from 'lucide-react';
import { Chatbot } from './components/Chatbot';
import { CreatePlanModal } from './components/CreatePlanModal';
import { FoodLogsModal } from './components/FoodLogsModal';
import { AuthModal } from './components/AuthModal';
import { ArticlesModal } from './components/ArticlesModal';
import { supabase } from './lib/supabase';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Mother of 8-month-old",
    content: "BabyFirst has been a game-changer for us! The meal plans are so well thought out and my baby loves every recipe. It's taken all the stress out of introducing solids.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80"
  },
  {
    name: "David Chen",
    role: "Father of twins",
    content: "Managing meals for twins seemed impossible until we found BabyFirst. The AI-generated plans are perfectly balanced and save us so much time. Couldn't recommend it more!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80"
  },
  {
    name: "Emily Rodriguez",
    role: "Pediatric Nutritionist",
    content: "As a professional, I'm impressed by the scientific approach BabyFirst takes to infant nutrition. The meal plans are age-appropriate and follow all the latest guidelines.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80"
  }
];

const faqs = [
  {
    question: "What does the AI meal plan include?",
    answer: "Our AI meal plans provide you with tailored meal options based on your baby's age, preferences, and nutritional requirements. Each meal plan includes detailed recipes, portion sizes, and nutritional breakdowns, ensuring your baby gets the right balance of nutrients for healthy development."
  },
  {
    question: "When should I start using BabyFirst?",
    answer: "BabyFirst is designed for babies starting from 6 months old, which is the recommended age to begin introducing solid foods. Our plans adapt as your baby grows, providing age-appropriate food suggestions through the toddler years."
  },
  {
    question: "How do you ensure food safety?",
    answer: "All our meal plans follow strict food safety guidelines recommended by pediatric nutritionists. We provide detailed preparation instructions, storage tips, and allergen information to ensure safe feeding practices for your baby."
  },
  {
    question: "Can I customize the meal plans?",
    answer: "Yes! Our AI takes into account your baby's allergies, dietary restrictions, and preferences. You can easily modify portion sizes, swap ingredients, and adjust meal frequencies to suit your baby's needs."
  }
];

function App() {
  const [isCreatePlanModalOpen, setIsCreatePlanModalOpen] = useState(false);
  const [isFoodLogsModalOpen, setIsFoodLogsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isArticlesModalOpen, setIsArticlesModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featureCardsRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observers = [
      {
        ref: statsRef,
        selector: '.stat-card'
      },
      {
        ref: featureCardsRef,
        selector: '.feature-card'
      },
      {
        ref: testimonialsRef,
        selector: '.testimonial-card'
      },
      {
        ref: faqRef,
        selector: '.faq-card'
      }
    ].map(({ ref, selector }) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const cards = entry.target.querySelectorAll(selector);
            cards.forEach(card => {
              if (entry.isIntersecting) {
                card.classList.remove('fade-out');
                card.classList.add('animate');
              } else {
                card.classList.remove('animate');
                card.classList.add('fade-out');
              }
            });
          });
        },
        {
          threshold: 0.2,
          rootMargin: '0px'
        }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return observer;
    });

    return () => observers.forEach(observer => observer.disconnect());
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN') {
        setIsAuthModalOpen(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleSwitchAuthMode = (e: CustomEvent) => {
      setAuthMode(e.detail);
      setIsAuthModalOpen(true);
    };

    document.addEventListener('switchAuthMode', handleSwitchAuthMode as EventListener);
    return () => {
      document.removeEventListener('switchAuthMode', handleSwitchAuthMode as EventListener);
    };
  }, []);

  const handleCreatePlan = () => {
    setIsCreatePlanModalOpen(true);
  };

  const handleFoodLogs = () => {
    setIsFoodLogsModalOpen(true);
  };

  const handleGuides = () => {
    document.dispatchEvent(new CustomEvent('openChatbotGuides'));
  };

  const handleArticles = () => {
    setIsArticlesModalOpen(true);
  };

  const handleAuth = () => {
    if (user) {
      supabase.auth.signOut();
    } else {
      setAuthMode('login');
      setIsAuthModalOpen(true);
    }
  };

  const getUserDisplayName = (email: string) => {
    return email.split('@')[0];
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Baby className="h-8 w-8 text-yellow-500" />
              <span className="text-xl font-bold text-gray-900">BabyFirst</span>
            </div>

            {/* Navigation Items - Updated alignment */}
            <div className="flex items-center ml-auto">
              {/* Primary Actions */}
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleCreatePlan}
                  className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800"
                >
                  Create Plan
                </button>
                <button 
                  onClick={handleFoodLogs}
                  className="bg-yellow-500 text-black px-4 py-2 rounded-full hover:bg-yellow-400 transition-colors"
                >
                  Baby Food Logs
                </button>
                <button 
                  onClick={handleGuides}
                  className="bg-yellow-500 text-black px-4 py-2 rounded-full hover:bg-yellow-400 transition-colors flex items-center gap-2"
                >
                  <Book size={18} />
                  Guides
                </button>
                <button 
                  onClick={handleArticles}
                  className="bg-yellow-500 text-black px-4 py-2 rounded-full hover:bg-yellow-400 transition-colors flex items-center gap-2"
                >
                  <FileText size={18} />
                  Articles
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="flex items-center space-x-3 border-l border-gray-200 ml-3 pl-3">
                {user && (
                  <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                    <User size={14} />
                    <span className="text-sm font-medium">{getUserDisplayName(user.email)}</span>
                  </div>
                )}
                <button
                  onClick={handleAuth}
                  className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors text-sm"
                >
                  {user ? (
                    <>
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={14} />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center">
              <span className="bg-yellow-500 text-black px-4 py-2 rounded-full font-medium">
                SMART FOOD PLANNING
              </span>
              <span className="ml-2 text-gray-600 flex items-center">
                Fast track to healthier baby food
                <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold">
                <span className="block">Your personal baby</span>
                <span className="block">meal planner and nutritionist</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Introducing the most <span className="text-yellow-500 font-semibold">innovative</span> AI-generated food planning application. Get an interactive meal plan for the week, tailored to your baby's age, dietary requirements, and developmental goals.
              </p>
            </div>

            <div>
              <button 
                onClick={handleCreatePlan}
                className="bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800"
              >
                Start Your Baby's Food Journey Today
              </button>
            </div>
          </div>

          {/* Feature Cards Section */}
          <div ref={featureCardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="feature-card bg-white p-8 rounded-2xl shadow-lg transform hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <Baby className="w-6 h-6 text-black" />
              </div>
              <h4 className="text-xl font-bold mb-4">Age-Appropriate</h4>
              <p className="text-gray-600">
                Customized meal plans that grow with your baby, from first foods to toddler meals.
              </p>
            </div>

            <div className="feature-card bg-white p-8 rounded-2xl shadow-lg transform hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <FileText className="w-6 h-6 text-black" />
              </div>
              <h4 className="text-xl font-bold mb-4">Nutritionist-Approved</h4>
              <p className="text-gray-600">
                Expert-backed meal suggestions ensuring balanced nutrition for optimal growth.
              </p>
            </div>

            <div className="feature-card bg-white p-8 rounded-2xl shadow-lg transform hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <Book className="w-6 h-6 text-black" />
              </div>
              <h4 className="text-xl font-bold mb-4">Easy to Follow</h4>
              <p className="text-gray-600">
                Simple recipes and preparation guides designed for busy parents.
              </p>
            </div>
          </div>

          <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="stat-card text-center p-8 bg-white rounded-xl shadow-lg">
              <div className="text-4xl font-bold mb-2">558</div>
              <div className="text-gray-600 uppercase tracking-wide text-sm">
                Profiles Analyzed
              </div>
            </div>
            <div className="stat-card text-center p-8 bg-white rounded-xl shadow-lg">
              <div className="text-4xl font-bold mb-2">105</div>
              <div className="text-gray-600 uppercase tracking-wide text-sm">
                Foods Generated
              </div>
            </div>
            <div className="stat-card text-center p-8 bg-white rounded-xl shadow-lg">
              <div className="text-4xl font-bold mb-2">88</div>
              <div className="text-gray-600 uppercase tracking-wide text-sm">
                Recipes Created
              </div>
            </div>
          </div>

          {/* FAQ Section - Moved up */}
          <div className="max-w-7xl mx-auto py-24">
            <div className="text-center mb-16">
              <h2 className="text-yellow-500 font-medium text-lg mb-2">FAQ</h2>
              <h3 className="text-4xl font-bold text-gray-900">Confused? We got you.</h3>
            </div>

            <div ref={faqRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className="faq-card bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <HelpCircle className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xl text-gray-900 mb-4">{faq.question}</h4>
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Steps Section - After FAQ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <h3 className="font-bold text-xl mb-4">1. FORM</h3>
              <p className="text-gray-600">Tell us your baby's age, allergies & dietary preferences.</p>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-xl mb-4">2. AI MAGIC</h3>
              <p className="text-gray-600">We create age-appropriate food plans while you prepare their next bottle.</p>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-xl mb-4">3. RECEIVE</h3>
              <p className="text-gray-600">Get nutritionist-approved food plans, recipes & shopping lists for your baby.</p>
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="max-w-7xl mx-auto py-24">
            <div className="text-center mb-16">
              <h2 className="text-yellow-500 font-medium text-lg mb-2">TESTIMONIALS</h2>
              <h3 className="text-4xl font-bold text-gray-900">Don't trust us. Trust them.</h3>
            </div>

            <div ref={testimonialsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className="testimonial-card bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <Star className="w-5 h-5 text-yellow-500 inline-block" />
                    <Star className="w-5 h-5 text-yellow-500 inline-block" />
                    <Star className="w-5 h-5 text-yellow-500 inline-block" />
                    <Star className="w-5 h-5 text-yellow-500 inline-block" />
                    <Star className="w-5 h-5 text-yellow-500 inline-block" />
                  </div>
                  <blockquote className="text-gray-700 leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Chatbot onCreatePlan={handleCreatePlan} />

      <CreatePlanModal 
        isOpen={isCreatePlanModalOpen}
        onClose={() => setIsCreatePlanModalOpen(false)}
      />

      <FoodLogsModal
        isOpen={isFoodLogsModalOpen}
        onClose={() => setIsFoodLogsModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
      />

      <ArticlesModal
        isOpen={isArticlesModalOpen}
        onClose={() => setIsArticlesModalOpen(false)}
      />
    </div>
  );
}

export default App;