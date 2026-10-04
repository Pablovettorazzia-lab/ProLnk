import { login, signup, logout, oauthLogin, getUser, getSettings, handleAuthCallback, onAuthChange, AUTH_EVENTS, AuthError, MissingIdentityError } from '@netlify/identity';

export { logout as logoutUser };

export function authErrorMessage(error: unknown) {
  if (error instanceof MissingIdentityError) return 'El servicio de acceso no está disponible en este entorno.';
  if (error instanceof AuthError) {
    if (error.status === 400 || error.status === 401) return 'Correo o contraseña incorrectos, o correo pendiente de confirmar.';
    if (error.status === 422) return 'Revisa los datos. Es posible que este correo ya tenga una cuenta.';
    if (error.status === 429) return 'Demasiados intentos. Espera un momento antes de volver a intentarlo.';
  }
  return error instanceof Error ? error.message : 'No se pudo completar el acceso.';
}

export async function signInWithGoogle() {
  const settings = await getSettings();
  if (!settings.providers.google) throw new Error('El acceso con Google aún no está habilitado. Usa tu correo y contraseña.');
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
