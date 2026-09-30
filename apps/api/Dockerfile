FROM --platform=linux/amd64 node:24-alpine

WORKDIR /app
RUN npm install --no-audit --no-fund --ignore-scripts \
  fastify@5.12.5 pg@8.23.0 tsx@4.20.6
COPY src ./src

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["./node_modules/.bin/tsx", "src/server.ts"]
