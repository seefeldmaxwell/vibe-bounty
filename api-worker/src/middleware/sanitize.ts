// Strip HTML tags from user-provided strings to prevent stored XSS
const TAG_RE = /<\/?[^>]+(>|$)/g;

export function stripHtml(input: string): string {
  return input.replace(TAG_RE, "").trim();
}
