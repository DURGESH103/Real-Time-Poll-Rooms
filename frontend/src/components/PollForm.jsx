import { useState } from 'react';
import { Plus, X } from 'lucide-react';

const PollForm = ({ onSubmit, loading }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
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
    onSubmit({
      question: question.trim(),
      options: filledOptions
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Question Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Poll Question
        </label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What's your question?"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          maxLength={200}
        />
        <div className="flex justify-between mt-1">
          {errors.question && (
            <p className="text-sm text-red-600">{errors.question}</p>
          )}
          <p className="text-xs text-gray-500 ml-auto">{question.length}/200</p>
        </div>
      </div>

      {/* Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Options
        </label>
        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={100}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.options && (
          <p className="text-sm text-red-600 mt-2">{errors.options}</p>
        )}
        
        {options.length < 10 && (
          <button
            type="button"
            onClick={addOption}
            className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Option
          </button>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
      >
        {loading ? 'Creating Poll...' : 'Create Poll'}
      </button>
    </form>
  );
};

export default PollForm;
