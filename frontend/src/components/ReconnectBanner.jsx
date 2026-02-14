import { WifiOff, Loader2 } from 'lucide-react';

export default function ReconnectBanner({ show }) {
  if (!show) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl shadow-lg px-6 py-3 flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
        <div>
          <div className="font-semibold text-amber-900 text-sm">Reconnecting...</div>
          <div className="text-xs text-amber-700">Restoring live updates</div>
        </div>
      </div>
    </div>
  );
}
