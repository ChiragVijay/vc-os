export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const getDateStamp = (date: Date = new Date()): string => date.toISOString().slice(0, 10);

export const buildFileName = (baseName: string, extension: string, includeDate = true): string => {
  const slug = slugify(baseName);
  const datePart = includeDate ? `-${getDateStamp()}` : "";
  return `${slug}${datePart}.${extension}`;
};
