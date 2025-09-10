'use client';

export default function ConnectGmailButton() {
  function connect() {
    window.location.href = '/api/google/oauth/initiate';
  }
  return (
    <button onClick={connect} className="px-3 py-2 rounded border text-sm hover:bg-gray-50">
      Connect Gmail
    </button>
  );
}


