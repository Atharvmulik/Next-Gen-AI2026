import { useState, useEffect } from 'react';
import { Search, TrendingUp, Filter, MapPin, DollarSign, ChevronRight, Info, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Counseling.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Counseling() {
  const [activeTab, setActiveTab] = useState('predictor');
  const [percentileRange, setPercentileRange] = useState([0, 100]);
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [minFee, setMinFee] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [cities, setCities] = useState(['All Cities']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Smart Compare states
  const [college1Search, setCollege1Search] = useState('');
  const [college2Search, setCollege2Search] = useState('');
  const [studentPercentile, setStudentPercentile] = useState('');
  const [comparisonResult, setComparisonResult] = useState(null);
  const [comparing, setComparing] = useState(false);
  const [collegeSuggestions1, setCollegeSuggestions1] = useState([]);
  const [collegeSuggestions2, setCollegeSuggestions2] = useState([]);

  // Fetch cities on component mount
  useEffect(() => {
    fetchCities();
  }, []);

  // Fetch cities from backend
  const fetchCities = async () => {
    try {
      const response = await fetch(`${API_BASE}/recommend/cities`);
      const data = await response.json();
      if (data.cities) {
        setCities(data.cities);
      }
    } catch (err) {
      console.error('Failed to fetch cities:', err);
    }
  };

  const handlePercentileChange = (index, value) => {
    const newRange = [...percentileRange];
    newRange[index] = parseFloat(value) || 0;
    setPercentileRange(newRange);
  };

  const handleFindColleges = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        min_percentile: percentileRange[0],
        max_percentile: percentileRange[1],
        ...(selectedCity && selectedCity !== 'All Cities' && { city: selectedCity }),
        ...(minFee && { min_fees: minFee }),
        ...(maxFee && { max_fees: maxFee })
      });

      const response = await fetch(`${API_BASE}/recommend/colleges/filter?${params}`);
      const data = await response.json();

      if (data.colleges) {
        setColleges(data.colleges);
        setFilteredColleges(data.colleges);
        setShowResults(true);
      } else {
        setError('No colleges found');
      }
    } catch (err) {
      setError('Failed to fetch colleges. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Search colleges for autocomplete
  const searchColleges = async (query, setSuggestions) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/recommend/colleges/filter?min_percentile=0&max_percentile=100`);
      const data = await response.json();

      if (data.colleges) {
        const filtered = data.colleges.filter(college =>
          college.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
        setSuggestions(filtered);
      }
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  // Handle Smart Compare
  const handleCompareColleges = async () => {
    if (!college1Search || !college2Search || !studentPercentile) {
      setError('Please fill all fields for comparison');
      return;
    }

    setComparing(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/recommend/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          college1_name: college1Search,
          college2_name: college2Search,
          student_percentile: parseFloat(studentPercentile),
          exam_type: "MHT-CET",
          seat_category: "General Open"
        })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setComparisonResult(data);
      }
    } catch (err) {
      setError('Comparison failed. Please try again.');
      console.error(err);
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="counseling-page">
      {/* Background Decor */}
      <div className="blob blob-orange"></div>
      <div className="blob blob-yellow"></div>

      <div className="counseling-container">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`tab-btn ${activeTab === 'predictor' ? 'active' : ''}`}
            onClick={() => setActiveTab('predictor')}
          >
            <Search size={20} />
            College Predictor
          </motion.button>
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`tab-btn ${activeTab === 'compare' ? 'active' : ''}`}
            onClick={() => setActiveTab('compare')}
          >
            <TrendingUp size={20} />
            Smart Compare
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {/* College Predictor Section */}
          {activeTab === 'predictor' && (
            <motion.div
              key="predictor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="predictor-section"
            >
              <div className="predictor-layout">
                {/* Left Sidebar - Filter Criteria */}
                <div className="filter-sidebar glass-card">
                  <div className="filter-header">
                    <Filter size={18} color="#ff6b35" />
                    <h3>Filters</h3>
                    <motion.button
                      whileHover={{ rotate: 180 }}
                      className="reset-btn"
                      onClick={() => {
                        setPercentileRange([0, 100]);
                        setSelectedCity('All Cities');
                        setMinFee('');
                        setMaxFee('');
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                    >
                      ↻
                    </motion.button>
                  </div>

                  <div className="filter-section">
                    <label>Percentile Range</label>
                    <div className="range-inputs">
                      <input
                        type="number"
                        placeholder="Min"
                        value={percentileRange[0]}
                        onChange={(e) => handlePercentileChange(0, e.target.value)}
                        className="range-input"
                        min="0"
                        max="100"
                      />
                      <span className="range-separator">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={percentileRange[1]}
                        onChange={(e) => handlePercentileChange(1, e.target.value)}
                        className="range-input"
                        min="0"
                        max="100"
                      />
                    </div>

                    <div className="slider-container">
                      <div className="slider-track">
                        <div
                          className="slider-range"
                          style={{
                            left: `${percentileRange[0]}%`,
                            width: `${percentileRange[1] - percentileRange[0]}%`
                          }}
                        ></div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={percentileRange[0]}
                        onChange={(e) => handlePercentileChange(0, e.target.value)}
                        className="range-slider"
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={percentileRange[1]}
                        onChange={(e) => handlePercentileChange(1, e.target.value)}
                        className="range-slider"
                      />
                    </div>
                  </div>

                  <div className="filter-section">
                    <label>
                      <MapPin size={14} />
                      Location
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="city-select"
                    >
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-section">
                    <label>
                      <DollarSign size={14} />
                      Annual Fees (₹)
                    </label>
                    <div className="fee-inputs">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minFee}
                        onChange={(e) => setMinFee(e.target.value)}
                        className="fee-input"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxFee}
                        onChange={(e) => setMaxFee(e.target.value)}
                        className="fee-input"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="find-btn"
                    onClick={handleFindColleges}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={20} />
                        Searching...
                      </>
                    ) : (
                      'Find Best Colleges'
                    )}
                  </motion.button>

                  <button className="back-btn" onClick={() => window.history.back()}>
                    Return Home
                  </button>
                </div>

                {/* Right Content */}
                <div className="college-finder">
                  {!showResults ? (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="finder-card glass-card"
                    >
                      <div className="search-icon-wrapper">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ repeat: Infinity, duration: 4 }}
                        >
                          <Search size={40} color="#ff6b35" />
                        </motion.div>
                      </div>
                      <h2>College Predictor</h2>
                      <p className="subtitle">Set your requirements and find the best colleges that match your percentile and budget.</p>
                      {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg">
                          {error}
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="results-section">
                      <div className="results-header">
                        <div>
                          <h2>Recommendations</h2>
                          <p style={{ color: '#64748B' }}>{filteredColleges.length} colleges found</p>
                        </div>
                        <button className="back-to-search" onClick={() => setShowResults(false)}>
                          ← Adjust Search
                        </button>
                      </div>

                      <div className="colleges-grid">
                        {filteredColleges.length > 0 ? (
                          filteredColleges.map((college, index) => (
                            <motion.div
                              key={college.id || index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="college-card glass-card"
                            >
                              {index < 3 && (
                                <div className="college-rank">
                                  #{index + 1}
                                </div>
                              )}
                              <h3>{college.name}</h3>
                              <div className="college-details">
                                <div className="detail-item">
                                  <span className="detail-label">📍 Location</span>
                                  <span className="detail-value">{college.city}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">🎓 Branch</span>
                                  <span className="detail-value">{college.branch}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">📊 Cutoff</span>
                                  <span className="detail-value highlight">{college.cutoff}%</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">💰 Annual Fees</span>
                                  <span className="detail-value">₹{college.fees?.toLocaleString()}</span>
                                </div>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="view-details-btn"
                              >
                                Exploration Details <ChevronRight size={16} style={{ marginLeft: '4px' }} />
                              </motion.button>
                            </motion.div>
                          ))
                        ) : (
                          <div className="no-results glass-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
                            <p>No colleges match these filters. Try broadening your criteria.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Info Section */}
                  <div className="info-card glass-card">
                    <h3>How it works</h3>
                    <div className="info-item">
                      <div className="info-icon">🎯</div>
                      <div className="info-content">
                        <strong>Real Database</strong>
                        Our system searches through actual college data from Maharashtra to find the best matches for you.
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon">⚡</div>
                      <div className="info-content">
                        <strong>Smart Filtering</strong>
                        Adjust percentile, location, and fees to see colleges that match your exact criteria.
                      </div>
                    </div>
                    <div className="disclaimer">
                      <Info size={16} color="#EA580C" style={{ marginRight: '8px' }} />
                      <strong>Note:</strong> Data is based on last year's cutoffs and should be used as a reference.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Smart Compare Section */}
          {activeTab === 'compare' && (
            <motion.div
              key="compare"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="compare-section"
            >
              <div className="compare-header">
                <div className="compare-icon">
                  <TrendingUp size={32} color="#ff6b35" />
                </div>
                <h1>Smart Compare</h1>
                <p>Compare two colleges side-by-side with AI-driven insights and analysis.</p>
              </div>

              <div className="comparison-container">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="college-compare-card glass-card orange-border"
                >
                  <div className="college-header">
                    <div className="college-icon orange">
                      <Search size={24} />
                    </div>
                    <h3>College 1</h3>
                  </div>
                  <div className="college-body">
                    <label className="detail-label" style={{ marginBottom: '8px', display: 'block' }}>SELECT INSTITUTE</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="Search first college..."
                        className="college-search"
                        value={college1Search}
                        onChange={(e) => {
                          setCollege1Search(e.target.value);
                          searchColleges(e.target.value, setCollegeSuggestions1);
                        }}
                      />
                      {collegeSuggestions1.length > 0 && (
                        <div className="suggestions-dropdown">
                          {collegeSuggestions1.map((college, idx) => (
                            <div
                              key={idx}
                              className="suggestion-item"
                              onClick={() => {
                                setCollege1Search(college.name);
                                setCollegeSuggestions1([]);
                              }}
                            >
                              {college.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

                <div className="vs-divider">
                  <span>VS</span>
                </div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="college-compare-card glass-card blue-border"
                >
                  <div className="college-header">
                    <div className="college-icon blue">
                      <Search size={24} />
                    </div>
                    <h3>College 2</h3>
                  </div>
                  <div className="college-body">
                    <label className="detail-label" style={{ marginBottom: '8px', display: 'block' }}>SELECT INSTITUTE</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="Search second college..."
                        className="college-search"
                        value={college2Search}
                        onChange={(e) => {
                          setCollege2Search(e.target.value);
                          searchColleges(e.target.value, setCollegeSuggestions2);
                        }}
                      />
                      {collegeSuggestions2.length > 0 && (
                        <div className="suggestions-dropdown">
                          {collegeSuggestions2.map((college, idx) => (
                            <div
                              key={idx}
                              className="suggestion-item"
                              onClick={() => {
                                setCollege2Search(college.name);
                                setCollegeSuggestions2([]);
                              }}
                            >
                              {college.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Student Percentile Input */}
              <div className="glass-card" style={{ marginTop: '2rem' }}>
                <div className="filter-section">
                  <label>
                    <TrendingUp size={14} />
                    Your Percentile
                  </label>
                  <input
                    type="number"
                    placeholder="Enter your percentile (e.g., 85.5)"
                    value={studentPercentile}
                    onChange={(e) => setStudentPercentile(e.target.value)}
                    className="range-input"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg">
                    {error}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="find-btn"
                  onClick={handleCompareColleges}
                  disabled={comparing}
                >
                  {comparing ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Comparing...
                    </>
                  ) : (
                    'Compare Colleges'
                  )}
                </motion.button>
              </div>

              {/* Comparison Results */}
              {comparisonResult && (
                <div className="glass-card" style={{ marginTop: '2rem' }}>
                  <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Comparison Results</h3>

                  <div className="comparison-summary" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    <div className="summary-card" style={{ border: '2px solid rgba(249, 115, 22, 0.2)', padding: '1rem', borderRadius: '12px' }}>
                      <h4 style={{ color: '#F97316', marginBottom: '1rem' }}>{comparisonResult.college1.name}</h4>
                      <div className="detail-item">
                        <span className="detail-label">Branch</span>
                        <span className="detail-value">{comparisonResult.college1.branch}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Cutoff</span>
                        <span className="detail-value highlight">{comparisonResult.college1.cutoff}%</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Fees</span>
                        <span className="detail-value">₹{comparisonResult.college1.fees?.toLocaleString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Location</span>
                        <span className="detail-value">{comparisonResult.college1.city}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Your Chance</span>
                        <span className="detail-value" style={{
                          color: comparisonResult.chances.college1 === 'High' ? '#10B981' :
                            comparisonResult.chances.college1 === 'Moderate' ? '#F59E0B' : '#EF4444',
                          fontWeight: 'bold'
                        }}>
                          {comparisonResult.chances.college1}
                        </span>
                      </div>
                    </div>

                    <div className="summary-card" style={{ border: '2px solid rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '12px' }}>
                      <h4 style={{ color: '#3B82F6', marginBottom: '1rem' }}>{comparisonResult.college2.name}</h4>
                      <div className="detail-item">
                        <span className="detail-label">Branch</span>
                        <span className="detail-value">{comparisonResult.college2.branch}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Cutoff</span>
                        <span className="detail-value highlight">{comparisonResult.college2.cutoff}%</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Fees</span>
                        <span className="detail-value">₹{comparisonResult.college2.fees?.toLocaleString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Location</span>
                        <span className="detail-value">{comparisonResult.college2.city}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Your Chance</span>
                        <span className="detail-value" style={{
                          color: comparisonResult.chances.college2 === 'High' ? '#10B981' :
                            comparisonResult.chances.college2 === 'Moderate' ? '#F59E0B' : '#EF4444',
                          fontWeight: 'bold'
                        }}>
                          {comparisonResult.chances.college2}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ai-analysis" style={{ marginTop: '2rem' }}>
                    <h4 style={{ marginBottom: '1rem', color: '#0F172A' }}>AI Analysis</h4>
                    <div className="glass-card" style={{ background: '#FFF7ED', padding: '1.5rem', borderRadius: '12px' }}>
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#475569' }}>
                        {comparisonResult.comparison}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}