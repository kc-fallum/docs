#!/bin/bash
set -e

echo "Building JavaDoc for Minecraft Plugins..."
cd ../game/plugins/bridge

echo "Running javadoc for kcfallum-api..."
./gradlew :kcfallum-api:javadoc

echo "Running javadoc for kcfallum-bridge..."
./gradlew :kcfallum-bridge:javadoc || true

echo "Running javadoc for kcfallum-lobby..."
./gradlew :kcfallum-lobby:javadoc || true

echo "Copying JavaDoc to Docusaurus static folder..."
cd ../../../docs
mkdir -p static/javadoc/kcfallum-api
cp -r ../game/plugins/bridge/kcfallum-api/build/docs/javadoc/* static/javadoc/kcfallum-api/ || true

mkdir -p static/javadoc/kcfallum-bridge
cp -r ../game/plugins/bridge/kcfallum-bridge/build/docs/javadoc/* static/javadoc/kcfallum-bridge/ || true

mkdir -p static/javadoc/kcfallum-lobby
cp -r ../game/plugins/bridge/kcfallum-lobby/build/docs/javadoc/* static/javadoc/kcfallum-lobby/ || true

echo "JavaDoc build complete!"
