import { useEffect, useState } from "react";
import { getTheme, saveTheme } from "../services/storage.service";

export default function useTheme() {
  const [theme, setTheme] = useState("dark");
  useEffect(() => { getTheme().then(setTheme).catch(() => {}); }, []);
  const updateTheme = async value => { setTheme(value); await saveTheme(value); };
  const toggleTheme = () => updateTheme(theme === "dark" ? "light" : "dark");
  return { theme, updateTheme, toggleTheme };
}