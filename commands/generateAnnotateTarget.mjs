import axios from "axios";
import * as fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const text = fs.readFileSync(`${__dirname}/../.env`, "utf-8");
const endpoint = text
  .split("\n")
  .find((v) => v.split("=")[0] === "NEXT_PUBLIC_API_ENDOPOINT")
  .split("=")[1];

const dataset = await axios.get(`${endpoint}/config/dataset`);

const response = await axios.post(
  "http://ep.dbcls.jp/grasp-togoid",
  '{"operationName":"IntrospectionQuery","variables":{},"query":"query IntrospectionQuery {\\n __schema {\\n queryType {\\n name\\n }\\n mutationType {\\n name\\n }\\n subscriptionType {\\n name\\n }\\n types {\\n ...FullType\\n }\\n directives {\\n name\\n description\\n locations\\n args {\\n ...InputValue\\n }\\n }\\n }\\n}\\n\\nfragment FullType on __Type {\\n kind\\n name\\n description\\n fields(includeDeprecated: true) {\\n name\\n description\\n args {\\n ...InputValue\\n }\\n type {\\n ...TypeRef\\n }\\n isDeprecated\\n deprecationReason\\n }\\n inputFields {\\n ...InputValue\\n }\\n interfaces {\\n ...TypeRef\\n }\\n enumValues(includeDeprecated: true) {\\n name\\n description\\n isDeprecated\\n deprecationReason\\n }\\n possibleTypes {\\n ...TypeRef\\n }\\n}\\n\\nfragment InputValue on __InputValue {\\n name\\n description\\n type {\\n ...TypeRef\\n }\\n defaultValue\\n}\\n\\nfragment TypeRef on __Type {\\n kind\\n name\\n ofType {\\n kind\\n name\\n ofType {\\n kind\\n name\\n ofType {\\n kind\\n name\\n ofType {\\n kind\\n name\\n ofType {\\n kind\\n name\\n ofType {\\n  kind\\n  name\\n  ofType {\\n kind\\n name\\n  }\\n }\\n }\\n }\\n }\\n }\\n }\\n}\\n"}',
  {
    headers: {
      "Content-Type": "application/json",
    },
  }
);

const data = response.data;
const filtered = data.data.__schema.types.filter((v) => v.name === "Query")[0]
  .fields;

const obj = {};

filtered.forEach((v) => {
  const key = Object.keys(dataset.data).find(
    (w) => w.replace("_", "").trim() === v.name.toLowerCase().trim()
  );

  obj[key] = v.name;
});

const result =
  "export const annotateTargetList = " + JSON.stringify(obj, null, 2);
fs.writeFileSync(`${__dirname}/../lib/annotate-target.js`, result);
