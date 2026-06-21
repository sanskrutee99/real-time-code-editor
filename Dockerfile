# Use a standard Debian-based Node.js LTS image
FROM node:20-bookworm

# Install runtimes/compilers: Python 3, G++ (for C++), and OpenJDK (for Java)
RUN apt-get update && apt-get install -y \
    python3 \
    g++ \
    default-jdk \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy root and frontend package manifests first to leverage Docker layer caching
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install server and client dependencies
RUN npm install && cd frontend && npm install

# Copy all project source code
COPY . .

# Precompile the stdc++.h header to make C++ compilation fast inside the container
RUN g++ -O2 -I/usr/src/app/backend/include /usr/src/app/backend/include/bits/stdc++.h -o /usr/src/app/backend/include/bits/stdc++.h.gch

# Build the React frontend production assets
RUN npm run build

# Expose the Express server port
EXPOSE 3000

# Start the application server
CMD [ "npm", "start" ]
