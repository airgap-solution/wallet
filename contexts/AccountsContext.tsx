import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sanitizeAccount } from "@/utils/typeUtils";

export type WalletInfo = {
  DerivationPath: string;
  ChainCode: string | Uint8Array;
  Name: string;
  Internal1: boolean | string;
  Internal2: boolean | string;
  SomeBytes: string | Uint8Array;
  XPub: string;
};

export type Account = {
  ID: number;
  Index: number;
  Type: string;
  Block: number;
  Wallet: WalletInfo;
};

type AccountsContextType = {
  accounts: Account[];
  addOrUpdateAccount: (account: Account) => Promise<void>;
  deleteAccount: (xpub: string) => Promise<void>;
  clearAccounts: () => Promise<void>;
  reloadAccounts: () => Promise<void>;
};

const AccountsContext = createContext<AccountsContextType | undefined>(
  undefined,
);

export const AccountsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    console.log("AccountsProvider mount, reloading accounts...");
    reloadAccounts();
  }, []);

  const reloadAccounts = async () => {
    try {
      const saved = await AsyncStorage.getItem("accountsData");
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log("Reloaded accounts:", parsed);
        // Sanitize accounts to prevent type casting errors
        const sanitizedAccounts = parsed.map((account: any) =>
          sanitizeAccount(account),
        );
        setAccounts(sanitizedAccounts);
      } else {
        console.log("No saved accounts found, setting empty array");
        setAccounts([]);
      }
    } catch (e) {
      console.error("Failed to reload accounts", e);
    }
  };

  const addOrUpdateAccount = async (account: Account) => {
    console.log("Adding/updating account:", account);
    // Sanitize the account before adding/updating
    const sanitizedAccount = sanitizeAccount(account);
    setAccounts((prev) => {
      const filtered = prev.filter(
        (a) => a.Wallet.XPub !== sanitizedAccount.Wallet.XPub,
      );
      const updated = [...filtered, sanitizedAccount];
      console.log("Updated accounts list:", updated);
      AsyncStorage.setItem("accountsData", JSON.stringify(updated));
      return updated;
    });
  };

  const deleteAccount = async (XPub: string) => {
    console.log("Deleting account with XPub:", XPub);
    setAccounts((prev) => {
      const updated = prev.filter((a) => a.Wallet.XPub !== XPub);
      console.log("Accounts after deletion:", updated);
      AsyncStorage.setItem("accountsData", JSON.stringify(updated));
      return updated;
    });
  };

  const clearAccounts = async () => {
    console.log("Clearing all accounts...");
    setAccounts([]);
    await AsyncStorage.removeItem("accountsData");
  };

  return (
    <AccountsContext.Provider
      value={{
        accounts,
        addOrUpdateAccount,
        deleteAccount,
        clearAccounts,
        reloadAccounts,
      }}
    >
      {children}
    </AccountsContext.Provider>
  );
};

export const useAccounts = () => {
  const ctx = useContext(AccountsContext);
  if (!ctx) throw new Error("useAccounts must be used inside AccountsProvider");
  return ctx;
};
