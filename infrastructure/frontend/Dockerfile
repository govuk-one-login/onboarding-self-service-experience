FROM node:current-alpine

ARG PORT=3000
ENV PORT=$PORT
EXPOSE $PORT

WORKDIR /self-service
COPY package*.json ./

WORKDIR /self-service/express
COPY express/package*.json ./
RUN npm install --include-workspace-root --omit=dev

COPY express/dist dist
COPY express/stubs stubs
COPY express/resources resources
COPY express/src/views src/views
COPY express/assets/images assets/images
COPY --from=khw46367.live.dynatrace.com/linux/oneagent-codemodules:nodejs / /
ENV LD_PRELOAD /opt/dynatrace/oneagent/agent/lib64/liboneagentproc.so

USER node
CMD STUB_API=${STUB_API:-false} npm start

HEALTHCHECK CMD wget --spider http://localhost:$PORT
