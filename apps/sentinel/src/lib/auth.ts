export const MASTER_KEY = "AxelDp04";

export const isValidAdminKey = (key: string | null) => {
  return key === MASTER_KEY;
};

export const getStoredAdminKey = () => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("sentinel_access_key");
};

export const setStoredAdminKey = (key: string) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("sentinel_access_key", key);
  }
};

export const clearAdminKey = () => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("sentinel_access_key");
  }
};
