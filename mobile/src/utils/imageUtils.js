import { API_URL } from '../constants';

/**
 * Get the full image URL from a relative or absolute URL
 * @param {string} imageUrl - The image URL (can be relative or absolute)
 * @returns {string} - The full image URL
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // If it's already a full URL (http:// or https://), normalize localhost if needed
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    try {
      const parsed = new URL(imageUrl);
      const isLocalHost =
        parsed.hostname === 'localhost' ||
        parsed.hostname === '127.0.0.1' ||
        parsed.hostname === '0.0.0.0';

      if (isLocalHost) {
        return `${API_URL}${parsed.pathname}`;
      }
    } catch (error) {
      // If URL parsing fails, fall back to original URL
    }

    return imageUrl;
  }

  // If it's a data URL, return as is
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  // If it starts with /, prepend the API_URL
  if (imageUrl.startsWith('/')) {
    return `${API_URL}${imageUrl}`;
  }

  // Otherwise, assume it's a relative path and prepend API_URL with /
  return `${API_URL}/${imageUrl}`;
};

/**
 * Get thumbnail URL for a course
 * @param {object} course - The course object
 * @returns {string} - The thumbnail URL or placeholder
 */
export const getCourseThumbnail = (course) => {
  const thumbnail =
    course?.thumbnail?.url ||
    course?.thumbnail?.secure_url ||
    course?.thumbnail ||
    course?.image ||
    course?.imageUrl;
  
  if (!thumbnail) {
    return 'https://via.placeholder.com/400x200?text=No+Image';
  }

  return getImageUrl(thumbnail);
};

/**
 * Get user avatar URL
 * @param {object} user - The user object
 * @returns {string} - The avatar URL or placeholder
 */
export const getUserAvatar = (user) => {
  const avatar =
    user?.avatar ||
    user?.profilePicture ||
    user?.profileImage ||
    user?.photo ||
    user?.image ||
    user?.imageUrl;
  
  if (!avatar) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4F46E5&color=fff&size=200`;
  }

  return getImageUrl(avatar);
};
