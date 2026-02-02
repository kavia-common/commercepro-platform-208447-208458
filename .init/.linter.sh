#!/bin/bash
cd /home/kavia/workspace/code-generation/commercepro-platform-208447-208458/ecommerce_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

