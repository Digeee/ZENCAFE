// Authentication implementation
// Auto-dev mode: If not production, use mock auth (no external OIDC required)

import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import memorystore from "memorystore";

// Auto-detect development mode
const IS_DEV = process.env.NODE_ENV !== "production";

// Use memory store for development
const MemoryStore = memorystore(session);

const getOidcConfig = memoize(
  async () => {
    if (IS_DEV) {
      console.log("DEV MODE: skipping OIDC discovery");

      return {
        issuer: "http://localhost/dev-issuer",
        userinfo: () => Promise.resolve({}),
        refresh: () => Promise.resolve({}),
      };
    }

    return await client.discovery(
      new URL(process.env.ISSUER_URL!),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  if (IS_DEV) {
    console.log("DEV MODE: Using MemoryStore session");

    return session({
      secret: process.env.SESSION_SECRET || "local-dev-secret",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStore({
        checkPeriod: 86400000,
      }),
      cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    });
  }

  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens?.claims ? tokens.claims() : { sub: "dev-user" };
  user.access_token = tokens?.access_token || "dev-token";
  user.refresh_token = tokens?.refresh_token || "dev-refresh";
  user.expires_at = user.claims?.exp || Math.floor(Date.now() / 1000) + 3600;
}

async function upsertUser(claims: any) {
  if (IS_DEV) {
    console.log("DEV MODE: Skipping user upsert");
    return;
  }

  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // -----------------------------
  // DEV MODE: simple local login
  // -----------------------------
  if (IS_DEV) {
    console.log("DEV MODE: Simple mock login enabled");

    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));

    app.get("/api/login", (req, res) => {
      const mockUser = {
        claims: {
          sub: "dev-user",
          email: "user@example.com",
          first_name: "Local",
          last_name: "User",
        },
        access_token: "dev-token",
        refresh_token: "dev-refresh",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        isAdmin: false,
      };

      req.login(mockUser, () => res.redirect("/dashboard"));
    });

    app.get("/api/login-admin", (req, res) => {
      const adminUser = {
        claims: {
          sub: "dev-admin",
          email: "admin@example.com",
          first_name: "Admin",
          last_name: "User",
        },
        access_token: "dev-token",
        refresh_token: "dev-refresh",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        isAdmin: true,
      };

      req.login(adminUser, () => res.redirect("/admin"));
    });

    app.get("/api/logout", (req, res) => {
      req.logout(() => res.redirect("/"));
    });

    return; // skip real OIDC
  }

  // -----------------------------
  // PROD MODE: real OIDC flow
  // -----------------------------

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  const registered = new Set<string>();

  const ensureStrategy = (domain: string) => {
    const name = `auth:${domain}`;

    if (!registered.has(name)) {
      passport.use(
        new Strategy(
          {
            name,
            config,
            scope: "openid email profile offline_access",
            callbackURL: `https://${domain}/api/callback`,
          },
          verify
        )
      );
      registered.add(name);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`auth:${req.hostname}`)(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`auth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

// Middleware
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (IS_DEV) return next();

  const user = req.user as any;

  if (!req.isAuthenticated() || !user?.expires_at)
    return res.status(401).json({ message: "Unauthorized" });

  if (Date.now() / 1000 <= user.expires_at) return next();

  if (!user.refresh_token)
    return res.status(401).json({ message: "Unauthorized" });

  client
    .refreshTokenGrant(getOidcConfig(), user.refresh_token)
    .then((tokenResponse) => {
      updateUserSession(user, tokenResponse);
      next();
    })
    .catch(() => res.status(401).json({ message: "Unauthorized" }));
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  if (IS_DEV) {
    if (req.user) (req.user as any).isAdmin = true;
    return next();
  }

  const user = req.user as any;
  const dbUser = await storage.getUser(user.claims.sub);

  if (!dbUser?.isAdmin)
    return res.status(403).json({ message: "Forbidden: Admin access required" });

  next();
};


