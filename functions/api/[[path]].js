import { jsonResponse } from '../_lib/http.js';

export function onRequest() {
  return jsonResponse({ error: 'API endpoint not found.' }, 404);
}
