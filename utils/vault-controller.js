export async function getVaultToken(roleId, secretId) {
  const url = 'http://127.0.0.1:8200/v1/auth/approle/login';
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role_id: roleId,
      secret_id: secretId,
    }),
  });
  const data = await response.json();
  return data.auth.client_token;
}

export async function getSecret(token, secretPath) {
  const url = `http://127.0.0.1:8200/v1/${secretPath}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'X-Vault-Token': token },
  });
  const data = await response.json();
  return data.data.data;
}
