/**
 * @file File Utility Functions
 * @description Reusable utility functions for file processing operations.
 * Extracted from ClaimProcessor to follow the Single Responsibility Principle.
 */

/**
 * Converts a File object to a Base64-encoded string.
 * Strips the data URI prefix, returning only the raw Base64 payload.
 *
 * @param file - The File object to convert
 * @returns A promise that resolves to the Base64-encoded string
 * @throws {DOMException} If the FileReader encounters an error
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
}
