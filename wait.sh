#!/bin/bash
echo "Waiting..."
while ! docker-compose logs router | grep -q "org.eclipse.jetty.server.Server - Started";
do
    sleep 7
    echo "working..."
done
tput setaf 2; echo "==========================="
echo "          READY"
echo "==========================="