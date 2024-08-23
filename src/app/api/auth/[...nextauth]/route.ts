import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }): Promise<string> {
      // Redirect to the congratulations page after successful sign-in
      return `${baseUrl}/congratulations`;
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
