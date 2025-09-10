'use client';

import { useState } from 'react';

export default function ReplyDraftButton({ emailContent }: { emailContent: string }) {
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch('/api/reply-draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ emailContent }) });
      const data = await res.json();
      setReply(data.reply);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button onClick={generate} disabled={loading} className="px-3 py-2 rounded border text-sm hover:bg-gray-50 disabled:opacity-60">
        {loading ? 'Generating…' : 'Generate reply draft'}
      </button>
      {reply && (
        <textarea className="border rounded p-2 text-sm" rows={6} defaultValue={reply} />
      )}
    </div>
  );
}


