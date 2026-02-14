import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-red-800 font-medium">Error</p>
        <p className="text-red-600 text-sm mt-1">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 text-sm text-red-700 hover:text-red-800 font-medium underline"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
