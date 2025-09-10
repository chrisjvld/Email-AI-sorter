'use client';

export default function ConnectOutlookButton() {
  function connect() {
    window.location.href = '/api/microsoft/oauth/initiate';
  }
  return (
    <button onClick={connect} className="px-3 py-2 rounded border text-sm hover:bg-gray-50">
      Connect Outlook
    </button>
  );
}


