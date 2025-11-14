/**
 * Helper để load font cho jsPDF
 * Font sẽ được load từ assets hoặc CDN
 */

export class FontLoader {
  /**
   * Load font từ URL và convert sang Base64
   */
  static async loadFontFromUrl(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Remove data URL prefix
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading font from URL:', error);
      throw error;
    }
  }

  /**
   * Load font từ assets folder
   */
  static async loadFontFromAssets(path: string): Promise<string> {
    return this.loadFontFromUrl(`/assets/fonts/${path}`);
  }
}

