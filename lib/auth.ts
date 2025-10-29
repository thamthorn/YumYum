// Authentication utility functions (client-side only)

export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("yumum_buyer_auth");
};

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("yumum_buyer_auth");
};

export const getUserEmail = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("yumum_buyer_email");
};

export const setAuth = (token: string, email: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("yumum_buyer_auth", token);
  localStorage.setItem("yumum_buyer_email", email);
};

export const clearAuth = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("yumum_buyer_auth");
  localStorage.removeItem("yumum_buyer_email");
};
