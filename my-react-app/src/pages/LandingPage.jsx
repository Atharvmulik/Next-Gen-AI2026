import { Link } from 'react-router-dom';
import {
    ArrowRight, Bot, TrendingUp, BookOpen, BrainCircuit,
    Target, Heart, Users, Clock, Award, Sparkles,
    Home, User, Phone, Star, Navigation, Briefcase,
    MessageSquare, Settings, GraduationCap, Target as TargetIcon,
    BarChart3, Lightbulb, ListTodo
} from 'lucide-react';
import { useEffect, useState } from 'react';
import './LandingPage.css';
import Footer from '../components/Footer';
import Spline from '@splinetool/react-spline';



export default function LandingPage() {
    const [animatedStats, setAnimatedStats] = useState({
        students: 0,
        successRate: 0,
        hours: 0,
        satisfaction: 0
    });

    const [activeSection, setActiveSection] = useState('home');

    const finalStats = {
        students: 10000,
        successRate: 98,
        hours: 24,
        satisfaction: 95
    };

    const navItems = [
        { id: 'home', icon: Home, label: 'Home', path: '/' },
        { id: 'about', icon: User, label: 'About Us', path: '/about' },
        { id: 'contact', icon: Phone, label: 'Contact', path: '/contact' },
        { id: 'favorites', icon: Star, label: 'Favorites', path: '/favorites' },
        { id: 'guidance', icon: Navigation, label: 'Guidance', path: '/guidance' },
        { id: 'career', icon: Briefcase, label: 'Career', path: '/career' },
        { id: 'chat', icon: MessageSquare, label: 'AI Chat', path: '/chat' },
        { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' }
    ];

    const handleNavClick = (sectionId, path) => {
        setActiveSection(sectionId);

        // If it's a different section, navigate and scroll to top
        if (sectionId !== 'home') {
            // For demo purposes, we'll just scroll to sections on the same page
            // In real implementation, you would use react-router navigation
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            } else {
                // Navigate to the route
                window.location.href = path;
            }
        } else {
            // Scroll to top for home
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        // Animate stats counting
        const animateStats = () => {
            const duration = 2000;
            const steps = 60;
            const increment = (target, current) => (target - current) / steps;

            const intervals = Object.keys(finalStats).map(key => {
                let current = 0;
                const target = finalStats[key];
                const step = increment(target, current);

                return setInterval(() => {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(intervals[key]);
                    }
                    setAnimatedStats(prev => ({
                        ...prev,
                        [key]: Math.floor(current)
                    }));
                }, duration / steps);
            });

            return () => intervals.forEach(clearInterval);
        };

        const timeout = setTimeout(animateStats, 1500);
        return () => clearTimeout(timeout);
    }, []);

    // Add floating particles on mount
    useEffect(() => {
        const particlesContainer = document.querySelector('.particles-container');
        if (!particlesContainer) return;

        // Create additional particles
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                width: ${Math.random() * 6 + 2}px;
                height: ${Math.random() * 6 + 2}px;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                background: rgba(${Math.random() > 0.5 ? '163,212,255' : '90,155,230'}, ${Math.random() * 0.4 + 0.2});
                animation-delay: ${Math.random() * 15}s;
            `;
            particlesContainer.appendChild(particle);
        }
    }, []);

    // Handle scroll to update active section
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;

            // Simple section detection based on scroll position
            if (scrollPosition < windowHeight * 0.5) {
                setActiveSection('home');
            } else if (scrollPosition < windowHeight * 1.5) {
                setActiveSection('about');
            } else if (scrollPosition < windowHeight * 2.5) {
                setActiveSection('contact');
            } else {
                setActiveSection('favorites');
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero" id="home">
                {/* Background particles */}
                <div className="particles-container"></div>

                {/* Floating elements */}
                <div className="floating-element">
                    <Sparkles size={24} />
                </div>
                <div className="floating-element">
                    <BrainCircuit size={24} />
                </div>
                <div className="floating-element">
                    <Award size={24} />
                </div>

                <div className="container hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">
                            <span className="title-line-1">Your Future,</span>
                            <span className="title-line-2">
                                <span className="word-reveal">
                                    {"Guided by AI".split(" ").map((word, i) => (
                                        <span key={i} className="word" style={{ animationDelay: `${1.2 + i * 0.2}s` }}>
                                            {word}&nbsp;
                                        </span>
                                    ))}
                                </span>
                            </span>
                        </h1>
                        <div className="hero-cta">
                            <Link to="/guidance" className="btn btn-primary btn-shimmer">
                                Get Guidance <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                            </Link>
                            <Link to="/counseling" className="btn btn-secondary">
                                Talk to AI Counselor
                            </Link>
                        </div>

                        {/* Quick Actions Bar */}
                        <div className="quick-actions-bar">
                            <Link to="/guidance" className="action-item">
                                <div className="action-icon"><TargetIcon size={20} /></div>
                                <span>Personalized Roadmap</span>
                            </Link>
                            <Link to="/counseling" className="action-item">
                                <div className="action-icon"><Heart size={20} /></div>
                                <span>24/7 Support</span>
                            </Link>
                            <Link to="/tasks" className="action-item">
                                <div className="action-icon"><ListTodo size={20} /></div>
                                <span>Task Keeper</span>
                            </Link>
                        </div>

                        {/* Animated Stats */}
                        <div className="animated-stats">
                            <div className="stat-box">
                                <div className="stat-number">+{animatedStats.students}</div>
                                <div className="stat-label">Students Helped</div>
                                <Users size={24} style={{ marginTop: '10px', color: 'rgba(163, 212, 255, 0.5)' }} />
                            </div>
                            <div className="stat-box">
                                <div className="stat-number">{animatedStats.successRate}%</div>
                                <div className="stat-label">Success Rate</div>
                                <Award size={24} style={{ marginTop: '10px', color: 'rgba(163, 212, 255, 0.5)' }} />
                            </div>
                            <div className="stat-box">
                                <div className="stat-number">{animatedStats.hours}/7</div>
                                <div className="stat-label">AI Support</div>
                                <Clock size={24} style={{ marginTop: '10px', color: 'rgba(163, 212, 255, 0.5)' }} />
                            </div>
                            <div className="stat-box">
                                <div className="stat-number">{animatedStats.satisfaction}%</div>
                                <div className="stat-label">Satisfaction</div>
                                <Heart size={24} style={{ marginTop: '10px', color: 'rgba(163, 212, 255, 0.5)' }} />
                            </div>
                        </div>
                    </div>

                    {/* Right Side Visual - Video */}
                    <div className="hero-visual">
                        <Spline
                            className="spline-robot"
                            scene="https://prod.spline.design/EOOZMlGnn2JFX87q/scene.splinecode"
                        />
                    </div>
                </div>

                {/* Background Blobs */}
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
            </section>

            {/* About Section */}
            <section className="section about" id="about" >
                <div className="container">
                    <div className="section-header">
                        <h2>Why Choose AI Guidance?</h2>
                        <p>We blend advanced AI with empathy to help you navigate your academic journey with confidence and clarity.</p>
                    </div>

                    <div className="features-grid">
                        {/* Card 1: Roadmap (Front) / Saved Roadmaps (Back) */}
                        <div className="flip-card">
                            <div className="flip-card-inner">
                                <div className="flip-card-front">
                                    <div className="icon-wrapper"><BookOpen size={32} /></div>
                                    <h3>Personalized Roadmap</h3>
                                    <p>Get a custom study plan based on your strengths, weaknesses, and goals. AI-powered analysis creates the perfect path for your success.</p>
                                </div>
                                <div className="flip-card-back">
                                    <div className="icon-wrapper"><Star size={32} /></div>
                                    <h3>Saved Roadmaps</h3>
                                    <p>Access your personalized study plans anytime, anywhere with our AI-powered roadmap system.</p>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: AI Counseling (Front) / Favorite Counselors (Back) */}
                        <div className="flip-card">
                            <div className="flip-card-inner">
                                <div className="flip-card-front">
                                    <div className="icon-wrapper"><BrainCircuit size={32} /></div>
                                    <h3>AI Counseling</h3>
                                    <p>24/7 emotional support to manage exam stress and anxiety. Our AI understands and responds to your emotional needs instantly.</p>
                                </div>
                                <div className="flip-card-back">
                                    <div className="icon-wrapper"><Heart size={32} /></div>
                                    <h3>Favorite Counselors</h3>
                                    <p>Connect with your preferred AI counselors for consistent and personalized support.</p>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Task Keeper (Front) / Bookmarked Resources (Back) */}
                        <div className="flip-card">
                            <div className="flip-card-inner">
                                <div className="flip-card-front">
                                    <div className="icon-wrapper"><ListTodo size={32} /></div>
                                    <h3>Task Keeper</h3>
                                    <p>Stay organized and motivated. Track your daily goals, set priorities, and celebrate your progress with our smart task manager.</p>
                                </div>
                                <div className="flip-card-back">
                                    <div className="icon-wrapper"><GraduationCap size={32} /></div>
                                    <h3>Bookmarked Resources</h3>
                                    <p>Quickly find your saved articles, videos, and study materials for efficient learning.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="section cta-section" id="contact" >
                <div className="container">
                    <div className="cta-box">
                        <h2>Ready to Shape Your Future?</h2>
                        <p>"The best way to predict your future is to create it." - Peter Drucker</p>
                        <Link to="/guidance" className="btn btn-primary">
                            <Sparkles size={18} style={{ marginRight: '10px' }} />
                            Start Your Journey Today
                        </Link>
                    </div>
                </div>
            </section>

            {/* Additional Features Section */}
            <section className="section about" id="features" style={{ background: 'rgba(34, 70, 112, 0.2)' }}>
                <div className="container">
                    <div className="section-header">
                        <h2>Advanced Features</h2>
                        <p>Experience cutting-edge AI technology designed for your success</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card dark-variant">
                            <div className="icon-wrapper"><BarChart3 size={32} /></div>
                            <h3>Progress Analytics</h3>
                            <p>Track your learning progress with detailed analytics and performance insights powered by AI algorithms.</p>
                        </div>
                        <div className="feature-card">
                            <div className="icon-wrapper"><Target size={32} /></div>
                            <h3>Goal Setting</h3>
                            <p>Set and achieve academic and career goals with our intelligent goal-tracking system.</p>
                        </div>
                        <div className="feature-card dark-variant">
                            <div className="icon-wrapper"><Lightbulb size={32} /></div>
                            <h3>Smart Recommendations</h3>
                            <p>Receive personalized course and career recommendations based on your interests and performance.</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}