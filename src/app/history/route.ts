import { transactions } from "./data";

export async function GET() {
  return Response.json(transactions);
}

export async function POST(request: Request) {
  // to extract the body from the request
  const transaction = await request.json();
  const newTransaction = {
    id: transactions.length + 1,
    ...transaction,
  };
  transactions.push(newTransaction);
  return new Response(JSON.stringify(newTransaction), {
    headers: {
      "Content-Type": "application/json",
    },
    status: 201, // resource created
  });
}
