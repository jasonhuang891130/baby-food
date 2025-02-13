import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

const translations = {
  en: {
    // Navigation
    'nav.createPlan': 'Create Plan',
    'nav.foodLogs': 'Baby Food Logs',
    'nav.guides': 'Guides',
    'nav.articles': 'Articles',
    'nav.signIn': 'Sign In',
    'nav.signOut': 'Sign Out',

    // Hero Section
    'hero.fastTrack': 'Fast track to healthier baby food',
    'hero.generate': 'Generate yours',
    'hero.title1': 'Smart Food Planning',
    'hero.title2': 'Your personal baby food',
    'hero.title3': 'planner and nutritionist',
    'hero.description': 'Introducing the most innovative AI-generated baby food planning application. Get an interactive food plan for the week, tailored to your baby\'s age, dietary requirements, and developmental stage.',
    'hero.cta': 'Create your baby\'s food plans today',

    // Statistics
    'stats.profilesAnalyzed': 'Profiles Analysed',
    'stats.foodsGenerated': 'Foods Generated',
    'stats.recipesCreated': 'Recipes Created',

    // Steps
    'steps.form.title': '1. FORM',
    'steps.form.desc': 'Tell us your baby\'s age, allergies & dietary preferences.',
    'steps.ai.title': '2. AI MAGIC',
    'steps.ai.desc': 'We create age-appropriate food plans while you prepare their next bottle.',
    'steps.receive.title': '3. RECEIVE',
    'steps.receive.desc': 'Get nutritionist-approved food plans, recipes & shopping lists for your baby.',

    // Other translations...
  },
  zh: {
    // Navigation
    'nav.createPlan': '创建计划',
    'nav.foodLogs': '婴儿食谱记录',
    'nav.guides': '指南',
    'nav.articles': '文章',
    'nav.signIn': '登录',
    'nav.signOut': '退出',

    // Hero Section
    'hero.fastTrack': '快速获取更健康的婴儿食谱',
    'hero.generate': '立即生成',
    'hero.title1': '智能食谱规划',
    'hero.title2': '您的个人婴儿营养',
    'hero.title3': '规划师和营养师',
    'hero.description': '引入最创新的AI生成婴儿食谱规划应用。获取根据宝宝年龄、饮食要求和发育阶段量身定制的每周互动食谱计划。',
    'hero.cta': '今天就为宝宝创建食谱计划',

    // Statistics
    'stats.profilesAnalyzed': '已分析档案',
    'stats.foodsGenerated': '已生成食谱',
    'stats.recipesCreated': '已创建配方',

    // Steps
    'steps.form.title': '1. 表单',
    'steps.form.desc': '告诉我们宝宝的年龄、过敏情况和饮食偏好。',
    'steps.ai.title': '2. AI魔法',
    'steps.ai.desc': '在您准备下一瓶奶时，我们创建适合年龄的食谱计划。',
    'steps.receive.title': '3. 接收',
    'steps.receive.desc': '获取营养师认可的食谱计划、配方和购物清单。',

    // Other translations...
  }
};