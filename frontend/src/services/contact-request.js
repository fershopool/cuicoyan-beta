import { environment } from '../config/environment.js';

const MAX_MESSAGE = 5000;

// Convierte el registro de /unete al contrato de POST /api/cuicoyan/contact-requests.
// `fields` son los pares campo -> texto ya normalizados; el resto va en `message` (tope de la API).
export function buildContactRequest({ roleKey, name, email, organization, fields, turnstileToken }) {
  const message = Object.entries(fields).map(([key, value]) => `${key}: ${value}`).join('\n').slice(0, MAX_MESSAGE);
  return {
    requester_name: name, email, organization_name: organization, message,
    requested_profile_type: roleKey === 'foro' ? 'cultural_forum' : 'artist',
    turnstile_token: turnstileToken,
  };
}

// Mismo origen (ruta relativa salvo que se configure VITE_CUICOYAN_API_URL); la API exige X-Requested-With en todo POST.
export async function sendContactRequest(body) {
  const response = await fetch(`${environment.cuicoyanApiUrl}/api/cuicoyan/contact-requests`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': environment.csrfHeaderValue }, body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error('rechazado');
}
