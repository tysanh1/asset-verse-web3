
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

// Define types
interface User {
  id: string;
  email: string;
  createdAt: string;
}

interface AuthResponse {
  user: User | null;
  session: {
    access_token: string;
  } | null;
}

// LocalStorage keys
const USER_KEY = 'local_auth_user';
const SESSION_KEY = 'local_auth_session';

export const localAuthService = {
  signUp: async (email: string, password: string): Promise<void> => {
    try {
      // Check if user exists
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userExists = users.some((u: any) => u.email === email);
      
      if (userExists) {
        throw new Error('User already exists');
      }
      
      // Create new user
      const newUser = {
        id: uuidv4(),
        email,
        password, // In a real app, this would be hashed
        createdAt: new Date().toISOString(),
      };
      
      // Save user
      localStorage.setItem('users', JSON.stringify([...users, newUser]));
      
      return Promise.resolve();
    } catch (error: any) {
      const { toast } = useToast();
      toast({
        title: 'Error creating account',
        description: error.message || 'Failed to create account',
        variant: 'destructive'
      });
      return Promise.reject(error);
    }
  },
  
  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      // Find user
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid login credentials');
      }
      
      // Create session
      const { password: _, ...safeUser } = user;
      const session = {
        access_token: uuidv4(),
        user: safeUser
      };
      
      // Save session
      localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      
      return {
        user: safeUser,
        session
      };
    } catch (error: any) {
      const { toast } = useToast();
      toast({
        title: 'Login failed',
        description: error.message || 'Failed to sign in',
        variant: 'destructive'
      });
      return Promise.reject(error);
    }
  },
  
  signOut: async (): Promise<void> => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_KEY);
    return Promise.resolve();
  },
  
  resetPassword: async (email: string): Promise<void> => {
    // In a real app, this would send an email
    const { toast } = useToast();
    toast({
      title: 'Password reset link sent',
      description: `If an account exists for ${email}, you will receive a password reset link.`
    });
    return Promise.resolve();
  },
  
  getSession: async (): Promise<any> => {
    const user = localStorage.getItem(USER_KEY);
    const session = localStorage.getItem(SESSION_KEY);
    
    if (!user || !session) {
      return { data: { session: null } };
    }
    
    return {
      data: {
        session: JSON.parse(session)
      }
    };
  },
  
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    // This is a simplified version that doesn't handle real-time changes
    const session = localStorage.getItem(SESSION_KEY);
    
    if (session) {
      callback('SIGNED_IN', JSON.parse(session));
    } else {
      callback('SIGNED_OUT', null);
    }
    
    return {
      subscription: {
        unsubscribe: () => {}
      }
    };
  }
};
