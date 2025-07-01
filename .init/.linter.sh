#!/bin/bash
cd /home/kavia/workspace/code-generation/contentmaster-pro-118042-bd4db39f/frontend_dashboard
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

