#!/bin/bash

# Navigate to the public-app directory and run yarn dev in a new terminal window
cd public-app || { echo "Failed to navigate to public-app"; exit 1; }
start bash -c "yarn dev; exec bash"

# Navigate to the admin-app directory and run yarn dev in a new terminal window
cd ../admin-app || { echo "Failed to navigate to admin-app"; exit 1; }
start bash -c "yarn dev; exec bash"

# Navigate to the backend directory and run yarn dev in the current terminal
cd ../backend || { echo "Failed to navigate to backend"; exit 1; }
yarn dev
