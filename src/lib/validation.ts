
// Helper function to validate URL format (basic check)
export const isValidUrl = (urlStr: string | undefined): boolean => {
    if (!urlStr) return false;
    try {
        // Basic check: starts with http:// or https://
        if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
           return false;
        }
        new URL(urlStr);
        return true;
    } catch (e) {
        return false;
    }
};

// Helper function to validate DD/MM/YYYY format (can be added here or kept inline)
export const isValidDateString = (dateStr: string | undefined): boolean => {
    if (!dateStr) return false;
    return /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr);
};

// Helper function to validate HH:MM format (can be added here or kept inline)
export const isValidTimeString = (timeStr: string | undefined): boolean => {
    if (!timeStr) return false;
    return /^\d{2}:\d{2}$/.test(timeStr);
};

    