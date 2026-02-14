export default function GlassCard({ children, className = '', hover = true }) {
  return (
    <div className={`
      bg-white/80 backdrop-blur-sm border border-gray-200/50 
      rounded-3xl shadow-lg shadow-gray-200/50
      ${hover ? 'hover:shadow-xl hover:shadow-gray-300/50 hover:-translate-y-1 transition-all duration-300' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}
