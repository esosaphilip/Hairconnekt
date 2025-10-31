import { http } from '../api/http';

// Basic users service shim to satisfy imports and support avatar uploads
// Extend this with real endpoints as your backend evolves
export const usersApi = {
  async uploadAvatar(imageUri: string): Promise<{ url: string }> {
    try {
      // Attempt to upload via backend; expect { url } in response
      const res = await http.post('/users/avatar', { uri: imageUri });
      const url = (res.data && (res.data.url as string)) || imageUri;
      return { url };
    } catch (err) {
      // Fallback: return the provided URI so the app remains usable
      return { url: imageUri };
    }
  },
};

export default usersApi;