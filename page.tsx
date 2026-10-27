"use client";

import { useEffect, useMemo, useState } from "react";

type Analysis = {
  id: string;
  home: string;
  away: string;
  homeOdds: number;
  drawOdds: number;
  awayOdds: number;
  probabilities: { home: number; draw: number; away: number };
  overround: number;
  createdAt: string;
  note: string;
};

const HISTORY_KEY = "goalrush-analysis-history-v1";

function percent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export default function HomePage() {
  const [home, setHome] = useState("Blue Stars");
  const [away, setAway] = useState("Red United");
  const [homeOdds, setHomeOdds] = useState("2.10");
  const [drawOdds, setDrawOdds] = useState("3.20");
  const [awayOdds, setAwayOdds] = useState("2.80");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<Analysis[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) setHistory(JSON.parse(saved) as Analysis[]);
    } catch {
      setHistory([]);
    }
  }, []);

  const strongest = useMemo(() => {
    if (!analysis) return null;
    const options = [
      { name: home || "Home team", probability: analysis.probabilities.home },
      { name: "Draw", probability: analysis.probabilities.draw },
      { name: away || "Away team", probability: analysis.probabilities.away },
    ];
    return options.sort((a, b) => b.probability - a.probability)[0];
  }, [analysis, home, away]);

  async function runAnalysis(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setAnalysis(null);
    setLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          home: home.trim(),
          away: away.trim(),
          homeOdds: Number(homeOdds),
          drawOdds: Number(drawOdds),
          awayOdds: Number(awayOdds),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not analyse these odds.");
      const record: Analysis = {
        ...result,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setAnalysis(record);
      const next = [record, ...history].slice(0, 20);
      setHistory(next);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function clearHistory() {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">GR</div>
          <div><strong>GoalRush <span>AI</span></strong><small>VIRTUAL FOOTBALL LAB</small></div>
        </div>
        <nav className="nav-links" aria-label="Main navigation">
          <a className="nav-link active" href="#dashboard"><span>▦</span> Dashboard</a>
          <a className="nav-link" href="#analyser"><span>◉</span> Match analyser</a>
          <a className="nav-link" href="#history"><span>◷</span> Prediction history</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="status-dot" /> Analysis tools ready
          <p>Version 0.1 · Demo mode</p>
        </div>
      </aside>

      <section className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">VIRTUAL FOOTBALL INTELLIGENCE</p>
            <h1>Match centre</h1>
          </div>
          <div className="profile-chip"><div className="avatar">⚽</div><div><b>Guest analyst</b><small>Local demo</small></div></div>
        </header>

        <section className="hero-panel">
          <div className="hero-copy">
            <div className="live-label"><span className="pulse" /> YOUR ANALYSIS WORKSPACE</div>
            <h2>Read the odds.<br /><span>Know the limits.</span></h2>
            <p>Review virtual football prices, compare implied probabilities and track your analysis in one place.</p>
            <a href="#analyser" className="primary-link">Analyse a match <span>↗</span></a>
          </div>
          <div className="pitch-art" aria-hidden="true">
            <div className="pitch"><div className="half-line" /><div className="centre-circle" /><div className="box left-box" /><div className="box right-box" /><div className="ball">⚽</div></div>
            <div className="floating-stat"><small>MODE</small><b>VIRTUAL</b><span>Odds review</span></div>
          </div>
        </section>

        <div className="section-heading">
          <div><p className="eyebrow">TOOLS</p><h2>Analysis overview</h2></div>
          <span className="demo-badge">● DEMO MODE</span>
        </div>
        <div className="stat-grid">
          <article className="stat-card"><div className="stat-icon blue">⌁</div><span>Analyses saved</span><strong>{history.length}</strong><small>Stored on this device</small></article>
          <article className="stat-card"><div className="stat-icon green">％</div><span>Market probabilities</span><strong>1X2</strong><small>Calculated from your odds</small></article>
          <article className="stat-card"><div className="stat-icon purple">◷</div><span>Data connection</span><strong>Manual</strong><small>No live Football.com feed</small></article>
        </div>

        <section className="workspace-grid" id="analyser">
          <article className="panel analyser-panel">
            <div className="panel-heading"><div><p className="eyebrow">1X2 MARKET</p><h2>Match analyser</h2></div><span className="panel-icon">✳</span></div>
            <p className="panel-description">Enter the teams and decimal odds shown on your screen. We calculate market-implied probabilities, not guaranteed outcomes.</p>
            <form onSubmit={runAnalysis}>
              <div className="team-fields">
                <label>Home team<input value={home} onChange={e => setHome(e.target.value)} maxLength={60} required placeholder="e.g. Blue Stars" /></label>
                <label>Away team<input value={away} onChange={e => setAway(e.target.value)} maxLength={60} required placeholder="e.g. Red United" /></label>
              </div>
              <div className="odds-label-row"><span>Decimal odds</span><small>Use the exact displayed prices</small></div>
              <div className="odds-fields">
                <label><span className="odds-team">1 · HOME</span><input inputMode="decimal" type="number" min="1.01" max="1000" step="0.01" value={homeOdds} onChange={e => setHomeOdds(e.target.value)} required /></label>
                <label><span className="odds-team">X · DRAW</span><input inputMode="decimal" type="number" min="1.01" max="1000" step="0.01" value={drawOdds} onChange={e => setDrawOdds(e.target.value)} required /></label>
                <label><span className="odds-team">2 · AWAY</span><input inputMode="decimal" type="number" min="1.01" max="1000" step="0.01" value={awayOdds} onChange={e => setAwayOdds(e.target.value)} required /></label>
              </div>
              {error && <p className="error-message" role="alert">{error}</p>}
              <button className="analyse-button" type="submit" disabled={loading}>{loading ? "Analysing…" : "✦  Analyse odds"} <span>→</span></button>
            </form>
            <div className="privacy-note"><span>ⓘ</span> Demo only. This does not connect to or place bets on Football.com.</div>
          </article>

          <article className="panel result-panel">
            <div className="panel-heading"><div><p className="eyebrow">YOUR RESULT</p><h2>Analysis report</h2></div><span className="report-pill">REPORT</span></div>
            {!analysis ? (
              <div className="empty-result">
                <div className="empty-graphic"><span>1</span><span>X</span><span>2</span></div>
                <h3>Your report will appear here</h3>
                <p>Submit a match with its 1X2 odds to view the calculated probabilities and market margin.</p>
              </div>
            ) : (
              <div className="result-content">
                <div className="match-summary"><span className="team-badge">{analysis.home.slice(0, 2).toUpperCase()}</span><div><b>{analysis.home} <span className="vs">vs</span> {analysis.away}</b><small>Odds submitted manually</small></div><span className="team-badge away-badge">{analysis.away.slice(0, 2).toUpperCase()}</span></div>
                <div className="probability-list">
                  {[
                    { label: analysis.home, key: "home" as const },
                    { label: "Draw", key: "draw" as const },
                    { label: analysis.away, key: "away" as const },
                  ].map(item => (
                    <div className="prob-row" key={item.key}><div className="prob-label"><span>{item.label}</span><b>{percent(analysis.probabilities[item.key])}</b></div><div className="progress-track"><div className="progress-fill" style={{ width: percent(analysis.probabilities[item.key]) }} /></div></div>
                  ))}
                </div>
                <div className="top-option"><div><small>HIGHEST IMPLIED PROBABILITY</small><b>{strongest?.name}</b></div><strong>{strongest ? percent(strongest.probability) : "—"}</strong></div>
                <div className="margin-row"><span>Market overround (margin indicator)</span><b>{analysis.overround.toFixed(1)}%</b></div>
                <p className="result-caveat">{analysis.note}</p>
              </div>
            )}
          </article>
        </section>

        <section className="panel history-panel" id="history">
          <div className="panel-heading"><div><p className="eyebrow">RECENT ACTIVITY</p><h2>Prediction history</h2></div>{history.length > 0 && <button className="text-button" onClick={clearHistory} type="button">Clear history</button>}</div>
          {history.length === 0 ? <div className="history-empty">No analyses saved yet. Run your first analysis above.</div> : (
            <div className="history-list">
              {history.map(item => <div className="history-item" key={item.id}><div className="history-ball">⚽</div><div className="history-match"><b>{item.home} vs {item.away}</b><small>{new Date(item.createdAt).toLocaleString()}</small></div><div className="history-prob"><small>Top implied option</small><b>{[
                { name: item.home, probability: item.probabilities.home },
                { name: "Draw", probability: item.probabilities.draw },
                { name: item.away, probability: item.probabilities.away },
              ].sort((a, b) => b.probability - a.probability)[0].name}</b></div><span className="history-tag">Odds review</span></div>)}
            </div>
          )}
        </section>
        <footer><span>GOALRUSH AI</span> · Built for analysis and learning · Virtual outcomes can be random.</footer>
      </section>
    </main>
  );
}
