FROM --platform=linux/amd64 node:24-alpine

WORKDIR /app
RUN npm install --no-audit --no-fund --ignore-scripts \
  @aws-sdk/client-sqs@3.1018.0 tsx@4.20.6
COPY src ./src

ENV NODE_ENV=production
CMD ["./node_modules/.bin/tsx", "src/index.ts"]
