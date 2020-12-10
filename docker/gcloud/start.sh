#!/bin/sh

gcloud config set project ${DATASTORE_PROJECT_ID}

gcloud beta emulators datastore start \
  --data-dir=/opt/data \
  --host-port=${DATASTORE_LISTEN_ADDRESS} \
  ${options}