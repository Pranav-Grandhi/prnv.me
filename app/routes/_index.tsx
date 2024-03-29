import * as React from "react";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import fs from "fs";
import path from "path";
import { array, object, string, enums, validate } from "superstruct";

const changeTypes = ["Me", "Projects", "Writing"];

const Changes = array(
  object({
    title: string(),
    description: string(),
    occurrence: string(),
    type: enums(changeTypes),
  }),
);

export const loader = () => {
  const contentPath = "changes.json";

  if (process.env.NODE_ENV === "production") {
    throw new Error("This code is not ready for production use.");
  } else {
    try {
      const rawContent = fs.readFileSync(
        path.join(process.cwd(), "content", contentPath),
        { encoding: "utf-8" },
      );

      let validatedContent;

      const validationResult = validate(JSON.parse(rawContent), Changes);
      if (validationResult[0] !== undefined) {
        console.error(`Validation failed: ${validationResult[0]}`);
        throw new Error("Validation failed");
      }
      validatedContent = validationResult[1];

      return json({ changes: validatedContent });
    } catch (error) {
      console.error(`Could not read 'content/${contentPath}': ${error}`);
      throw new Error(`Failed to read the file '${contentPath}'.`);
    }
  }
};

export default function Index() {
  const { changes } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const changeTypesParam = searchParams.get("changeTypes");
  const selectedChangeTypes = changeTypesParam
    ? changeTypesParam.split("+").map((item) => item.trim())
    : changeTypes;

  const filteredChanges = React.useMemo(() => {
    for (let i = 0; i < selectedChangeTypes.length; i++) {
      if (!changeTypes.includes(selectedChangeTypes[i]))
        throw new Error(`Invalid change type: '${selectedChangeTypes[i]}'`);
    }

    return changes.filter((change) =>
      selectedChangeTypes.includes(change.type),
    );
  }, [selectedChangeTypes, changes]);

  const toggleChangeType = (changeType: string) => {
    let updatedChangeTypes = selectedChangeTypes;
    if (selectedChangeTypes.includes(changeType)) {
      updatedChangeTypes = updatedChangeTypes.filter(
        (type) => type !== changeType,
      );
    } else {
      updatedChangeTypes.push(changeType);
    }

    const params = new URLSearchParams();
    if (updatedChangeTypes.length > 0) {
      params.set("changeTypes", updatedChangeTypes.join("+"));
    }
    setSearchParams(params);
  };

  return (
    <div>
      <div>
        {changeTypes.map((changeType) => (
          <button key={changeType} onClick={() => toggleChangeType(changeType)}>
            {changeType}
          </button>
        ))}
      </div>
      <div>
        {filteredChanges.map(({ title, description, occurrence }) => {
          const formattedDate = new Date(occurrence).toLocaleString("en-us", {
            month: "long",
            day: "numeric",
            year: "numeric",
          });

          return (
            <article key={title}>
              <time dateTime={occurrence}>{formattedDate}</time>
              <h2>{title}</h2>
              <p>{description}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
