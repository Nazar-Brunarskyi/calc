export const testQueryKeys = {
  all: ["test"] as const,
  bodyValidation: () => [...testQueryKeys.all, "body-validation"] as const,
};
