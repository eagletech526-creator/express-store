import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

//create a connection to the database using the neon library and export it for use in other parts of the application
export const sql = neon(
  `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`,
);
//this sql function is used as a tagged template literal to execute SQL queries against the database. It allows you to write SQL queries in a more readable and maintainable way, while also providing protection against SQL injection attacks by automatically escaping values.
