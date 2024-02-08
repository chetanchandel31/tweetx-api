/*
usage:
npm run starter-handler "AuthSignIn"
*/
import * as changeCase from "change-case";
import fs from "fs";
import path from "path";
const { pascalCase, camelCase } = changeCase;

function getFileContent(entityName) {
  return `
  import { z } from "zod";
  
  const schema${pascalCase(entityName)}Payload = z.object({});
  
  const schema${pascalCase(entityName)}Response = z.object({});
  
  type Type${pascalCase(
    entityName
  )}Response = z.infer<typeof schema${pascalCase(entityName)}Response>;
  
  const prismaClient = getPrismaClient();
  
  const defineHandler = createRequestHandler(
    schema${pascalCase(entityName)}Payload,
    schema${pascalCase(entityName)}Response
  );
  
  const ${camelCase(entityName)}Handler = defineHandler(async (payload) => {
    let status: number = HttpStatusCode.BAD_REQUEST;
    let responseData: TypeResult<Type${pascalCase(entityName)}Response> = {
      isSuccess: false,
      errorMessages: ["Failed to TODO:"],
    };
  
    return { responseData, status };
  });
  
  export default ${camelCase(entityName)}Handler;
  
 `;
}

function generateFile(entityName) {
  // Specify the file path and name
  const filePath = path.join("./src", `${entityName}.ts`);

  // Write the entityName to the file
  fs.writeFileSync(filePath, getFileContent(entityName), "utf-8");

  console.log(`File generated successfully at: ${filePath}`);
}

// Check if the input argument is provided
const userInput = process.argv[2];

if (userInput) {
  generateFile(userInput);
} else {
  console.error("Please provide input.");
}
