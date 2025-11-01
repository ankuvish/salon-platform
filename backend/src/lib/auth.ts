import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { db } from "../db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {    
    enabled: true
  },
  plugins: [bearer()],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "customer",
        input: false
      },
      phone: {
        type: "string",
        required: false,
        input: false
      },
      gender: {
        type: "string",
        required: false,
        input: false
      }
    }
  },
  trustedOrigins: [process.env.FRONTEND_URL || "http://localhost:3000"]
});

// Middleware to validate session from bearer token
export async function validateSession(req: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  try {
    const session = await auth.api.getSession({ headers: { authorization: `Bearer ${token}` } });
    return session?.user || null;
  } catch (error) {
    return null;
  }
}
