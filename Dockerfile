# syntax=docker/dockerfile:1
# Orrery - Next.js standalone. Content (orrery-content submodule) is baked in at
# build so the SSG pages have canon to render; bump the submodule to ship new content.

FROM node:26-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:26-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Supabase connection. NEXT_PUBLIC_* values are inlined into the client bundle
# at build time, so they must be present HERE - setting them at runtime does
# nothing. Both are public by design (the anon key is shipped to browsers and
# is safe to expose; RLS is what protects the data). Omit them and the image
# still builds: the museum works and account features hide themselves.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
# The git SHA this image was built from, served statically at /revision.txt so a
# deploy-drift check can ask the running site "which commit are you?" and compare
# it to main. A content bump is itself an app commit (the submodule pin moves),
# so this one value covers both app and content drift. `unknown` on a local
# build that passes no build-arg.
ARG REVISION=unknown
RUN echo "$REVISION" > public/revision.txt
RUN npm run build

FROM node:26-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000/ >/dev/null 2>&1 || exit 1
CMD ["node", "server.js"]
