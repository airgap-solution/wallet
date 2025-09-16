import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type FiatContextType = {
  fiat: string;
  setFiat: (currency: string) => void;
};

const FiatContext = createContext<FiatContextType>({
  fiat: "USD",
  setFiat: () => {},
});

export const useFiat = () => useContext(FiatContext);

export const FiatProvider = ({ children }: { children: ReactNode }) => {
  const [fiat, setFiatState] = useState("USD");

  useEffect(() => {
    // Load saved fiat from storage
    AsyncStorage.getItem("fiatCurrency").then((value) => {
      if (value) setFiatState(value);
    });
  }, []);

  const setFiat = (currency: string) => {
    setFiatState(currency);
    AsyncStorage.setItem("fiatCurrency", currency).catch(console.warn);
  };

  return (
    <FiatContext.Provider value={{ fiat, setFiat }}>
      {children}
    </FiatContext.Provider>
  );
};
