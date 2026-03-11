/**
 * PrintTicketModal
 * Modal to collect table/seat and trigger allergy ticket print.
 */

import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrintTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: (tableNumber: string, seatNumber: string) => Promise<void>;
}

export function PrintTicketModal({ isOpen, onClose, onPrint }: PrintTicketModalProps) {
  const [tableNumber, setTableNumber] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePrint = async () => {
    const table = tableNumber.trim();
    const seat = seatNumber.trim();
    if (!table || !seat) {
      setError('Table and seat are required.');
      return;
    }
    if (!/^\d+$/.test(table) || !/^\d+$/.test(seat)) {
      setError('Table and seat must be numbers.');
      return;
    }
    setError(null);
    setIsPrinting(true);
    try {
      await onPrint(table, seat);
      onClose();
      setTableNumber('');
      setSeatNumber('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Print failed.');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleClose = () => {
    if (!isPrinting) {
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-slate-800 border border-slate-700 shadow-xl shadow-black/30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Print Allergy Ticket</h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isPrinting}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
              Table Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g. 12"
              disabled={isPrinting}
              className={cn(
                'w-full rounded-lg border bg-slate-700/50 px-3 py-2 text-sm text-white placeholder-slate-500',
                'focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500',
                'disabled:opacity-50 border-slate-600'
              )}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
              Seat Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={seatNumber}
              onChange={(e) => setSeatNumber(e.target.value)}
              placeholder="e.g. 3"
              disabled={isPrinting}
              className={cn(
                'w-full rounded-lg border bg-slate-700/50 px-3 py-2 text-sm text-white placeholder-slate-500',
                'focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500',
                'disabled:opacity-50 border-slate-600'
              )}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPrinting}
              className="flex-1 rounded-lg border border-slate-600 bg-slate-700 py-3 text-sm font-medium text-white hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex-1 rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPrinting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Printing...
                </>
              ) : (
                'Print'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
