import { useLoaderData, Link } from "@remix-run/react";
import { format, startOfWeek, parseISO } from "date-fns";
import mongoose from "mongoose";
import EntryForm from "~/components/entry-form";
import { getSession } from "../session.server";

export async function loader({ request }) {
  let session = await getSession(request.headers.get("cookie"));

  const entries = await mongoose.models.Entry.find().lean().exec();

  return {
    session: session.data,
    entries: entries.map((entry) => ({
      ...entry,
      date: entry.date.toISOString().substring(0, 10),
    })),
  };
}

export default function Index() {
  const { session, entries } = useLoaderData();

  const entriesByWeek = entries.reduce((memo, entry) => {
    let monday = startOfWeek(parseISO(entry.date), { weekStartsOn: 1 });
    let mondayString = format(monday, "yyyy-MM-dd");

    memo[mondayString] ||= [];
    memo[mondayString].push(entry);

    return memo;
  }, {});

  const weeks = Object.keys(entriesByWeek)
    .sort((a, b) => a.localeCompare(b))
    .map((dateString) => ({
      dateString,
      work: entriesByWeek[dateString].filter((entry) => entry.type === "work"),
      learnings: entriesByWeek[dateString].filter(
        (entry) => entry.type === "learning",
      ),
      interestingThings: entriesByWeek[dateString].filter(
        (entry) => entry.type === "interesting-thing",
      ),
    }));

  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-slate-300 rounded-lg shadow-md">
      {session.isAdmin && (
        <div>
          <h2 className="text-center text-2xl mb-4">Create a new entry</h2>
          <div className="border p-4 bg-white rounded-md">
            <EntryForm />
          </div>
        </div>
      )}

      <div className="mt-12 space-y-12">
        {weeks.map((week) => (
          <div key={week.dateString}>
            <p className="font-bold">
              {format(parseISO(week.dateString), "'Week' w - dd MMM, yyyy", {
                weekStartsOn: 1,
              })}
            </p>
            <div className="mt-3 space-y-4">
              {week.work.length > 0 && (
                <div className="bg-slate-200 rounded-lg shadow-md">
                  <p className="p-2">Work</p>
                  <ul className="ml-8 list-disc">
                    {week.work.map((entry) => (
                      <EntryListItem
                        key={entry._id}
                        entry={entry}
                        canEdit={session.isAdmin}
                      />
                    ))}
                  </ul>
                </div>
              )}
              {week.learnings.length > 0 && (
                <div className="bg-slate-200 rounded-lg shadow-md">
                  <p className="p-2">Learning</p>
                  <ul className="ml-8 list-disc">
                    {week.learnings.map((entry) => (
                      <EntryListItem
                        key={entry._id}
                        entry={entry}
                        canEdit={session.isAdmin}
                      />
                    ))}
                  </ul>
                </div>
              )}
              {week.interestingThings.length > 0 && (
                <div className="bg-slate-200 rounded-lg shadow-md">
                  <p className="p-2">Interesting things</p>
                  <ul className="ml-8 list-disc">
                    {week.interestingThings.map((entry) => (
                      <EntryListItem
                        key={entry._id}
                        entry={entry}
                        canEdit={session.isAdmin}
                      />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function action({ request }) {
  const session = await getSession(request.headers.get("cookie"));

  if (!session.data.isAdmin) {
    throw new Response("Not authenticated", {
      status: 401,
      statusText: "Not authenticated",
    });
  }

  let formData = await request.formData();

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return mongoose.models.Entry.create({
    date: new Date(formData.get("date")),
    type: formData.get("type"),
    text: formData.get("text"),
  });
}

function EntryListItem({ entry, canEdit }) {
  return (
    <li className="p-1 group">
      {entry.text} -{" "}
      <span className="italic">{format(entry.date, "dd MMM")}</span>
      {canEdit && (
        <Link
          to={`/entries/${entry._id}/edit`}
          className="ml-2 h-3 bg-slate-500 hover:bg-slate-600 text-white font-bold py-0.5  px-3 rounded-md opacity-0 group-hover:opacity-100"
        >
          Edit
        </Link>
      )}
    </li>
  );
}
