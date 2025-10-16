/**
 * Utility functions for user avatar handling
 */

/**
 * Get initials from a full name (max 2 letters)
 * @param {string} name - The full name
 * @returns {string} - 2-letter initials
 */
export const getInitials = (name) => {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Get a consistent color for an avatar based on the name
 * @param {string} name - The name to generate color for
 * @returns {string} - Tailwind CSS color class
 */
export const getAvatarColor = (name) => {
  if (!name) return "bg-gray-400";
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-teal-500",
  ];
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};