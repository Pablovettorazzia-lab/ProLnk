import { login, signup, logout, oauthLogin, getUser, getSettings, handleAuthCallback, onAuthChange, AUTH_EVENTS, AuthError, MissingIdentityError } from '@netlify/identity';

export { logout as logoutUser };

export function authErrorMessage(error: unknown) {
  if (error instanceof MissingIdentityError) return 'The login service is unavailable in this environment.';
  if (error instanceof AuthError) {
    if (error.status === 400 || error.status === 401) return 'Incorrect email or password, or your email address has not been confirmed.';
    if (error.status === 422) return 'Please check your details. This email address may already have an account.';
    if (error.status === 429) return 'Too many attempts. Please wait a moment before trying again.';
  }
  return error instanceof Error ? error.message : 'You could not be logged in.';
}

export async function signInWithGoogle() {
  const settings = await getSettings();
  if (!settings.providers.google) throw new Error('Google login is not enabled yet. Please use your email and password.');
  return oauthLogin('google');
}
export const loginUserWithEmail = (email: string, password: string) => login(email.trim(), password);
export const registerUserWithEmail = (name: string, email: string, password: string) => signup(email.trim(), password, { full_name: name.trim() });

export async function restoreSession() {
  await handleAuthCallback();
  return getUser();
}

export function onAuthStatusChange(callback: () => void) {
  return onAuthChange(event => {
    if (event === AUTH_EVENTS.LOGOUT) callback();
  });
}
