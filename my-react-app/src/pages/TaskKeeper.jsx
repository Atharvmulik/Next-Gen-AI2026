import { useState, useEffect, useMemo } from 'react';

import {
    CheckCircle2, Circle, Plus, Calendar, Flag,
    Trash2, Trophy, ListTodo, Star, Sparkles, PartyPopper,
    Bell, AlertCircle, BookOpen, Dumbbell, Coffee, Layout,
    ChevronRight, X
} from 'lucide-react';

// API base URL - adjust this based on your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function TaskKeeper() {
    const [tasks, setTasks] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [selectedPriority, setSelectedPriority] = useState('Medium');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showConfetti, setShowConfetti] = useState(false);
    const [popQuote, setPopQuote] = useState('');
    const [displayDate, setDisplayDate] = useState(new Date());
    const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const categories = [
        { name: 'Study', icon: <BookOpen size={14} />, color: 'blue' },
        { name: 'Health', icon: <Dumbbell size={14} />, color: 'green' },
        { name: 'Personal', icon: <Coffee size={14} />, color: 'purple' },
        { name: 'Project', icon: <Layout size={14} />, color: 'orange' }
    ];

    const motivationalQuotes = [
        { text: "Believe in yourself. Small steps lead to big success ❤️", type: "heart" },
        { text: "Consistency beats motivation. Keep going ✨", type: "spark" },
        { text: "Your hard work today will pay off tomorrow 🌟", type: "star" },
        { text: "Every small effort counts toward your big dream 🚀", type: "rocket" }
    ];

    const congratsQuotes = [
        "Small steps lead to big changes!",
        "You are doing great, keep it up!",
        "Success is the sum of small efforts.",
        "One task at a time!",
        "You're making progress every day!"
    ];

    const gentlePushQuotes = [
        "Don't worry about being late, focus on starting now! 💪",
        "It's okay to fall behind, just don't quit. You've got this! ✨",
        "Your future self will thank you for finishing this today. 🌟",
        "Mistakes are proof that you are trying. Keep going! ❤️"
    ];

    // Stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // Fetch tasks from backend on component mount
    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    // Fetch tasks from backend
    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_BASE_URL}/tasks/`);
            if (!response.ok) {
                throw new Error(`Failed to fetch tasks: ${response.status}`);
            }
            const data = await response.json();
            // Convert due_date from string to Date object for frontend compatibility
            const formattedTasks = data.map(task => ({
                ...task,
                dueDate: task.due_date, // Use the due_date from backend
                due_date: undefined // Remove the original field to avoid confusion
            }));
            setTasks(formattedTasks);
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError('Failed to load tasks. Please try again.');
            // You might want to keep the dummy data as fallback
            setTasks([
                { id: 1, text: "Finish Physics assignment", priority: "High", category: "Study", dueDate: new Date().toISOString().split('T')[0], completed: false, overdueNotified: false },
                { id: 2, text: "Evening 30 min yoga", priority: "Medium", category: "Health", dueDate: new Date().toISOString().split('T')[0], completed: true, overdueNotified: false },
                { id: 3, text: "Review scholarship essay", priority: "High", category: "Project", dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], completed: false, overdueNotified: false },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Check for overdue tasks
    useEffect(() => {
        const checkOverdue = () => {
            const now = new Date();
            const overdueTasks = tasks.filter(task =>
                !task.completed &&
                new Date(task.dueDate) < now &&
                !task.overdueNotified
            );

            if (overdueTasks.length > 0) {
                const newNotifications = overdueTasks.map(task => ({
                    id: Date.now() + Math.random(),
                    taskId: task.id,
                    message: `Gentle Push: "${task.text}" is waiting for you!`,
                    quote: gentlePushQuotes[Math.floor(Math.random() * gentlePushQuotes.length)],
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));

                setNotifications(prev => [...newNotifications, ...prev]);

                // Update overdue notification status in backend
                overdueTasks.forEach(task => {
                    markOverdueNotified(task.id);
                });
            }
        };

        const timer = setTimeout(checkOverdue, 2000);
        return () => clearTimeout(timer);
    }, [tasks]);

    // Add task to backend
    const addTask = async () => {
        if (!inputValue.trim()) return;

        try {
            const taskData = {
                text: inputValue,
                priority: selectedPriority,
                category: 'Study', // Default category
                due_date: selectedDate // Use due_date for backend
            };

            const response = await fetch(`${API_BASE_URL}/tasks/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
            });

            if (!response.ok) {
                throw new Error(`Failed to add task: ${response.status}`);
            }

            const newTask = await response.json();
            // Convert due_date to dueDate for frontend
            const formattedTask = {
                ...newTask,
                dueDate: newTask.due_date,
                due_date: undefined
            };

            setTasks([formattedTask, ...tasks]);
            setInputValue('');
            setSelectedPriority('Medium');
        } catch (err) {
            console.error('Error adding task:', err);
            setError('Failed to add task. Please try again.');
        }
    };

    // Toggle task completion in backend
    const toggleTask = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${id}/toggle`, {
                method: 'PUT',
            });

            if (!response.ok) {
                throw new Error(`Failed to toggle task: ${response.status}`);
            }

            const result = await response.json();

            setTasks(tasks.map(task => {
                if (task.id === id) {
                    const isCompleted = result.completed;
                    if (isCompleted) {
                        triggerCelebration();
                        // Clear notifications for this task if it was overdue
                        setNotifications(prev => prev.filter(n => n.taskId !== id));
                    }
                    return { ...task, completed: isCompleted };
                }
                return task;
            }));
        } catch (err) {
            console.error('Error toggling task:', err);
            setError('Failed to update task. Please try again.');
        }
    };

    // Mark task as overdue notified in backend
    const markOverdueNotified = async (taskId) => {
        try {
            await fetch(`${API_BASE_URL}/tasks/${taskId}/overdue`, {
                method: 'PUT',
            });

            // Update local state
            setTasks(prev => prev.map(t =>
                t.id === taskId
                    ? { ...t, overdueNotified: true } : t
            ));
        } catch (err) {
            console.error('Error marking task as overdue notified:', err);
        }
    };

    // Delete task from backend
    const deleteTask = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`Failed to delete task: ${response.status}`);
            }

            setTasks(tasks.filter(t => t.id !== id));
            setNotifications(prev => prev.filter(n => n.taskId !== id));
        } catch (err) {
            console.error('Error deleting task:', err);
            setError('Failed to delete task. Please try again.');
        }
    };

    const triggerCelebration = () => {
        const randomQuote = congratsQuotes[Math.floor(Math.random() * congratsQuotes.length)];
        setPopQuote(randomQuote);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
    };

    const isOverdue = (dueDate, completed) => {
        if (completed) return false;
        const d = new Date(dueDate);
        d.setHours(23, 59, 59); // Consider overdue only after the day ends
        return d < new Date();
    };

    const filteredTasks = useMemo(() => {
        // Sort: Overdue first, then High priority, then medium, then low
        return [...tasks].sort((a, b) => {
            const aOverdue = isOverdue(a.dueDate, a.completed);
            const bOverdue = isOverdue(b.dueDate, b.completed);
            if (aOverdue && !bOverdue) return -1;
            if (!aOverdue && bOverdue) return 1;

            const pMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
            return pMap[b.priority] - pMap[a.priority];
        });
    }, [tasks, displayDate]);

    return (
        <div className="page-container task-keeper-page">
            <div className="container" style={{ maxWidth: '800px' }}>

                {/* Header */}
                <div className="header-section animate-slide-up">
                    <div className="header-top">
                        <div className="title-wrapper">
                            <div className="icon-bg">
                                <ListTodo size={32} color="white" />
                            </div>
                            <h1>Task Keeper <span className="sparkle-emoji">✨</span></h1>
                        </div>

                        <div className="header-actions">
                            <button
                                className={`notif-btn ${notifications.length > 0 ? 'has-new' : ''}`}
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <Bell size={22} />
                                {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
                            </button>

                            <div className="date-selector animate-fade-in">
                                {[0, 1, 2].map((offset) => {
                                    const d = new Date();
                                    d.setDate(d.getDate() + offset);
                                    const isSelected = d.toDateString() === displayDate.toDateString();
                                    return (
                                        <button
                                            key={offset}
                                            className={`date-btn ${isSelected ? 'active' : ''}`}
                                            onClick={() => setDisplayDate(new Date(d))}
                                        >
                                            <span className="day-name">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                            <span className="day-num">{d.getDate()}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="error-message animate-fade-in">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                        <button onClick={() => setError(null)}><X size={14} /></button>
                    </div>
                )}

                {/* Notification Panel */}
                {showNotifications && (
                    <div className="notifications-panel glass-card animate-pop-in">
                        <div className="notif-header">
                            <h3>Gentle Pushes</h3>
                            <button onClick={() => setShowNotifications(false)}><X size={18} /></button>
                        </div>
                        <div className="notif-list">
                            {notifications.length === 0 ? (
                                <p className="empty-notif">No new reminders. Stay awesome! 🌟</p>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} className="notif-item">
                                        <div className="notif-icon"><AlertCircle size={18} /></div>
                                        <div className="notif-content">
                                            <p className="notif-msg">{n.message}</p>
                                            <p className="notif-quote">"{n.quote}"</p>
                                            <span className="notif-time">{n.time}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Celebration Overlay */}
                {showConfetti && (
                    <div className="celebration-toast animate-pop-in">
                        <PartyPopper size={24} color="#FFD700" />
                        <span>{popQuote}</span>
                    </div>
                )}

                {/* Main Stats */}
                <div className="main-stats-card glass-card animate-fade-in delay-100">
                    <div className="progress-info">
                        <div className="text-left">
                            <h3>Daily Progress</h3>
                            <p>{completedTasks} of {totalTasks} tasks completed</p>
                        </div>
                        <div className="percentage-circle">
                            <svg width="60" height="60" viewBox="0 0 60 60">
                                <circle cx="30" cy="30" r="25" stroke="#f1f5f9" strokeWidth="6" fill="none" />
                                <circle cx="30" cy="30" r="25" stroke="#f59e0b" strokeWidth="6" fill="none"
                                    strokeDasharray={`${(progress / 100) * 157} 157`} strokeLinecap="round" />
                                <text x="50%" y="54%" textAnchor="middle" fontSize="14" fontWeight="700" fill="#334155">{progress}%</text>
                            </svg>
                        </div>
                    </div>
                    <div className="stat-pills">
                        <div className="pill overdue">
                            <AlertCircle size={14} /> {tasks.filter(t => isOverdue(t.dueDate, t.completed)).length} Overdue
                        </div>
                        <div className="pill focused">
                            <Trophy size={14} /> Level {Math.floor(completedTasks / 5) + 1}
                        </div>
                    </div>
                </div>

                {/* Advanced Input Section */}
                <div className="advanced-input-card glass-card animate-slide-up delay-200">
                    <div className="input-field-row">
                        <input
                            type="text"
                            placeholder="I want to accomplish..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addTask()}
                            disabled={loading}
                        />
                        <button
                            className="premium-add-btn"
                            onClick={addTask}
                            disabled={!inputValue.trim() || loading}
                        >
                            {loading ? (
                                <div className="spinner"></div>
                            ) : (
                                <Plus size={20} />
                            )}
                        </button>
                    </div>

                    <div className="settings-row">
                        <div className="setting-group">
                            <span className="setting-label">Due Date</span>
                            <div className="date-input-wrapper">
                                <Calendar size={14} />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="setting-group">
                            <span className="setting-label">Priority</span>
                            <select
                                value={selectedPriority}
                                onChange={(e) => setSelectedPriority(e.target.value)}
                                className={`priority-select ${selectedPriority.toLowerCase()}`}
                                disabled={loading}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Dynamic Tasks Feed */}
                <div className="tasks-feed">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner-large"></div>
                            <p>Loading your tasks...</p>
                        </div>
                    ) : (
                        <>
                            {filteredTasks.map((task, index) => {
                                const late = isOverdue(task.dueDate, task.completed);
                                const catInfo = categories.find(c => c.name === task.category) || categories[0];

                                return (
                                    <div
                                        key={task.id}
                                        className={`premium-task-card glass-card animate-slide-up ${task.completed ? 'completed' : ''} ${late ? 'overdue' : ''}`}
                                        style={{ animationDelay: `${0.3 + (index * 0.1)}s` }}
                                    >
                                        <button
                                            className={`modern-check ${task.completed ? 'active' : ''}`}
                                            onClick={() => toggleTask(task.id)}
                                            disabled={loading}
                                        >
                                            {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                        </button>

                                        <div className="task-body">
                                            <div className="task-top">
                                                <span className={`cat-tag ${catInfo.color}`}>
                                                    {catInfo.icon} {task.category}
                                                </span>
                                                {late && <span className="late-indicator">LATE</span>}
                                            </div>
                                            <h4 className="task-title">{task.text}</h4>
                                            <div className="task-footer">
                                                <span className={`priority-pill ${task.priority.toLowerCase()}`}>
                                                    <Flag size={12} /> {task.priority}
                                                </span>
                                                <span className="due-info">
                                                    <Calendar size={12} /> {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            className="minimal-delete"
                                            onClick={() => deleteTask(task.id)}
                                            disabled={loading}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                );
                            })}

                            {tasks.length === 0 && !loading && (
                                <div className="empty-state-enhanced">
                                    <div className="empty-illustration">🚀</div>
                                    <h3>Ready to grow?</h3>
                                    <p>Small actions lead to big achievements. Add your first goal above!</p>
                                    <button
                                        className="quick-start-btn"
                                        onClick={() => {
                                            setInputValue("Complete one chapter of Science");
                                            setSelectedPriority("High");
                                        }}
                                        disabled={loading}
                                    >
                                        Try: "Complete one chapter..."
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer Motivation Context */}
                <div className="quotes-section-enhanced animate-slide-up delay-400">
                    <div className="quote-card-modern">
                        <div className="sparkle-container">
                            {motivationalQuotes[activeQuoteIndex].type === 'heart' && <Star size={28} className="theme-icon" />}
                            {motivationalQuotes[activeQuoteIndex].type === 'spark' && <Sparkles size={28} className="theme-icon" />}
                            {motivationalQuotes[activeQuoteIndex].type === 'star' && <Star size={28} className="theme-icon" />}
                            {motivationalQuotes[activeQuoteIndex].type === 'rocket' && <Trophy size={28} className="theme-icon" />}
                        </div>
                        <div className="quote-content">
                            <p className="quote-main">{motivationalQuotes[activeQuoteIndex].text}</p>
                            <div className="quote-progress-bar">
                                <div className="bar-fill" key={activeQuoteIndex}></div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <style jsx>{`
                .task-keeper-page {
                    padding-top: 100px;
                    padding-bottom: 80px;
                    min-height: 100vh;
                    background: var(--background);
                    background-image: 
                        radial-gradient(at 0% 0%, rgba(249, 115, 22, 0.05) 0px, transparent 50%),
                        radial-gradient(at 100% 100%, rgba(254, 215, 170, 0.1) 0px, transparent 50%);
                }

                .header-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .notif-btn {
                    position: relative;
                    background: white;
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-secondary);
                    box-shadow: var(--shadow-sm);
                    transition: all 0.3s;
                }

                .notif-btn.has-new {
                    color: var(--primary);
                }

                .notif-badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #ef4444;
                    color: white;
                    font-size: 0.7rem;
                    font-weight: 800;
                    padding: 2px 6px;
                    border-radius: 10px;
                    border: 2px solid white;
                }

                .date-selector {
                    display: flex;
                    gap: 0.4rem;
                    background: rgba(255,255,255,0.8);
                    padding: 0.3rem;
                    border-radius: 14px;
                    backdrop-filter: blur(10px);
                }

                .date-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    width: 44px;
                    height: 48px;
                    border-radius: 10px;
                    transition: all 0.3s;
                    color: var(--text-tertiary);
                }

                .date-btn.active {
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 4px 10px rgba(249, 115, 22, 0.3);
                }

                .day-name { font-size: 0.6rem; font-weight: 700; }
                .day-num { font-size: 1rem; font-weight: 800; }

                /* Error Message */
                .error-message {
                    background: #fee2e2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                    padding: 0.8rem 1rem;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                    font-size: 0.9rem;
                    font-weight: 600;
                }

                .error-message button {
                    margin-left: auto;
                    background: none;
                    border: none;
                    color: #dc2626;
                    cursor: pointer;
                }

                /* Notifications Panel */
                .notifications-panel {
                    position: fixed;
                    top: 160px;
                    right: calc(50% - 400px);
                    width: 320px;
                    max-height: 400px;
                    z-index: 1000;
                    background: white;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.1);
                }

                @media (max-width: 850px) {
                    .notifications-panel { right: 1.5rem; left: 1.5rem; width: auto; }
                }

                .notif-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .notif-header h3 { font-size: 1.1rem; font-weight: 800; color: var(--text-primary); }

                .notif-list { overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }

                .notif-item {
                    display: flex;
                    gap: 1rem;
                    padding: 1rem;
                    background: #fffaf0;
                    border-radius: 12px;
                    border: 1px solid #fef3c7;
                }

                .notif-icon { color: #f59e0b; flex-shrink: 0; }
                .notif-msg { font-size: 0.9rem; font-weight: 700; color: #92400e; margin-bottom: 0.2rem; }
                .notif-quote { font-size: 0.8rem; font-style: italic; color: #b45309; margin-bottom: 0.4rem; }
                .notif-time { font-size: 0.7rem; color: #d97706; font-weight: 600; }

                /* Main Stats Card */
                .main-stats-card {
                    padding: 1.5rem 2rem;
                    margin-bottom: 2rem;
                    background: white;
                }

                .progress-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .progress-info h3 { font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin:0;}
                .progress-info p { color: var(--text-tertiary); font-size: 0.9rem; margin-top: 0.2rem;}

                .stat-pills { display: flex; gap: 0.8rem; }
                .pill {
                    padding: 0.4rem 0.8rem;
                    border-radius: 100px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                }
                .pill.overdue { background: #fee2e2; color: #ef4444; }
                .pill.focused { background: #fef9c3; color: #b45309; }

                /* Advanced Input */
                .advanced-input-card {
                    padding: 1.5rem;
                    margin-bottom: 2.5rem;
                    background: white;
                    border: 1px solid rgba(249, 115, 22, 0.1);
                }

                .input-field-row {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .input-field-row input {
                    flex: 1;
                    padding: 0.8rem 1rem;
                    font-size: 1.2rem;
                    font-weight: 600;
                    border: none;
                    background: #f8fafc;
                    border-radius: 12px;
                    outline: none;
                    transition: background 0.3s;
                }

                .input-field-row input:focus { background: #f1f5f9; }
                .input-field-row input:disabled { opacity: 0.6; cursor: not-allowed; }

                .premium-add-btn {
                    background: var(--gradient-primary);
                    color: white;
                    width: 50px;
                    height: 50px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);
                    position: relative;
                }

                .premium-add-btn:disabled { opacity: 0.5; filter: grayscale(1); }

                .spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .settings-row {
                    display: flex;
                    gap: 2rem;
                    padding-top: 1rem;
                    border-top: 1px solid #f1f5f9;
                    flex-wrap: wrap;
                }

                .setting-group { display: flex; flex-direction: column; gap: 0.6rem; }
                .setting-label { font-size: 0.75rem; font-weight: 800; color: var(--text-tertiary); text-transform: uppercase; }

                .date-input-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #f1f5f9;
                    padding: 0.4rem 0.8rem;
                    border-radius: 8px;
                    color: var(--text-secondary);
                }
                .date-input-wrapper input { 
                    background: none; 
                    border: none; 
                    font-size: 0.85rem; 
                    font-weight: 600; 
                    outline: none; 
                    padding: 0;
                }
                .date-input-wrapper input:disabled { opacity: 0.6; cursor: not-allowed; }

                .priority-select {
                    background: #f1f5f9;
                    border: none;
                    padding: 0.4rem 0.8rem;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    outline: none;
                }
                .priority-select.high { color: #ef4444; }
                .priority-select:disabled { opacity: 0.6; cursor: not-allowed; }

                /* Loading State */
                .loading-state {
                    text-align: center;
                    padding: 4rem 2rem;
                }

                .spinner-large {
                    width: 50px;
                    height: 50px;
                    border: 3px solid #f1f5f9;
                    border-radius: 50%;
                    border-top-color: var(--primary);
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1.5rem;
                }

                .loading-state p {
                    color: var(--text-tertiary);
                    font-weight: 600;
                }

                /* Tasks feed */
                .tasks-feed { display: flex; flex-direction: column; gap: 1rem; }

                .premium-task-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 1.25rem;
                    padding: 1.5rem;
                    background: white;
                    border-left: 5px solid transparent;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .premium-task-card.overdue { border-left-color: #ef4444; background: #fffcfc; }
                .premium-task-card:hover { transform: translateX(5px); box-shadow: var(--shadow-lg); }

                .modern-check { color: #e2e8f0; transition: all 0.3s; padding-top: 4px; cursor: pointer; }
                .modern-check.active { color: #22c55e; }
                .modern-check:disabled { opacity: 0.6; cursor: not-allowed; }

                .task-body { flex: 1; }
                .task-top { display: flex; gap: 0.8rem; align-items: center; margin-bottom: 0.6rem; }
                .cat-tag { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; display: flex; align-items: center; gap: 0.3rem; padding: 0.2rem 0.6rem; border-radius: 6px; }
                .cat-tag.blue { background: #eff6ff; color: #2563eb; }
                .cat-tag.green { background: #f0fdf4; color: #16a34a; }
                .cat-tag.purple { background: #faf5ff; color: #9333ea; }
                .cat-tag.orange { background: #fff7ed; color: #ea580c; }

                .late-indicator { font-size: 0.65rem; font-weight: 900; color: #ef4444; background: #fee2e2; padding: 2px 6px; border-radius: 4px; }

                .task-title { font-size: 1.15rem; font-weight: 600; color: var(--text-primary); margin: 0 0 0.8rem 0; line-height: 1.4; }
                .premium-task-card.completed .task-title { text-decoration: line-through; color: var(--text-tertiary); opacity: 0.7; }

                .task-footer { display: flex; gap: 1.5rem; }
                .priority-pill { font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 0.3rem; }
                .priority-pill.high { color: #ef4444; }
                .priority-pill.medium { color: #f59e0b; }
                .priority-pill.low { color: #3b82f6; }

                .due-info { font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary); display: flex; align-items: center; gap: 0.3rem; }

                .minimal-delete { 
                    opacity: 0; 
                    transition: 0.3s; 
                    color: #cbd5e1; 
                    cursor: pointer;
                }
                .premium-task-card:hover .minimal-delete { opacity: 1; }
                .minimal-delete:hover { color: #ef4444; }
                .minimal-delete:disabled { opacity: 0.5; cursor: not-allowed; }

                /* Enhanced Empty State */
                .empty-state-enhanced {
                    text-align: center;
                    padding: 5rem 2rem;
                }
                .empty-illustration { font-size: 4rem; margin-bottom: 1.5rem; }
                .empty-state-enhanced h3 { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem; }
                .empty-state-enhanced p { color: var(--text-tertiary); margin-bottom: 2rem; }
                .quick-start-btn { 
                    background: #f1f5f9; border: 2px dashed #cbd5e1; padding: 0.8rem 1.5rem; 
                    border-radius: 12px; font-weight: 700; color: var(--text-secondary); transition: 0.3s;
                    cursor: pointer;
                }
                .quick-start-btn:hover { border-color: var(--primary); color: var(--primary); background: #fff7ed; }
                .quick-start-btn:disabled { opacity: 0.6; cursor: not-allowed; }

                /* Enhanced Quotes */
                .quotes-section-enhanced { margin-top: 5rem; }
                .quote-card-modern {
                    background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
                    border-radius: 32px;
                    padding: 2.5rem;
                    display: flex;
                    align-items: center;
                    gap: 2.5rem;
                    color: white;
                    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
                    position: relative;
                    overflow: hidden;
                }

                @media (max-width: 640px) {
                    .quote-card-modern { flex-direction: column; text-align: center; gap: 1.5rem; }
                }

                .quote-card-modern::before {
                    content: '“';
                    position: absolute;
                    top: -20px;
                    right: 40px;
                    font-size: 12rem;
                    color: rgba(255,255,255,0.05);
                    font-family: serif;
                }

                .sparkle-container {
                    width: 70px;
                    height: 70px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    backdrop-filter: blur(5px);
                }

                .theme-icon { color: var(--primary); filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.5)); }

                .quote-content { flex: 1; }
                .quote-main { font-size: 1.4rem; font-weight: 700; margin: 0 0 1.5rem 0; line-height: 1.4; color: #f1f5f9;}

                .quote-progress-bar { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; }
                .bar-fill { 
                    height: 100%; width: 100%; background: var(--primary); 
                    animation: barAnim 8s linear infinite; transform-origin: left;
                }

                @keyframes barAnim { from { transform: scaleX(0); } to { transform: scaleX(1); } }

                .celebration-toast {
                    position: fixed;
                    bottom: 40px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: white;
                    padding: 1rem 2.5rem;
                    border-radius: 100px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    z-index: 2000;
                    border: 2px solid var(--accent);
                    font-weight: 800;
                    color: var(--primary);
                }
                @keyframes popIn {
                    0% { transform: scale(0.9); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                
                .animate-pop-in {
                    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                @media (max-width: 768px) {
                    .header-top { flex-direction: column; gap: 1.5rem; text-align: center; }
                    .header-actions { flex-direction: column; width: 100%; }
                    .advanced-input-card { padding: 1rem; }
                    .settings-row { gap: 1rem; }
                    .main-stats-card { padding: 1rem; }
                    .stat-pills { flex-wrap: wrap; }
                }
            `}</style>


        </div>
    );
}