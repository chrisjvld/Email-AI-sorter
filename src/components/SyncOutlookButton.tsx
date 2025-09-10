'use client';

import { useState } from 'react';

export default function SyncOutlookButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSync() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/microsoft/sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMessage(`Imported ${data.imported} messages`);
    } catch (e: any) {
      setMessage(e.message || 'Failed to sync');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleSync}
        disabled={loading}
        className="px-3 py-2 rounded border text-sm hover:bg-gray-50 disabled:opacity-60"
      >
        {loading ? 'Syncing…' : 'Sync Outlook'}
      </button>
      {message && <span className="text-sm text-gray-600">{message}</span>}
    </div>
  );
}


