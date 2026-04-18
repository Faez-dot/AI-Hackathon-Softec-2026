import { useState } from 'react';
import './App.css';

function App() {
  const [profile, setProfile] = useState({
    degree: '',
    semester: '',
    cgpa: '',
    skills: '',
    opportunityTypes: '',
    location: '',
    financialNeed: '',
    experience: ''
  });

  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const addEmail = () => {
    if (emailInput.trim()) {
      setEmails([...emails, emailInput.trim()]);
      setEmailInput('');
    }
  };

  const removeEmail = (index) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const analyzeOpportunities = async () => {
    if (emails.length === 0) {
      setError("Please add at least one email.");
      return;
    }
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch('http://localhost:5000/api/analyze-opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails, profile }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze opportunities');
      }

      setResults(data.result);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="hero-section">
        <h1>AI Opportunity Intelligence</h1>
        <p>Rank and analyze student opportunities instantly.</p>
      </header>

      <div className="main-grid">
        <section className="glass-panel profile-section">
          <h2>Student Profile</h2>
          <div className="form-grid">
            <input name="degree" placeholder="Degree / Program (e.g. BS CS)" value={profile.degree} onChange={handleProfileChange} />
            <input name="semester" placeholder="Semester (e.g. 6th)" value={profile.semester} onChange={handleProfileChange} />
            <input name="cgpa" placeholder="CGPA" value={profile.cgpa} onChange={handleProfileChange} />
            <input name="location" placeholder="Location Preference" value={profile.location} onChange={handleProfileChange} />
            <input name="financialNeed" placeholder="Financial Need" value={profile.financialNeed} onChange={handleProfileChange} />
            <input name="opportunityTypes" placeholder="Preferred Types (Internships, etc)" value={profile.opportunityTypes} onChange={handleProfileChange} />
            <textarea className="span-2" name="skills" placeholder="Skills / Interests" value={profile.skills} onChange={handleProfileChange} rows={2} />
            <textarea className="span-2" name="experience" placeholder="Past Experience" value={profile.experience} onChange={handleProfileChange} rows={2} />
          </div>
        </section>

        <section className="glass-panel emails-section">
          <h2>Opportunity Emails</h2>
          <div className="email-input-group">
            <textarea 
              placeholder="Paste email content here..." 
              value={emailInput} 
              onChange={(e) => setEmailInput(e.target.value)}
              rows={4}
            />
            <button onClick={addEmail} className="btn-secondary">Add Email</button>
          </div>
          
          <div className="email-list">
            {emails.map((email, idx) => (
              <div key={idx} className="email-item">
                <p>{email.substring(0, 80)}...</p>
                <button onClick={() => removeEmail(idx)} className="btn-icon">×</button>
              </div>
            ))}
          </div>

          <button 
            className="btn-primary analyze-btn" 
            onClick={analyzeOpportunities}
            disabled={loading || emails.length === 0}
          >
            {loading ? <span className="spinner"></span> : 'Analyze Opportunities'}
          </button>
          {error && <div className="error-alert">{error}</div>}
        </section>
      </div>

      {Array.isArray(results) && results.length > 0 && (
        <section className="results-section">
          <h2>Opportunity Rankings</h2>
          <div className="cards-grid">
            {results.map((opp, idx) => (
              <div key={idx} className="result-card glass-panel">
                <div className="card-header">
                  <div className="rank-badge">#{opp.rank || idx + 1}</div>
                  <h3>{opp.title || 'Unknown Opportunity'}</h3>
                  <div className={`urgency-badge ${(opp.urgencyLevel || '').toLowerCase()}`}>{opp.urgencyLevel || 'Unknown'}</div>
                </div>
                
                <div className="score-breakdown">
                  <div className="total-score">
                    <span className="score-val">{opp.score?.total || (typeof opp.score === 'number' ? opp.score : 0)}</span>
                    <span className="score-lbl">Total Score</span>
                  </div>
                  <div className="sub-scores">
                    <span>Fit: {opp.score?.fit || 0}/40</span>
                    <span>Urgency: {opp.score?.urgency || 0}/25</span>
                    <span>Benefit: {opp.score?.benefit || 0}/20</span>
                    <span>Effort: {opp.score?.effort || 0}/15</span>
                  </div>
                </div>

                <div className="card-body">
                  <h4>Why it's relevant</h4>
                  <p>{opp.reason || 'No reason provided.'}</p>
                  
                  <h4>Action Checklist</h4>
                  <ul className="checklist">
                    {Array.isArray(opp.actionChecklist) ? opp.actionChecklist.map((step, i) => (
                      <li key={i}>{step}</li>
                    )) : <li>No actions needed.</li>}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
