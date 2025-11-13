#!/bin/bash
set -e

source script/variables.sh

echo "\nBuilding Snowstream"
cd expo/android
mkdir -p build-out

function build_variant() {
    variant_name=$1     # "mobile" or "tv"
    use_tv=$2           # 0 or 1
    build_cmd=$3        # assembleRelease or bundleRelease
    out_ext=$4          # apk or aab

    export EXPO_TV=$use_tv

    echo "\n=== Building $variant_name ($build_cmd) ==="
    ./gradlew $build_cmd

    if [ "$out_ext" = "apk" ]; then
        cp app/build/outputs/apk/release/app-release.apk "build-out/snowstream-$variant_name.apk"
    else
        cp app/build/outputs/bundle/release/app-release.aab "build-out/snowstream-$variant_name.aab"
    fi

    echo "\n=== Extracting sourcemaps for $variant_name ==="
    BUNDLE=app/build/intermediates/assets/release/mergeReleaseAssets/index.android.bundle
    MAP=app/build/generated/sourcemaps/react/release/index.android.bundle.map

    cp "$BUNDLE" "build-out/$variant_name-index.android.bundle"
    cp "$MAP"    "build-out/$variant_name-index.android.bundle.map"

    echo -e "\n=== Uploading sourcemaps via sentry-cli to Bugsink ==="

    npx @sentry/cli \
    --url "$BUGSINK_URL" \
    sourcemaps \
        --org "$SENTRY_ORG" \
        --project "$SENTRY_PROJECT" \
        upload \
        --bundle "build-out/$variant_name-index.android.bundle" \
        --bundle-sourcemap "build-out/$variant_name-index.android.bundle.map" \
        --no-sourcemap-reference


}

if [ -z "$1" ]; then
    build_variant mobile 0 assembleRelease apk
    build_variant tv 1 assembleRelease apk
else
    build_variant tv 1 bundleRelease aab
fi

echo "\nDone. Release: $SENTRY_RELEASE  Dist: $SENTRY_DIST"
