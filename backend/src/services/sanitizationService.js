import sanitizeHtml from "sanitize-html";

/**
 * Configuration for sanitizing rich text HTML content
 * Allows formatting but removes potentially dangerous tags
 */
const SANITIZE_OPTIONS = {
  allowedTags: [
    "b",
    "i",
    "em",
    "strong",
    "u",
    "mark",
    "p",
    "br",
    "h1",
    "h2",
    "h3",
    "ul",
    "ol",
    "li",
    "blockquote",
    "pre",
    "code",
    "a",
    "span",
    "div",
  ],
  allowedAttributes: {
    a: ["href", "title"],
    span: ["style"],
    div: ["style"],
  },
  allowedStyles: {
    span: {
      "background-color": [/^#[0-9a-f]{6}$/i, /^rgb/, /^rgba/],
      color: [/^#[0-9a-f]{6}$/i, /^rgb/, /^rgba/],
      "font-size": [/^\d+px$/],
    },
    div: {
      "background-color": [/^#[0-9a-f]{6}$/i, /^rgb/, /^rgba/],
      color: [/^#[0-9a-f]{6}$/i, /^rgb/, /^rgba/],
    },
  },
  disallowedTagsMode: "discard",
};

/**
 * Sanitize HTML content from rich text editor
 * @param {string} html - HTML content to sanitize
 * @returns {string} Sanitized HTML content
 */
export const sanitizeParagraphContent = (html) => {
  if (!html || typeof html !== "string") {
    return "";
  }

  try {
    return sanitizeHtml(html, SANITIZE_OPTIONS);
  } catch (error) {
    console.error("Error sanitizing HTML:", error);
    // Return original if sanitization fails
    return html;
  }
};

/**
 * Sanitize lesson fields
 * @param {Array} fields - Array of field objects
 * @returns {Array} Fields with sanitized content
 */
export const sanitizeLessonFields = (fields) => {
  if (!Array.isArray(fields)) {
    return fields;
  }

  return fields.map((field) => {
    if (field.type === "paragraph" && field.content) {
      return {
        ...field,
        content: sanitizeParagraphContent(field.content),
      };
    }
    return field;
  });
};

/**
 * Sanitize lessons array
 * @param {Array} lessons - Array of lesson objects
 * @returns {Array} Lessons with sanitized content
 */
export const sanitizeLessons = (lessons) => {
  if (!Array.isArray(lessons)) {
    return lessons;
  }

  return lessons.map((lesson) => ({
    ...lesson,
    fields: sanitizeLessonFields(lesson.fields),
  }));
};
