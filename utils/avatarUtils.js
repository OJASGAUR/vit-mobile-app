// utils/avatarUtils.js

/**
 * Generate a random color for avatar background
 */
export function generateAvatarColor(name) {
  // Generate a consistent color based on the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate a color from the hash
  const hue = hash % 360;
  const saturation = 60 + (hash % 20); // 60-80%
  const lightness = 45 + (hash % 15); // 45-60%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Get the first letter of a name for avatar
 */
export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

