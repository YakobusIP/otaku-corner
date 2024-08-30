#!/bin/bash

# Navigate to the frontend directory and run yarn dev in a new terminal window
cd frontend || { echo "Failed to navigate to frontend"; exit 1; }
start bash -c "yarn dev; exec bash"

# Navigate to the backend directory and run yarn dev in the current terminal
cd ../backend || { echo "Failed to navigate to backend"; exit 1; }
yarn dev