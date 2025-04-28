
// Helper function to validate URL format (basic check)
export const isValidUrl = (urlStr: string | undefined): boolean => {
    if (!urlStr) return false;
    try {
        // Basic check: starts with http:// or https://
        // Allows URLs without paths like "http://example.com"
        if (!urlStr.match(/^https?:\/\/[^\s/$.?#].[^\s]*$/i)) {
           return false;
        }
        new URL(urlStr); // Check if it can be parsed
        return true;
    } catch (e) {
        return false;
    }
};

// Helper function to validate DD/MM/YYYY format
export const isValidDateString = (dateStr: string | undefined): boolean => {
    if (!dateStr) return false;
    // Basic regex check for format
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return false;

    // Further check for valid date components
    try {
        const [day, month, year] = dateStr.split('/').map(Number);
        if (month < 1 || month > 12 || day < 1 || day > 31) return false;
        // Basic check for days in month (doesn't handle leap years perfectly but is a good start)
        if ([4, 6, 9, 11].includes(month) && day > 30) return false;
        if (month === 2 && day > 29) return false; // Allows 29 for potential leap year

        // Optionally: Could use date-fns or similar for more robust validation
        // const date = new Date(year, month - 1, day);
        // return !isNaN(date.getTime()) && date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;

        return true; // Passed basic checks
    } catch {
        return false; // Error during parsing
    }
};

// Helper function to validate HH:MM format
export const isValidTimeString = (timeStr: string | undefined): boolean => {
    if (!timeStr) return false;
    // Basic regex check for format HH:MM (00:00 to 23:59)
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(timeStr)) return false;
    return true;
};
