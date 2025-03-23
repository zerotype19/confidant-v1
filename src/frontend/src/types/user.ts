export interface User {
  id: string;
  email: string;
  name: string;
  families?: {
    id: string;
    name: string;
    role: string;
  }[];
} 