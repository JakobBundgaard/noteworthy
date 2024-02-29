import { useFetcher } from "@remix-run/react";
import { format } from "date-fns";
import { useEffect, useRef } from "react";

export default function EntryForm({ entry }) {
  const fetcher = useFetcher();
  const textareaRef = useRef(null);

  const isIdle = fetcher.state === "idle";
  const isInit = isIdle && fetcher.data == null;

  useEffect(() => {
    if (!isInit && isIdle && textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.focus();
    }
  }, [isInit, isIdle]);

  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-gray-100 rounded-lg shadow-md ">
      <fetcher.Form method="post" className="space-y-4 mt-4">
        <fieldset
          className="space-y-4 disabled:opacity-70"
          disabled={fetcher.state !== "idle"}
        >
          <div className="flex flex-col">
            <input
              type="date"
              name="date"
              required
              className="form-input px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue={entry?.date ?? format(new Date(), "yyyy-MM-dd")}
            />
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { label: "Work", value: "work" },
              { label: "Learning", value: "learning" },
              { label: "Interesting thing", value: "interesting-thing" },
            ].map((option) => (
              <label key={option.value} className="inline-block">
                <input
                  required
                  type="radio"
                  className="mr-1 accent-slate-500"
                  name="type"
                  value={option.value}
                  defaultChecked={option.value === (entry?.type ?? "work")}
                />
                {option.label}
              </label>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            placeholder="Type your entry..."
            name="text"
            required
            defaultValue={entry?.text}
            className="form-textarea px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
          <button
            type="submit"
            className="w-full  bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {fetcher.state !== "idle" ? "Saving..." : "Save"}{" "}
          </button>
        </fieldset>
      </fetcher.Form>
    </div>
  );
}
