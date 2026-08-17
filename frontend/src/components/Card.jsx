import '../styles/card.css';

export function Card({ children, className = '' }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function CardHeader({ children }) {
  return <div className="card-header">{children}</div>;
}

export function CardBody({ children }) {
  return <div className="card-body">{children}</div>;
}

export function CardFooter({ children }) {
  return <div className="card-footer">{children}</div>;
}
