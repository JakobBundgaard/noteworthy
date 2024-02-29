import { useLoaderData, Form } from "@remix-run/react";
import mongoose from "mongoose";
import { redirect } from "@remix-run/node";
import EntryForm from "~/components/entry-form";
import { getSession } from "~/session.server";

export async function loader({ params, request }) {
  const session = await getSession(request.headers.get("cookie"));

  if (typeof params.entryId !== "string") {
    throw new Response("Not found", {
      status: 404,
      statusText: "Not found",
    });
  }

  let entry = await mongoose.models.Entry.findById(params.entryId)
    .lean()
    .exec();

  if (!entry) {
    throw new Response("Not found", {
      status: 404,
      statusText: "Not found",
    });
  }

  if (!session.data.isAdmin) {
    throw new Response("Not authenticated", {
      status: 401,
      statusText: "Not authenticated",
    });
  }

  return {
    ...entry,
    date: entry.date.toISOString().substring(0, 10),
  };
}

export default function EditPage() {
  let entry = useLoaderData();

  function handleSubmit(event) {
    if (!confirm("Are you sure?")) {
      event.preventDefault();
    }
  }

  return (
    <div className="mt-4 text-center">
      <p>Editing entry {entry._id}</p>
      <EntryForm entry={entry} />

      <div className="mt-8">
        <Form method="post" onSubmit={handleSubmit}>
          <button
            name="_action"
            value="delete"
            className="text-gray-500 underline"
          >
            Delete this entry...
          </button>
        </Form>
      </div>
    </div>
  );
}

export async function action({ params, request }) {
  const session = await getSession(request.headers.get("cookie"));

  if (typeof params.entryId !== "string") {
    throw new Response("Not found", {
      status: 404,
      statusText: "Not found",
    });
  }

  if (!session.data.isAdmin) {
    throw new Response("Not authenticated", {
      status: 401,
      statusText: "Not authenticated",
    });
  }

  let formData = await request.formData();

  // Artificial delay to simulate slow network
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (formData.get("_action") === "delete") {
    await mongoose.models.Entry.findByIdAndDelete(params.entryId);

    return redirect("/");
  } else {
    const entry = await mongoose.models.Entry.findById(params.entryId);

    entry.date = new Date(formData.get("date"));
    entry.type = formData.get("type");
    entry.text = formData.get("text");

    // Mongoose will automatically validate the entry before saving and if it
    // throws an error, Remix will catch it and display it to the user
    await entry.save();

    return redirect("/");
  }
}
