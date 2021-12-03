APPNAME=$1
VERSION=$2
DIRNAME=./temp/releases
GITHUB_USERNAME=$3

# Create tar file
tar -czf $DIRNAME/$APPNAME/$VERSION/$APPNAME.tar.gz -C $DIRNAME/$APPNAME/$VERSION $APPNAME

# Create signature and save to file
SIGNATURE=$(openssl dgst -sha512 -sign ~/.nextcloud/certificates/$APPNAME.key $DIRNAME/$APPNAME/$VERSION/$APPNAME.tar.gz | openssl base64)
# 🔏  The signature for submitting the app is now stored."
URL="https://github.com/$GITHUB_USERNAME/nextcloud-app-releases/raw/main/$APPNAME/$VERSION/$APPNAME.tar.gz"
# 🌍  The release URL for this release is composed."
echo '{"downloadUrl": "'$URL'", "signatureBase64": "'$SIGNATURE'"}' > ./releaseconfig.json
# 🎉  Done. We're no pushing and submitting the release!"

# Commit and push to releases git
cd $DIRNAME
git add .
git commit -m "Add release $VERSION of app $APPNAME."
git push origin main
echo "Pushed."