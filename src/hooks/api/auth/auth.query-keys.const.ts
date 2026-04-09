export const authQueryKeys = {
  all: ["auth"] as const,
  logout: () => [...authQueryKeys.all, "logout"] as const,
};
