interface recipe {
    id: number;
    title: string;
    description: string;
    userId: number;
    created_at: string;
  }
  
  interface user {
    id: number;
    fullName: string;
    username: string;
    email: string;
    password: string;
    created_at: string;
  }
  
  export type { recipe, user };