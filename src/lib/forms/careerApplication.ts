export const CAREER_APPLICATION_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const CAREER_APPLICATION_ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const CAREER_APPLICATION_ALLOWED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
];

export const isAllowedCareerCvFile = (file: File) => {
  const fileName = file.name.toLowerCase();

  return (
    CAREER_APPLICATION_ALLOWED_FILE_TYPES.includes(
      file.type as (typeof CAREER_APPLICATION_ALLOWED_FILE_TYPES)[number],
    ) ||
    CAREER_APPLICATION_ALLOWED_EXTENSIONS.some((extension) =>
      fileName.endsWith(extension),
    )
  );
};
