// Stub do AuthContext para backend - substituindo versão frontend
// Esta versão simples evita os erros de compilação

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  signIn: (credentials: { email: string; password: string }) => Promise<boolean>;
  signOut: () => void;
  isAuthenticated: boolean;
}

// Contexto de autenticação simplificado para backend
export const useAuth = (): AuthContextType => {
  return {
    user: null,
    signIn: async () => true, 
    signOut: () => {},
    isAuthenticated: false
  };
};

export default useAuth;
