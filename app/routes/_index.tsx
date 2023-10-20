import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import fs from "fs";
import path from "path";
import { array, object, string, validate } from "superstruct";

const Changes = array(
  object({
    title: string(),
    description: string(),
    occurrence: string(),
  })
);

export const loader = () => {
  const contentPath = "changes.json";

  if (process.env.NODE_ENV === "production") {
    throw new Error("This code is not ready for production use.");
  } else {
    try {
      const rawContent = fs.readFileSync(
        path.join(process.cwd(), "content", contentPath),
        { encoding: "utf-8" }
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

  return (
    <div>
      {changes.map(({ title, description, occurrence }) => {
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
  );
}
