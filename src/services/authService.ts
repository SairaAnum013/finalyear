import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  user?: User;
  error?: string;
}

/**
 * Authentication Service
 * 
 * Currently uses Supabase for real authentication.
 * This abstraction makes it easy to switch backends later.
 */
export const authService = {
  /**
   * Sign up a new user
   */
  async signup(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      const redirectUrl = `${window.location.origin}/confirm-account`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: name,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        return {
          user: {
            id: data.user.id,
            email: data.user.email || email,
            name: name,
          }
        };
      }

      return { error: "Signup failed" };
    } catch (error: any) {
      return { error: error.message || "Signup failed" };
    }
  },

  /**
   * Sign in an existing user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        return {
          user: {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.full_name,
          }
        };
      }

      return { error: "Login failed" };
    } catch (error: any) {
      return { error: error.message || "Login failed" };
    }
  },

  /**
   * Sign out current user
   */
  async logout(): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return {};
    } catch (error: any) {
      return { error: error.message || "Logout failed" };
    }
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        return {
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.full_name,
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  },

  /**
   * Request password reset email
   * 
   * IMPORTANT: For this to work end-to-end, ensure the redirect URL is added to
   * Supabase's allowed redirect URLs in the backend settings:
   * Go to Backend (Cloud) → Users → Auth Settings → Redirect URLs
   * Add: https://your-domain.lovable.app/update-password (production)
   * Add: http://localhost:5173/update-password (for local development if needed)
   * 
   * Using window.location.origin automatically handles different environments.
   */
  async requestPasswordReset(email: string): Promise<{ error?: string }> {
    try {
      // Uses current domain - works in preview, production, and localhost
      const redirectUrl = `${window.location.origin}/update-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      return {};
    } catch (error: any) {
      return { error: error.message || "Failed to send reset email" };
    }
  },

  /**
   * Update user password
   */
  async updatePassword(newPassword: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return {};
    } catch (error: any) {
      return { error: error.message || "Failed to update password" };
    }
  }
};
