import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" style={{ marginLeft: "40rem", marginTop: "1rem"}}>
      {items.map((item, idx) => (
        <span key={idx} className="breadcrumb-item">
          {item.to ? (
            <Link to={item.to} className="breadcrumb-link">
              {item.label}
            </Link>
          ) : (
            <span className="breadcrumb-text">{item.label}</span>
          )}
          {idx < items.length - 1 && (
            <span className="breadcrumb-sep">&gt;</span>
          )}
        </span>
      ))}
    </nav>
  );
}
