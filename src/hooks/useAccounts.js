
import { useCallback, useEffect, useState } from "react";
import {
  getAccounts,
  saveAccount,
  deleteAccount
} from "../services/storage.service";

export default function useAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const data = await getAccounts();

      if (!Array.isArray(data)) {
        throw new Error("Invalid account data returned from storage.");
      }

      setAccounts(data);
      setError("");
    } catch (err) {
      setAccounts([]);
      setError(
        typeof err?.message === "string"
          ? err.message
          : "Unable to load accounts."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addAccount = async (account) => {
    const current = await getAccounts();

    if (!Array.isArray(current)) {
      throw new Error("Invalid account storage.");
    }

    const duplicate = current.some(
      (item) =>
        item.secret === account.secret &&
        item.issuer === account.issuer &&
        item.accountName === account.accountName
    );

    if (duplicate) {
      throw new Error("This account is already added.");
    }

    const updated = await saveAccount(account);

    if (!Array.isArray(updated)) {
      throw new Error("Unable to save account.");
    }

    setAccounts(updated);
  };

  const removeAccount = async (id) => {
    const updated = await deleteAccount(id);

    if (!Array.isArray(updated)) {
      throw new Error("Unable to delete account.");
    }

    setAccounts(updated);
  };

  return {
    accounts,
    loading,
    error,
    addAccount,
    removeAccount
  };
}
