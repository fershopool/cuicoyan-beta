import { apiRequest } from './auth.service.js';

// Helpers puros de WebAuthn (base64url sin relleno). Sin dependencias ni acceso a window/DOM al cargar.
export function b64uToBuffer(str) {
  const base64 = String(str).replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(String(str).length / 4) * 4, '=');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export function bufferToB64u(bufferLike) {
  const bytes = bufferLike instanceof ArrayBuffer ? new Uint8Array(bufferLike) : new Uint8Array(bufferLike.buffer, bufferLike.byteOffset, bufferLike.byteLength);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// El servidor puede devolver el objeto de opciones directo o envuelto en `publicKey`.
const publicKeyOf = (data) => data?.publicKey ?? data;

export function creationOptionsFromServer(data) {
  const options = publicKeyOf(data);
  return {
    ...options,
    challenge: b64uToBuffer(options.challenge),
    user: { ...options.user, id: b64uToBuffer(options.user.id) },
    excludeCredentials: (options.excludeCredentials || []).map((cred) => ({ ...cred, id: b64uToBuffer(cred.id) })),
  };
}

export function requestOptionsFromServer(data) {
  const options = publicKeyOf(data);
  return {
    ...options,
    challenge: b64uToBuffer(options.challenge),
    allowCredentials: (options.allowCredentials || []).map((cred) => ({ ...cred, id: b64uToBuffer(cred.id) })),
  };
}

export function registrationToServer(credential) {
  return {
    attestationObject: bufferToB64u(credential.response.attestationObject),
    clientDataJSON: bufferToB64u(credential.response.clientDataJSON),
  };
}

export function assertionToServer(credential) {
  return {
    credentialId: bufferToB64u(credential.rawId),
    authenticatorData: bufferToB64u(credential.response.authenticatorData),
    clientDataJSON: bufferToB64u(credential.response.clientDataJSON),
    signature: bufferToB64u(credential.response.signature),
  };
}

const ADMIN = '/api/cuicoyan/admin';
const jsonPost = (body) => ({ method: 'POST', body: JSON.stringify(body) });

export async function adminStatus() {
  return (await apiRequest(`${ADMIN}/status`)).data;
}

export async function registerPasskey(label) {
  const options = await apiRequest(`${ADMIN}/passkey/register/options`, jsonPost({}));
  const credential = await navigator.credentials.create({ publicKey: creationOptionsFromServer(options.data) });
  if (!credential) throw new Error('passkey_cancelled');
  const body = { response: registrationToServer(credential) };
  if (label) body.label = label;
  return (await apiRequest(`${ADMIN}/passkey/register/verify`, jsonPost(body))).data;
}

export async function stepUp() {
  const options = await apiRequest(`${ADMIN}/passkey/assert/options`, jsonPost({}));
  const credential = await navigator.credentials.get({ publicKey: requestOptionsFromServer(options.data) });
  if (!credential) throw new Error('passkey_cancelled');
  return (await apiRequest(`${ADMIN}/passkey/assert/verify`, jsonPost({ response: assertionToServer(credential) }))).data;
}

export async function listContactRequests({ status, limit, offset } = {}) {
  const query = new URLSearchParams();
  if (status) query.set('status', status);
  if (limit != null) query.set('limit', String(limit));
  if (offset != null) query.set('offset', String(offset));
  const qs = query.toString();
  return (await apiRequest(`${ADMIN}/contact-requests${qs ? `?${qs}` : ''}`)).data;
}

export async function setContactStatus(id, status) {
  return (await apiRequest(`${ADMIN}/contact-requests/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ status }) })).data;
}

export async function createInvitation({ kind, profile_id, role, email, ttl_seconds } = {}) {
  const body = { kind, role, email };
  if (profile_id !== undefined) body.profile_id = profile_id;
  if (ttl_seconds !== undefined) body.ttl_seconds = ttl_seconds;
  return (await apiRequest('/api/cuicoyan/invitations', jsonPost(body))).data;
}
