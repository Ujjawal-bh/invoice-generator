import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { authConfigBase } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfigBase,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
        });
        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(parsed.data.password, user.password);
        if (!ok) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
});
