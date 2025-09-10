const AUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

export function getMicrosoftAuthUrl(state: string) {
  const clientId = process.env.MS_CLIENT_ID!;
  const redirectUri = encodeURIComponent(process.env.MS_REDIRECT_URI!);
  const scopes = encodeURIComponent('offline_access Mail.Read User.Read');
  return `${AUTH_URL}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=${scopes}&state=${state}`;
}

export async function exchangeMicrosoftCode(code: string) {
  const clientId = process.env.MS_CLIENT_ID!;
  const clientSecret = process.env.MS_CLIENT_SECRET!;
  const redirectUri = process.env.MS_REDIRECT_URI!;

  const params = new URLSearchParams();
  params.set('client_id', clientId);
  params.set('client_secret', clientSecret);
  params.set('code', code);
  params.set('redirect_uri', redirectUri);
  params.set('grant_type', 'authorization_code');

  const res = await fetch(TOKEN_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params });
  if (!res.ok) throw new Error('token_exchange_failed');
  return res.json() as Promise<{ access_token: string; refresh_token?: string; expires_in: number; scope?: string }>;
}


