import { Project, SyntaxKind, Type, Symbol } from "ts-morph";
import { globSync } from "glob";
import fs from "fs-extra";
import path from "path";

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

const swaggerSpec: any = {
  openapi: "3.0.0",
  info: { title: "Auto-generated API", version: "1.0.0" },
  paths: {},
  components: { schemas: {} },
  tags: [],
};

const visitedTypes = new Set<string>();

function typeToSchema(type: Type | undefined): any {
    if (!type) return { type: "object" };
  
    const typeText = type.getText();
    const typeName = type.getSymbol()?.getName();

    if (typeName && visitedTypes.has(typeName)) return { type: "object", description: `Recursive reference to ${typeName}` };
    if (typeName) visitedTypes.add(typeName);
  
    if (type.isString()) return { type: "string" };
    if (type.isNumber()) return { type: "number" };
    if (type.isBoolean()) return { type: "boolean" };
    
    if (typeText === "Date" || (typeName === "Date" && type.isObject())) {
        return { type: "string", format: "date-time" };
    }

    if (type.isArray()) {
      const elementType = type.getArrayElementType();
      return {
        type: "array",
        items: elementType ? typeToSchema(elementType) : { type: "object" },
      };
    }
  
    if (type.isUnion()) {
      const unionTypes = type.getUnionTypes();
      const nonNullishTypes = unionTypes.filter(t => !t.isNull() && !t.isUndefined());
      
      if (nonNullishTypes.length === 1) {
          // FIX 3 Applied here: Access first element
          const schema = typeToSchema(nonNullishTypes[0]); 
          if (unionTypes.length !== nonNullishTypes.length) {
              schema.nullable = true; 
          }
          return schema;
      }
      
      return {
        oneOf: nonNullishTypes.map((ut) => typeToSchema(ut)),
      };
    }
  
    if (type.isInterface() || type.isObject()) {
      const props: Record<string, any> = {};
      
      type.getProperties().forEach((propSymbol: Symbol) => {
        const declarations = propSymbol.getDeclarations();
        if (declarations.length > 0) {
          // FIX 4 applied in previous response, ensuring single node is passed
          const propType = project.getTypeChecker().getTypeOfSymbolAtLocation(propSymbol, declarations[0]); 
          if (propType) {
            props[propSymbol.getName()] = typeToSchema(propType);
          }
        }
      });
      
      if (typeName && !swaggerSpec.components.schemas[typeName]) {
          swaggerSpec.components.schemas[typeName] = { type: "object", properties: props };
          return { $ref: `#/components/schemas/${typeName}` };
      }

      return { type: "object", properties: props };
    }
  
    return { type: "string" };
}

// Helper to convert first letter uppercase for tag
const toTag = (str: string) => str.toUpperCase() + str.slice(1);


// Scan all route files
const routeFiles = globSync("src/routes/**/*.ts");

routeFiles.forEach(filePath => {
  const source = project.addSourceFileAtPath(filePath);
  const routerVar = source.getVariableDeclarations()
    .find(v => v.getType().getText().includes("Router"))?.getName() || "router";

  const routerCalls = source.getDescendantsOfKind(SyntaxKind.CallExpression);

  routerCalls.forEach(call => {
    const expressionText = call.getExpression().getText();
    if (!expressionText.startsWith(routerVar + ".")) return;

    // FIX 1 Applied here: Accessing the second element before toLowerCase()
    const httpMethod = expressionText.split(".")[1].toLowerCase(); 
    const [routePathNode, ...handlers] = call.getArguments();
    const routePath = routePathNode.getText().replace(/['"`]/g, "");

    // FIX 2 Applied here: Accessing the first element before toTag()
    const tag = toTag(path.basename(filePath).split(".")[0]); 
    if (!swaggerSpec.tags.find((t: any) => t.name === tag)) {
      swaggerSpec.tags.push({ name: tag });
    }

    let requestBody: any = undefined;
    if (["post", "put", "patch", "delete"].includes(httpMethod)) {
      requestBody = {
        required: true,
        content: {
          "application/json": { schema: { type: "object", properties: {} } },
        },
      };

      const controllerFuncName = handlers[handlers.length - 1].getText();
      let controllerFilePath = "";

      source.getImportDeclarations().forEach(imp => {
        if (imp.getNamedImports().some(n => n.getName() === controllerFuncName)) {
          controllerFilePath = path.join(path.dirname(filePath), imp.getModuleSpecifierValue() + ".ts");
        }
      });


      if (controllerFilePath && fs.existsSync(controllerFilePath)) {
        try {
          const ctrlSource = project.addSourceFileAtPath(controllerFilePath);
          const funcDecl = ctrlSource.getFunction(controllerFuncName);
          
          if (funcDecl) {
            const serviceCall = funcDecl.getDescendantsOfKind(SyntaxKind.CallExpression)
              .find(c => c.getExpression().getText().includes("Service"));

            if (serviceCall) {
              const serviceNameParts = serviceCall.getExpression().getText().split(".");
              const serviceFunc = serviceNameParts.pop()!;
              
              const serviceImport = ctrlSource.getImportDeclarations()
                .find(i => i.getNamedImports().some(n => n.getName() === serviceFunc));

              if (serviceImport) {
                const servicePath = path.join(path.dirname(controllerFilePath), serviceImport.getModuleSpecifierValue() + ".ts");
                
                if (fs.existsSync(servicePath)) {
                    const srvSource = project.addSourceFileAtPath(servicePath);
                    const srvFunc = srvSource.getFunction(serviceFunc);
                    
                    if (srvFunc) {
                        const params = srvFunc.getParameters(); // Get parameters array
                        if (params.length > 0) { // Check if parameter exists
                            visitedTypes.clear(); 
                            const paramType = params[0].getType(); // Access the first parameter type
                            const schema = typeToSchema(paramType);
                            requestBody.content["application/json"].schema = schema;
                        }
                    }
                }
              }
            }
          }
        } catch (err: any) {
          // console.warn(`Error parsing controller/service for ${controllerFuncName}:`, err.message);
        }
      }
    }

    if (!swaggerSpec.paths[routePath]) swaggerSpec.paths[routePath] = {};
    swaggerSpec.paths[routePath][httpMethod] = {
      tags: [tag],
      summary: `Auto-generated ${httpMethod.toUpperCase()} ${routePath}`,
      description: `Auto-generated endpoint for ${routePath}`,
      ...(requestBody ? { requestBody } : {}),
      responses: {
        200: { description: "Success" },
        400: { description: "Bad Request" },
        500: { description: "Server Error" },
      },
    };
  });
});

fs.ensureDirSync("src/docs");
fs.writeJSONSync("src/docs/generated-swagger.json", swaggerSpec, { spaces: 2 });

console.log("Swagger JSON generated at src/docs/generated-swagger.json");
