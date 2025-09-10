# Use a slim lts-supported version.
FROM node:lts-alpine@sha256:d2166de198f26e17e5a442f537754dd616ab069c47cc57b889310a717e0abbf9 as production

# Expose any necessary ports (if your application requires it)
ARG PORT=3000
ENV PORT=$PORT
EXPOSE $PORT

# Set the working directory in the container
WORKDIR /app

# Copy the application code, see .dockerignore for exclusions
COPY . .

# Install project dependencies
WORKDIR /app/express
RUN npm ci --include-workspace-root \
    && npm run build && npm ci --omit=dev

# Add the Dynatrace OneAgent
COPY --from=khw46367.live.dynatrace.com/linux/oneagent-codemodules-musl:nodejs / /
ENV LD_PRELOAD /opt/dynatrace/oneagent/agent/lib64/liboneagentproc.so

USER node
CMD STUB_API=${STUB_API:-false} npm start

HEALTHCHECK CMD wget --spider http://localhost:$PORT
