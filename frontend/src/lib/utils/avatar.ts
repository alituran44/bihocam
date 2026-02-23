/**
 * Avatar URL helper functions
 */

/**
 * Converts relative avatar URL to full URL
 */
export const getAvatarUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  
  // Eğer zaten tam URL ise direkt döndür
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  
  // Eğer /api/v1/ ile başlıyorsa, base URL ekle
  if (url.startsWith("/api/v1/")) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";
    return `${baseUrl}${url}`;
  }
  
  // Diğer durumlarda direkt döndür (zaten tam URL olabilir)
  return url;
};

/**
 * Gets user initials from full name
 */
export const getUserInitials = (fullName: string | null | undefined): string => {
  if (!fullName) return "U";
  
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  // İlk ve son kelimenin ilk harflerini al
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};
