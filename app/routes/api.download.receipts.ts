import { LoaderFunction, redirect } from "@remix-run/node";
import { db } from "~/utils/db.server";
import { convertToCSV } from "~/utils/helpers";
import { requireUserId } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || !user.isAdmin) throw redirect("/sign-in");

  const receipts = await db.receipt.findMany();

  const data = convertToCSV(
    receipts.map((r) => ({
      id: r.receiptNumber,
      name: r.name,
      phone: r.phone,
      wing: r.wing,
      date: new Date(r.date).toLocaleDateString(["en-IN"]),
      amount: r.amount,
      address: r.address,
    })),
  );

  return new Response(data, {
    headers: {
      "content-type": "text/csv;charset=UTF-8",
    },
  });
};
