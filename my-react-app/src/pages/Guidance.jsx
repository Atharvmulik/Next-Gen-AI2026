import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeGuidance } from "../services/guidanceApi";

import {
  ChevronRight, ArrowRight, Sparkles, Target,
  BookOpen, GraduationCap, Zap, Brain,
  TrendingUp, CheckCircle, X, ChevronLeft
} from 'lucide-react';

// Student card configurations
const STUDENT_CARDS = [
  {
    id: 'school',
    title: 'School Student',
    description: 'Explore career paths based on your interests and strengths',
    icon: BookOpen,
    color: '#8b5cf6',
    questions: [
      {
        id: 'stream',
        question: 'Which stream are you most interested in?',
        options: ['Science', 'Commerce', 'Arts'],
        type: 'single'
      },
      {
        id: 'subjects',
        question: 'What subjects do you enjoy the most?',
        options: ['Maths', 'Science', 'Computers', 'Arts', 'Business', 'Languages'],
        type: 'multiple'
      },
      {
        id: 'interests',
        question: 'What do you enjoy more?',
        options: ['Solving problems', 'Creating things', 'Helping people', 'Leading teams'],
        type: 'single'
      }
    ]
  },
  {
    id: 'senior',
    title: 'Class 11–12 Student',
    description: 'Plan your academic journey with personalized guidance',
    icon: GraduationCap,
    color: '#3b82f6',
    questions: [
      {
        id: 'goal',
        question: 'What is your future goal?',
        options: ['Job', 'Business', 'Higher Studies'],
        type: 'single'
      },
      {
        id: 'stream',
        question: 'Which stream are you currently in?',
        options: ['PCM', 'PCB', 'Commerce', 'Arts'],
        type: 'single'
      },
      {
        id: 'strengths',
        question: 'What are your strengths?',
        options: ['Theory', 'Practical', 'Logical thinking', 'Communication'],
        type: 'multiple'
      }
    ]
  },
  {
    id: 'engineering',
    title: 'Engineering Student',
    description: 'Shape your engineering career with AI-powered insights',
    icon: Zap,
    color: '#10b981',
    questions: [
      {
        id: 'year',
        question: 'Which year are you currently in?',
        options: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
        type: 'single'
      },
      {
        id: 'cgpa',
        question: 'Current CGPA',
        type: 'numeric',
        placeholder: 'Enter your CGPA (0.0 - 10.0)'
      },
      {
        id: 'projects',
        question: 'How many projects have you completed?',
        options: ['0', '1–2', '3–5', '5+'],
        type: 'single'
      },
      {
        id: 'interest',
        question: 'Primary interest area?',
        options: ['Software', 'AI/ML', 'Core Engineering', 'Management / MBA', 'Startup'],
        type: 'single'
      }
    ]
  }
];

export default function Guidance() {
  const [activeCard, setActiveCard] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [numericInput, setNumericInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetFlow = () => {
    setActiveCard(null);
    setCurrentStep(0);
    setAnswers({});
    setSelectedOptions([]);
    setNumericInput('');
    setShowResult(false);
    setResultData(null);
    setError(null);
  };

  const handleCardClick = (cardId) => {
    setActiveCard(cardId);
    setCurrentStep(0);
    setAnswers({});
    setSelectedOptions([]);
    setNumericInput('');
    setError(null);
  };

  const handleNext = async () => {
    const card = STUDENT_CARDS.find(c => c.id === activeCard);
    const question = card?.questions[currentStep];

    // Save current answer
    if (question?.type === 'numeric' && numericInput) {
      setAnswers(prev => ({ ...prev, [question.id]: numericInput }));
    } else if (selectedOptions.length > 0) {
      setAnswers(prev => ({ 
        ...prev, 
        [question.id]: question.type === 'single' ? selectedOptions[0] : selectedOptions 
      }));
    }

    if (currentStep < card.questions.length - 1) {
      // Move to next question
      setCurrentStep(prev => prev + 1);
      setSelectedOptions([]);
      setNumericInput('');
    } else {
      // All questions answered - call backend API
      const finalAnswers = {
        ...answers,
        ...(question?.type === 'numeric' && numericInput ? { [question.id]: numericInput } : {}),
        ...(selectedOptions.length > 0 ? { 
          [question.id]: question.type === 'single' ? selectedOptions[0] : selectedOptions 
        } : {})
      };

      try {
        setLoading(true);
        setError(null);
        
        // Call the backend API with student type and answers
        const response = await analyzeGuidance(activeCard, finalAnswers);
        
        // Transform backend response to match frontend format
        const formattedResult = {
          title: `Your ${card.title} Career Path`,
          strengths: response.strengths || [],
          suggestedDomains: response.suggested_domains || [],
          roadmap: response.roadmap ? response.roadmap.split('\n').filter(step => step.trim()) : [],
          chances: response.chances || "Good potential based on your profile"
        };
        
        setResultData(formattedResult);
        setShowResult(true);
      } catch (err) {
        console.error('Error getting AI guidance:', err);
        setError("Failed to get AI guidance. Please try again.");
        // Fallback to mock result if API fails
        const mockResult = generateMockResult(card.id, finalAnswers);
        setResultData(mockResult);
        setShowResult(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      const card = STUDENT_CARDS.find(c => c.id === activeCard);
      const prevQuestion = card?.questions[currentStep - 1];
      const prevAnswer = answers[prevQuestion?.id];
      setSelectedOptions(
        Array.isArray(prevAnswer) ? prevAnswer : 
        prevAnswer ? [prevAnswer] : []
      );
    }
  };

  const toggleOption = (option) => {
    const card = STUDENT_CARDS.find(c => c.id === activeCard);
    const question = card?.questions[currentStep];

    if (question?.type === 'single') {
      setSelectedOptions([option]);
    } else {
      setSelectedOptions(prev =>
        prev.includes(option)
          ? prev.filter(item => item !== option)
          : [...prev, option]
      );
    }
  };

  const handleNumericChange = (e) => {
    const value = e.target.value;
    if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) <= 10)) {
      setNumericInput(value);
    }
  };

  const currentCard = STUDENT_CARDS.find(c => c.id === activeCard);
  const currentQuestion = currentCard?.questions[currentStep];

  // Helper function for fallback mock results
  const generateMockResult = (cardId, answers) => {
    const baseResults = {
      school: {
        title: "Your School Student Career Path",
        strengths: ["Analytical Thinking", "Creative Problem Solving", "Strong Foundation in Core Subjects"],
        suggestedDomains: ["STEM Fields", "Business Management", "Creative Arts", "Social Sciences"],
        roadmap: [
          "Focus on building strong fundamentals in chosen subjects",
          "Participate in extracurricular activities to explore interests",
          "Research career options aligned with your strengths",
          "Plan your high school curriculum strategically"
        ]
      },
      senior: {
        title: "Your Class 11-12 Career Path",
        strengths: ["Specialized Knowledge", "Goal Orientation", "Academic Discipline"],
        suggestedDomains: ["Engineering", "Medical Sciences", "Commerce & Finance", "Humanities Research"],
        roadmap: [
          "Excel in board exams with targeted preparation",
          "Start preparing for entrance exams (JEE/NEET/CUET etc.)",
          "Build a strong profile with projects and competitions",
          "Research colleges and courses aligned with your goals"
        ]
      },
      engineering: {
        title: "Your Engineering Career Path",
        strengths: ["Technical Skills", "Project Experience", "Specialized Knowledge"],
        suggestedDomains: ["Software Development", "Data Science", "Core Engineering", "Product Management"],
        roadmap: [
          "Enhance your technical skills through online courses",
          "Build a strong portfolio with relevant projects",
          "Prepare for campus placements or higher studies",
          "Network with professionals in your field of interest"
        ]
      }
    };
    
    return baseResults[cardId] || baseResults.school;
  };

  return (
    <div className="page-container guidance-page">
      <div className="container">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="guidance-hero"
        >
          <h1>Find Your Path with <span className="gradient-text">AI Guidance</span></h1>
          <p>Select your student category to receive personalized career recommendations</p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="loading-overlay"
          >
            <div className="loading-content">
              <div className="loading-spinner"></div>
              <h3>Analyzing your responses with AI...</h3>
              <p>This may take a few moments</p>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && !showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="error-message"
          >
            <p>{error}</p>
          </motion.div>
        )}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {!activeCard ? (
            // Cards Grid
            <motion.div
              key="cards-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="cards-grid"
            >
              {STUDENT_CARDS.map((card, index) => (
                <StudentCard
                  key={card.id}
                  card={card}
                  index={index}
                  onClick={() => handleCardClick(card.id)}
                />
              ))}
            </motion.div>
          ) : showResult ? (
            // Result Preview
            <ResultPreview
              key="result-preview"
              card={currentCard}
              result={resultData}
              onBack={resetFlow}
              error={error}
            />
          ) : (
            // Question Flow
            <QuestionFlow
              key="question-flow"
              card={currentCard}
              currentStep={currentStep}
              totalSteps={currentCard.questions.length}
              question={currentQuestion}
              selectedOptions={selectedOptions}
              numericInput={numericInput}
              onToggleOption={toggleOption}
              onNumericChange={handleNumericChange}
              onBack={handleBack}
              onNext={handleNext}
              canProceed={
                currentQuestion?.type === 'numeric'
                  ? numericInput && parseFloat(numericInput) >= 0
                  : selectedOptions.length > 0
              }
            />
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .guidance-page {
          padding-top: 100px;
          min-height: 100vh;
          padding-bottom: 4rem;
          background: var(--bg-primary);
          position: relative;
        }
        
        .guidance-hero {
          text-align: center;
          margin-bottom: 4rem;
          padding: 0 1rem;
        }
        
        .guidance-hero h1 {
          font-size: 3.5rem;
          margin-bottom: 1rem;
          line-height: 1.2;
          color: #ffffff !important;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        }
        
        .guidance-hero p {
          font-size: 1.25rem;
          color: #e2e8f0 !important;
          max-width: 600px;
          margin: 0 auto;
          font-weight: 500;
        }
        
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(10px);
        }
        
        .loading-content {
          text-align: center;
          background: rgba(30, 41, 59, 0.9);
          padding: 3rem;
          border-radius: 20px;
          border: 2px solid rgba(100, 116, 139, 0.6);
          max-width: 400px;
          width: 90%;
        }
        
        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(139, 92, 246, 0.3);
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1.5rem;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .loading-content h3 {
          color: #ffffff !important;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        
        .loading-content p {
          color: #cbd5e0 !important;
          font-size: 0.95rem;
        }
        
        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
          max-width: 600px;
          margin: 0 auto 2rem;
        }
        
        .error-message p {
          color: #fecaca !important;
          margin: 0;
          font-weight: 500;
        }
        
        @media (max-width: 1024px) {
          .cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .guidance-hero h1 {
            font-size: 2.5rem;
          }
          
          .cards-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}

// Student Card Component
function StudentCard({ card, index, onClick }) {
  const Icon = card.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{
        scale: 1.03,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="student-card"
    >
      <div className="card-icon-wrapper">
        <motion.div
          className="card-icon"
          style={{ backgroundColor: `${card.color}20`, color: card.color }}
          whileHover={{ rotate: 5, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Icon size={24} />
        </motion.div>
        <motion.div
          className="card-arrow"
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.3 }}
        >
          <ChevronRight size={20} />
        </motion.div>
      </div>

      <h3>{card.title}</h3>
      <p>{card.description}</p>

      <style jsx>{`
        .student-card {
          background: rgba(30, 41, 59, 0.7);
          border: 2px solid rgba(100, 116, 139, 0.6) !important;
          border-radius: 20px;
          padding: 2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }
        
        .student-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, ${card.color}, transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .student-card:hover {
          border-color: ${card.color} !important;
          background: rgba(30, 41, 59, 0.9);
          box-shadow: 
            0 15px 35px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.15) inset;
          transform: translateY(-5px);
        }
        
        .student-card:hover::before {
          opacity: 1;
        }
        
        .card-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        
        .card-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          border: 2px solid ${card.color}70;
          background: ${card.color}30 !important;
        }
        
        .card-arrow {
          color: #cbd5e0 !important;
          transition: all 0.3s ease;
        }
        
        .student-card:hover .card-arrow {
          color: #ffffff !important;
          transform: translateX(5px);
        }
        
        h3 {
          font-size: 1.5rem;
          margin-bottom: 0.75rem;
          font-weight: 700;
          color: #ffffff !important;
          background: linear-gradient(to right, #ffffff, ${card.color});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        p {
          color: #d1d5db !important;
          line-height: 1.6;
          flex-grow: 1;
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .student-card {
            padding: 1.5rem;
          }
          
          h3 {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </motion.div>
  );
}

// Question Flow Component (unchanged)
function QuestionFlow({
  card,
  currentStep,
  totalSteps,
  question,
  selectedOptions,
  numericInput,
  onToggleOption,
  onNumericChange,
  onBack,
  onNext,
  canProceed
}) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <motion.div
      key={`question-${currentStep}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="question-flow"
    >
      <div className="flow-header">
        <button onClick={onBack} className="back-button">
          <ChevronLeft size={20} />
          Back
        </button>
        <div className="progress-section">
          <div className="step-indicator">
            Step {currentStep + 1} of {totalSteps}
          </div>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              style={{ backgroundColor: card.color }}
            />
          </div>
        </div>
      </div>

      <div className="question-content">
        <div className="question-icon">
          <Brain size={32} color={card.color} />
        </div>
        <h2>{question?.question}</h2>

        {question?.type === 'numeric' ? (
          <div className="numeric-input-wrapper">
            <input
              type="text"
              value={numericInput}
              onChange={onNumericChange}
              placeholder={question.placeholder}
              className="numeric-input"
            />
            <div className="input-hint">Enter value between 0.0 and 10.0</div>
          </div>
        ) : (
          <div className="options-grid">
            {question?.options?.map((option, index) => (
              <motion.button
                key={option}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onToggleOption(option)}
                className={`option-button ${selectedOptions.includes(option) ? 'selected' : ''}`}
                style={{
                  borderColor: selectedOptions.includes(option) ? card.color : 'rgba(255,255,255,0.1)',
                  backgroundColor: selectedOptions.includes(option) ? `${card.color}20` : 'transparent'
                }}
              >
                <span>{option}</span>
                {selectedOptions.includes(option) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                  >
                    <CheckCircle size={20} color={card.color} />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <div className="flow-actions">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="next-button"
          style={{
            backgroundColor: canProceed ? card.color : 'rgba(255,255,255,0.1)',
            cursor: canProceed ? 'pointer' : 'not-allowed'
          }}
        >
          {currentStep === totalSteps - 1 ? 'Get Results' : 'Continue'}
          <ArrowRight size={20} />
        </button>
      </div>

      <style jsx>{`
        .question-flow {
          max-width: 800px;
          margin: 0 auto;
          background: rgba(30, 41, 59, 0.8);
          border: 2px solid rgba(100, 116, 139, 0.6) !important;
          border-radius: 20px;
          padding: 2.5rem;
          backdrop-filter: blur(10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        
        .flow-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
        }
        
        .back-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(51, 65, 85, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.6) !important;
          border-radius: 8px;
          color: #e2e8f0 !important;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
          padding: 0.5rem 1rem;
          font-weight: 500;
        }
        
        .back-button:hover {
          color: #ffffff !important;
          background: rgba(71, 85, 105, 0.9);
          border-color: ${card.color} !important;
        }
        
        .progress-section {
          flex: 1;
          max-width: 400px;
        }
        
        .step-indicator {
          text-align: right;
          font-size: 0.875rem;
          color: #cbd5e0 !important;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        
        .progress-bar {
          height: 6px;
          background: rgba(100, 116, 139, 0.4);
          border-radius: 3px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          border-radius: 3px;
        }
        
        .question-content {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .question-icon {
          margin-bottom: 1.5rem;
        }
        
        h2 {
          font-size: 2rem;
          margin-bottom: 2.5rem;
          line-height: 1.3;
          color: #ffffff !important;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
          font-weight: 700;
        }
        
        .numeric-input-wrapper {
          max-width: 300px;
          margin: 0 auto;
        }
        
        .numeric-input {
          width: 100%;
          padding: 1rem 1.5rem;
          background: rgba(30, 41, 59, 0.9);
          border: 2px solid rgba(148, 163, 184, 0.6) !important;
          border-radius: 12px;
          color: #ffffff !important;
          font-size: 1.125rem;
          text-align: center;
          transition: all 0.2s;
          font-weight: 500;
        }
        
        .numeric-input::placeholder {
          color: #94a3b8 !important;
        }
        
        .numeric-input:focus {
          outline: none;
          border-color: ${card.color} !important;
          box-shadow: 0 0 0 4px ${card.color}40;
          background: rgba(30, 41, 59, 1);
        }
        
        .input-hint {
          font-size: 0.875rem;
          color: #94a3b8 !important;
          margin-top: 0.5rem;
          font-weight: 500;
        }
        
        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .option-button {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          background: rgba(51, 65, 85, 0.7);
          border: 2px solid rgba(148, 163, 184, 0.5) !important;
          border-radius: 12px;
          color: #e2e8f0 !important;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          font-weight: 500;
        }
        
        .option-button:hover:not(.selected) {
          background: rgba(71, 85, 105, 0.9);
          border-color: rgba(255, 255, 255, 0.3) !important;
          color: #ffffff !important;
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .option-button.selected {
          color: #ffffff !important;
          border-color: ${card.color} !important;
          background: rgba(${parseInt(card.color.slice(1, 3), 16)}, ${parseInt(card.color.slice(3, 5), 16)}, ${parseInt(card.color.slice(5, 7), 16)}, 0.2);
          box-shadow: 0 5px 20px ${card.color}40;
        }
        
        .flow-actions {
          text-align: center;
        }
        
        .next-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2.5rem;
          border: none;
          border-radius: 12px;
          color: #ffffff !important;
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin: 0 auto;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .next-button:not(:disabled):hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px ${card.color}60;
        }
        
        @media (max-width: 768px) {
          .question-flow {
            padding: 1.5rem;
            margin: 0 1rem;
          }
          
          .flow-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          
          .progress-section {
            max-width: 100%;
            width: 100%;
          }
          
          h2 {
            font-size: 1.5rem;
          }
          
          .options-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </motion.div>
  );
}

// Result Preview Component with API data
function ResultPreview({ card, result, onBack, error }) {
  const Icon = card.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="result-preview"
    >
      <div className="result-header">
        <button onClick={onBack} className="back-button">
          <X size={20} />
          Start Over
        </button>

        <div className="result-badge">
          <div className="badge-icon">
            <Icon size={20} />
          </div>
          AI-Powered Analysis
        </div>
      </div>

      {error && (
        <div className="api-error-notice">
          <p>⚠️ {error} Showing sample guidance based on your responses.</p>
        </div>
      )}

      <div className="result-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="result-title-section"
        >
          <h2>{result?.title || "Your Personalized Career Guidance"}</h2>
          <p>Based on your responses, here's your personalized guidance</p>
        </motion.div>

        <div className="result-grid">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="result-card"
          >
            <div className="card-header">
              <Target size={24} color={card.color} />
              <h3>Your Strengths</h3>
            </div>
            <ul className="strengths-list">
              {result?.strengths?.map((strength, index) => (
                <motion.li
                  key={strength}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <CheckCircle size={16} color={card.color} />
                  {strength}
                </motion.li>
              )) || (
                <li>Analytical thinking, Problem-solving, Adaptability</li>
              )}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="result-card"
          >
            <div className="card-header">
              <TrendingUp size={24} color={card.color} />
              <h3>Suggested Domains</h3>
            </div>
            <div className="domains-grid">
              {result?.suggestedDomains?.map((domain, index) => (
                <motion.div
                  key={domain}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="domain-tag"
                  style={{
                    backgroundColor: `${card.color}15`,
                    borderColor: `${card.color}30`
                  }}
                >
                  {domain}
                </motion.div>
              )) || (
                <>
                  <div className="domain-tag" style={{ backgroundColor: `${card.color}15`, borderColor: `${card.color}30` }}>Technology</div>
                  <div className="domain-tag" style={{ backgroundColor: `${card.color}15`, borderColor: `${card.color}30` }}>Business</div>
                  <div className="domain-tag" style={{ backgroundColor: `${card.color}15`, borderColor: `${card.color}30` }}>Research</div>
                </>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="result-card roadmap-card"
          >
            <div className="card-header">
              <Sparkles size={24} color={card.color} />
              <h3>Personalized Roadmap</h3>
            </div>
            <div className="roadmap-steps">
              {result?.roadmap?.map((step, index) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="roadmap-step"
                >
                  <div className="step-number" style={{ backgroundColor: card.color }}>
                    {index + 1}
                  </div>
                  <div className="step-content">
                    <p>{step}</p>
                  </div>
                </motion.div>
              )) || (
                <div className="roadmap-step">
                  <div className="step-number" style={{ backgroundColor: card.color }}>1</div>
                  <div className="step-content">
                    <p>Complete your current academic year with strong grades</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="result-cta"
        >
          <p className="cta-note">
            Ready to take the next step? This is AI-generated guidance based on your profile.
          </p>
          <div className="cta-buttons">
            <button className="btn btn-primary" style={{ backgroundColor: card.color }}>
              Download Full Report
            </button>
            <button className="btn btn-secondary">
              Connect with AI Counselor
            </button>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .result-preview {
          max-width: 1000px;
          margin: 0 auto;
          background: rgba(30, 41, 59, 0.8);
          border: 2px solid rgba(100, 116, 139, 0.6) !important;
          border-radius: 20px;
          padding: 2.5rem;
          backdrop-filter: blur(10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        
        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .api-error-notice {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 2rem;
          text-align: center;
        }
        
        .api-error-notice p {
          color: #fef3c7 !important;
          margin: 0;
          font-size: 0.95rem;
          font-weight: 500;
        }
        
        .back-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(51, 65, 85, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.6) !important;
          border-radius: 8px;
          padding: 0.75rem 1.25rem;
          color: #e2e8f0 !important;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.2s;
          font-weight: 500;
        }
        
        .back-button:hover {
          background: rgba(71, 85, 105, 0.9);
          color: #ffffff !important;
          border-color: ${card.color} !important;
        }
        
        .result-badge {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          background: rgba(139, 92, 246, 0.3);
          border: 1px solid rgba(139, 92, 246, 0.6) !important;
          border-radius: 50px;
          color: #c4b5fd !important;
          font-size: 0.95rem;
          font-weight: 600;
        }
        
        .badge-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(139, 92, 246, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(139, 92, 246, 0.8);
        }
        
        .result-content {
          text-align: center;
        }
        
        .result-title-section h2 {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
          color: #ffffff !important;
          background: linear-gradient(to right, #ffffff, ${card.color});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
          font-weight: 700;
        }
        
        .result-title-section p {
          color: #d1d5db !important;
          font-size: 1.125rem;
          margin-bottom: 3rem;
          font-weight: 500;
        }
        
        .result-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        
        .result-card {
          background: rgba(51, 65, 85, 0.7);
          border: 2px solid rgba(148, 163, 184, 0.4) !important;
          border-radius: 16px;
          padding: 1.5rem;
          text-align: left;
        }
        
        .roadmap-card {
          grid-column: 1 / -1;
        }
        
        .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        
        .card-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #ffffff !important;
        }
        
        .strengths-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .strengths-list li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 0;
          color: #e2e8f0 !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          font-weight: 500;
        }
        
        .strengths-list li:last-child {
          border-bottom: none;
        }
        
        .domains-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        
        .domain-tag {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          border: 1px solid !important;
          color: #ffffff !important;
          font-weight: 500;
          background: ${card.color}40 !important;
          border-color: ${card.color}80 !important;
        }
        
        .roadmap-steps {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .roadmap-step {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }
        
        .step-number {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
          color: #ffffff !important;
          border: 2px solid ${card.color};
          background: ${card.color}80;
          font-weight: 700;
        }
        
        .step-content {
          flex: 1;
          padding: 0.5rem 0;
        }
        
        .step-content p {
          color: #e2e8f0 !important;
          margin: 0;
          font-weight: 500;
        }
        
        .result-cta {
          border-top: 2px solid rgba(148, 163, 184, 0.4);
          padding-top: 2rem;
        }
        
        .cta-note {
          color: #cbd5e0 !important;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
          font-weight: 500;
        }
        
        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        
        .btn {
          padding: 1rem 2rem;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          color: #ffffff !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .btn-primary {
          border: 2px solid ${card.color}80;
        }
        
        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px ${card.color}60;
        }
        
        .btn-secondary {
          background: rgba(71, 85, 105, 0.8);
          border: 2px solid rgba(148, 163, 184, 0.6) !important;
          color: #e2e8f0 !important;
        }
        
        .btn-secondary:hover {
          background: rgba(100, 116, 139, 0.9);
          color: #ffffff !important;
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        }
        
        @media (max-width: 768px) {
          .result-preview {
            padding: 1.5rem;
            margin: 0 1rem;
          }
          
          .result-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }
          
          .result-badge {
            justify-content: center;
          }
          
          .result-title-section h2 {
            font-size: 2rem;
          }
          
          .result-grid {
            grid-template-columns: 1fr;
          }
          
          .cta-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </motion.div>
  );
}