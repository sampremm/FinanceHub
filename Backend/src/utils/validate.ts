export const validateRecord = (body: any) => {
  const { type, amount, category } = body;

  if (!type || !amount || !category) {
    throw new Error("Missing required fields");
  }

  if (!["INCOME", "EXPENSE"].includes(type)) {
    throw new Error("Invalid type");
  }

  if (amount <= 0) {
    throw new Error("Amount must be positive");
  }
};