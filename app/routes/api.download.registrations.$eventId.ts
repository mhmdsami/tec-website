import { LoaderFunction, redirect } from "@remix-run/node";
import { db } from "~/utils/db.server";
import { convertToCSV } from "~/utils/helpers";
import { requireUserId } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || !user.isAdmin) throw redirect("/sign-in");

  const eventId = params.eventId;
  if (!eventId) throw redirect("/admin");

  const registrations = await db.eventRegistration.findMany({
    where: { eventId },
    include: {
      category: true,
      event: true,
    },
  });
  const data = convertToCSV(
    registrations.map((r) => ({
      ...r,
      event: r.event.title,
      category: r.category.name,
    })),
  );

  return new Response(data, {
    headers: {
      "content-type": "text/csv;charset=UTF-8",
    },
  });
};
