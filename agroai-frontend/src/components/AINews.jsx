import { useEffect, useState } from 'react';

const AI_QUERY = encodeURIComponent('("artificial intelligence" OR AI OR "machine learning")');

export default function AINews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const url = `https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=25&query=${AI_QUERY}`;
    (async () => {
      try {
        const r = await fetch(url);
        const data = await r.json();
        setItems(data.hits || []);
      } catch (e) {
        setErr('Failed to load news.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Loading AI news…</p>;
  if (err) return <p style={{ color: 'tomato' }}>{err}</p>;
  if (!items.length) return <p>No recent AI items.</p>;

  const relTime = (iso) => {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  return (
    <div className="ai-news">
      <h3 style={{ marginBottom: 12 }}>Latest AI News (Hacker News)</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
        {items.map((h) => {
          const link = h.url || `https://news.ycombinator.com/item?id=${h.objectID}`;
          return (
            <li key={h.objectID} style={{ padding: 12, borderRadius: 12, background: '#0f3133', border: '1px solid rgba(255,255,255,0.08)' }}>
              <a href={link} target="_blank" rel="noreferrer" style={{ color: '#8CC940', fontWeight: 600 }}>
                {h.title || '(no title)'}
              </a>
              <div style={{ opacity: 0.8, fontSize: 13, marginTop: 4 }}>
                {h.points ?? 0} points · {h.author} · {relTime(h.created_at)}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
