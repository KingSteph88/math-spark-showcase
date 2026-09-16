/**
 * Teachers and students now share one login, one token and one axios
 * client. This module is a thin re-export so the existing
 * `import { teacherApi }` call sites keep working.
 */
export { api as teacherApi, api, clearSession, saveSession, getAccountType } from "./api";
