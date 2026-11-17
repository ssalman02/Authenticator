function getChromeStorage() {
  if (!globalThis.chrome?.storage?.local) {
    throw new Error("Chrome storage unavailable. Load this using chrome://extensions.");
  }
  return globalThis.chrome.storage.local;
}
export async function getAccounts() {
  const result = await getChromeStorage().get("accounts");
  return Array.isArray(result.accounts) ? result.accounts : [];
}
export async function saveAccounts(accounts) {
  await getChromeStorage().set({ accounts });
}
export async function saveAccount(account) {
  const accounts = await getAccounts();
  const updated = [...accounts, { ...account, id: account.id || crypto.randomUUID() }];
  await saveAccounts(updated);
  return updated;
}
export async function deleteAccount(id) {
  const accounts = await getAccounts();
  const updated = accounts.filter(account => account.id !== id);
  await saveAccounts(updated);
  return updated;
}
export async function getTheme() {
  const result = await getChromeStorage().get("auth-theme");
  return result["auth-theme"] || "dark";
}
export async function saveTheme(theme) {
  await getChromeStorage().set({ "auth-theme": theme });
}