import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import Adapters from "next-auth/adapters";

import { NextApiHandler } from "next";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { verify } from "jsonwebtoken";

const prisma = new PrismaClient();

const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, options);
export default authHandler;

const options = {
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    Providers.Email({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      from: process.env.SMTP_FROM,
    }),
    Providers.Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Providers.Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    Providers.Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  // @ts-ignore
  adapter: Adapters.Prisma.Adapter({
    prisma,
  }),
  session: {
    jwt: true,
  },
  callbacks: {
    async signIn(user, account, metadata) {
      return true;
    },
    // async redirect(url, baseUrl) {
    //   return baseUrl;
    // },
    async session(session, token) {
      return session;
    },
    async jwt(token: Token, user, account, profile, isNewUser) {
      console.log(token);
      if (!user && !account && !isNewUser) {
        console.log(token);

        const payload = {
          name: token?.name,
          email: token.email,
        };

        const result = await getTokenFromYourAPIServer(payload);

        const { accessToken, refreshToken } = result.data;
        token.accessToken = accessToken;
        token.refreshToken = refreshToken;
      }

      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
  },

  secret: process.env.SECRET,
};

interface Token {
  name?: string;
  email: string;
  picture?: string;
  iat: number;
  exp: number;
  provider?: string;
  accessToken?: string;
  refreshToken?: string;
}

const getTokenFromYourAPIServer = async (user) => {
  const url = "http://localhost:4000/api/v2/login";
  const res = await axios.post(url, {
    user,
  });
  return res;
};

const getRefreshToken = async (refreshToken) => {
  const url = "http://localhost:4000/api/v2/token-refresh";
  const res = await axios.post(url, {
    refreshToken,
  });
  return res;
};
