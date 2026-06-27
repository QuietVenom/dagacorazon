import { v7 as uuidv7 } from "uuid";

/** Generate the canonical identifier used by application-owned entities. */
export const createId = (): string => uuidv7();
