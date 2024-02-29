import { redirect, json } from "@remix-run/node";
import { Form, useLoaderData, useActionData } from "@remix-run/react";
import { commitSession, getSession } from "~/session.server";

export async function loader({ request }) {
  let session = await getSession(request.headers.get("cookie"));

  return session.data;
}

export default function LoginPage() {
  let data = useLoaderData();
  let actionData = useActionData();

  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-gray-100 rounded-lg shadow-md">
      {data.isAdmin ? (
        <p>You're signed in!</p>
      ) : (
        <Form method="post">
          <input
            className="text-gray-900 m-2"
            type="email"
            name="email"
            required
            placeholder="Email"
          />
          <input
            className="text-gray-900 m-2"
            type="password"
            name="password"
            required
            placeholder="Password"
          />
          <button className="bg-slate-500 px-3 py-1 font-medium text-white rounded-md">
            Log in
          </button>
          {actionData?.error && (
            <p className="mt-4 font-medium text-red-500 text-center">
              {actionData.error}
            </p>
          )}
        </Form>
      )}
    </div>
  );
}

export async function action({ request }) {
  let formData = await request.formData();
  let { email, password } = Object.fromEntries(formData);

  if (email === "jake@mail.com" && password === "1111") {
    let session = await getSession();
    session.set("isAdmin", true);

    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } else {
    let error;

    if (!email) {
      error = "Email is required.";
    } else if (!password) {
      error = "Password is required.";
    } else {
      error = "Invalid login.";
    }

    return json({ error }, 401);
  }
}
