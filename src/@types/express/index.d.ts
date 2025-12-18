declare global {
  namespace Express {
    interface User {
      id: number;
      role: 'normal' | 'seller' | 'admin' | 'superadmin';
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
