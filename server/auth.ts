// Authentication implementation
// Modified for local development
import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import memorystore from "memorystore";

// Use memory store for development
const MemoryStore = memorystore(session);

const getOidcConfig = memoize(
  async () => {
    // In development, return a mock config
    if (process.env.NODE_ENV === 'development') {
      return {
        issuer: 'https://auth.example.com/oidc',
        // Mock functions
        userinfo: () => Promise.resolve({}),
        refresh: () => Promise.resolve({}),
      };
    }
    
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://auth.example.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  // In development, use memory store
  if (process.env.NODE_ENV === 'development') {
    return session({
      secret: process.env.SESSION_SECRET || 'local-dev-secret',
      resave: false,
      saveUninitialized: false,
      store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
      cookie: {
        httpOnly: true,
        secure: false, // false for development
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      },
    });
  }
  
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
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
  user.claims = tokens?.claims ? tokens.claims() : { sub: 'local-dev-user' };
  user.access_token = tokens?.access_token || 'local-dev-token';
  user.refresh_token = tokens?.refresh_token || 'local-dev-refresh';
  user.expires_at = user.claims?.exp || Math.floor(Date.now() / 1000) + 3600;
}

async function upsertUser(
  claims: any,
) {
  // In development, skip database operations if not available
  if (process.env.NODE_ENV === 'development') {
    console.log('Skipping user upsert in development');
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

  // In development, skip OIDC setup
  if (process.env.NODE_ENV === 'development') {
    // Setup a simple local strategy for development
    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));
    
    // Add a simple login route for development
    app.get("/api/login", (req, res) => {
      // Create a mock user for development with admin access
      const mockUser = {
        claims: { sub: 'local-dev-user', email: 'admin@example.com', first_name: 'Admin', last_name: 'User' },
        access_token: 'local-dev-token',
        refresh_token: 'local-dev-refresh',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      };
      
      req.login(mockUser, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Login failed' });
        }
        res.redirect('/dashboard');
      });
    });
    
    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        res.redirect('/');
      });
    });
    
    return;
  }

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Keep track of registered strategies
  const registeredStrategies = new Set<string>();

  // Helper function to ensure strategy exists for a domain
  const ensureStrategy = (domain: string) => {
    const strategyName = `auth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`auth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
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

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // In development, allow all requests
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

// Middleware to check if user is admin
export const isAdmin: RequestHandler = async (req, res, next) => {
  // In development, allow all requests to admin routes and grant admin access
  if (process.env.NODE_ENV === 'development') {
    // Add admin property to user in development mode
    if (req.user) {
      (req.user as any).isAdmin = true;
    }
    return next();
  }
  
  const user = req.user as any;
  if (!user?.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const dbUser = await storage.getUser(user.claims.sub);
  if (!dbUser?.isAdmin) {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }

  return next();
};