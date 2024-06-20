# Use an lts-supported version similar to the application image.
# checkov:skip=CKV_DOCKER_2: Ensure that HEALTHCHECK instructions have been added to container images
FROM node:lts-slim as test

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

ARG BUILD_DEPS="\
    curl \
    unzip \
    openjdk-17-jre"
# Chrome dependencies - https://source.chromium.org/chromium/chromium/src/+/main:chrome/installer/linux/debian/dist_package_versions.json;l=74
ARG CHROME_DEPS="\
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    xdg-utils"
RUN apt-get update \
    && apt-get install -y --no-install-recommends --no-upgrade $BUILD_DEPS $CHROME_DEPS \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && java -version

RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && rm -f awscliv2.zip \
    && ./aws/install --bin-dir /usr/local/bin --install-dir /usr/local/aws-cli --update \
    && aws --version

ENV PUPPETEER_CACHE_DIR="/app/.cache/puppeteer"
COPY package.json .
RUN npm install

COPY --chmod=005 run-tests.sh /run-tests.sh

# Copy the test runner code, see tests.Dockerfile.dockerignore for exclusions
COPY --chown=node:node . .

USER node
ENTRYPOINT ["/run-tests.sh"]
