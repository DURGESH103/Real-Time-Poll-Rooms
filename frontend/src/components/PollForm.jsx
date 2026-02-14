import { useState } from 'react';
import { Plus, X, Clock } from 'lucide-react';

const PollForm = ({ onSubmit, loading }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [expiryOption, setExpiryOption] = useState('1d');
  const [errors, setErrors] = useState({});

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const validate = () => {
    const newErrors = {};

    if (question.trim().length < 10) {
      newErrors.question = 'Question must be at least 10 characters';
    }

    const filledOptions = options.filter(opt => opt.trim());
    if (filledOptions.length < 2) {
      newErrors.options = 'At least 2 options are required';
    }

    options.forEach((opt, i) => {
      if (opt.trim() && opt.trim().length > 100) {
        newErrors[`option${i}`] = 'Option too long (max 100 characters)';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    const filledOptions = options.filter(opt => opt.trim());
    
    const now = new Date();
    let expiryTime = new Date();
    
    if (expiryOption === '1h') expiryTime.setHours(now.getHours() + 1);
    if (expiryOption === '6h') expiryTime.setHours(now.getHours() + 6);
    if (expiryOption === '12h') expiryTime.setHours(now.getHours() + 12);
    if (expiryOption === '1d') expiryTime.setDate(now.getDate() + 1);
    if (expiryOption === '3d') expiryTime.setDate(now.getDate() + 3);
    if (expiryOption === '7d') expiryTime.setDate(now.getDate() + 7);
    
    onSubmit({
      question: question.trim(),
      options: filledOptions,
      pollExpiryTime: expiryTime
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Question Input */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Poll Question
        </label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What's your question?"
          className="w-full px-5 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
          maxLength={200}
        />
        <div className="flex justify-between mt-2">
          {errors.question && (
            <p className="text-sm font-medium text-rose-600">{errors.question}</p>
          )}
          <p className="text-xs font-medium text-slate-400 ml-auto">{question.length}/200</p>
        </div>
      </div>

      {/* Options */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Options
        </label>
        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={index} className="flex gap-3">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 px-5 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                maxLength={100}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="p-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  aria-label="Remove option"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.options && (
          <p className="text-sm font-medium text-rose-600 mt-2">{errors.options}</p>
        )}
        
        {options.length < 10 && (
          <button
            type="button"
            onClick={addOption}
            className="mt-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Option
          </button>
        )}
      </div>

      {/* Poll Duration */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Poll Duration</span>
          </div>
        </label>
        <select
          value={expiryOption}
          onChange={(e) => setExpiryOption(e.target.value)}
          className="w-full px-5 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all font-medium text-slate-900 cursor-pointer"
        >
          <option value="1h">1 Hour</option>
          <option value="6h">6 Hours</option>
          <option value="12h">12 Hours</option>
          <option value="1d">1 Day</option>
          <option value="3d">3 Days</option>
          <option value="7d">7 Days</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 disabled:shadow-none transition-all hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Creating Poll...
          </span>
        ) : (
          'Create Poll'
        )}
      </button>
    </form>
  );
};

export default PollForm;
