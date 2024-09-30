export interface Transaction {
  id: number;
  recipientAddress: string;
  amount: string;
  timestamp: string;
}

export const transactions: Transaction[] | [] = [];
