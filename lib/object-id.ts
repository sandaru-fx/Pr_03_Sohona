/** MongoDB ObjectId hex string (24 chars). */
const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

export function isMongoObjectId(value: string): boolean {
  return OBJECT_ID_RE.test(value);
}
