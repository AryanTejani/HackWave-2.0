import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { sendMail } from "@/lib/mailer";
import { connectToDatabase } from "@/lib/mongo";
import { User } from "@/models/User";

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ user, account }: { user: { name?: string | null; email?: string | null; image?: string | null }; account: { provider?: string } | null }) {
      await connectToDatabase();
      await sendMail(
        user.email!,
        "Welcome to hackwave",
        `Hello ${user.name},\n\nYou have successfully logged in!`
      );
      const existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        await User.create({
          name: user.name,
          email: user.email,
          image: user.image,
          provider: account?.provider,
        });
      }

      return true;
    },

    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user._id;
        token.email = user.email;
      }
      return token;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session(params: any) {
      const { session, token } = params;
      await connectToDatabase();

      const dbUser = await User.findOne({ email: session.user?.email });

      if (dbUser) {
        session.user.id = dbUser._id.toString();
        session.user.provider = dbUser.provider;
      }

      return session;
    },
  },
};