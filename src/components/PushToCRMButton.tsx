'use client';

import { useState } from 'react';

export default function PushToCRMButton({ leadId }: { leadId: number }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function push() {
    setLoading(true);
    try {
      const res = await fetch('/api/crm/push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId }) });
      if (res.ok) setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={push} disabled={loading || done} className="px-3 py-2 rounded border text-sm hover:bg-gray-50 disabled:opacity-60">
      {done ? 'Pushed' : loading ? 'Pushing…' : 'Push to Airtable'}
    </button>
  );
}


