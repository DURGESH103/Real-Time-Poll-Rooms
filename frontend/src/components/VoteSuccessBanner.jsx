import { CheckCircle } from 'lucide-react';

const VoteSuccessBanner = ({ optionText }) => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-xl p-4 mb-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-green-900">Vote Recorded!</h3>
          <p className="text-sm text-green-700">
            You voted for: <span className="font-semibold">{optionText}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoteSuccessBanner;
