#!/bin/bash

# Test example-basic
echo 'Testing example-basic with cypress ...'
start-server-and-test 'yarn workspace example-basic gatsby build && yarn workspace example-basic gatsby serve --port=9091' http://localhost:9091 'cypress run --spec "**/*/example-basic.spec.js"'

# Test example-micro-frontends
echo 'Testing example-micro-frontends with cypress ...'
start-server-and-test 'yarn workspace @micro-app/root-app gatsby build && yarn workspace @micro-app/root-app gatsby serve --port=9092' http://localhost:9092 'cypress run --spec "**/*/example-micro-frontends.spec.js"'
