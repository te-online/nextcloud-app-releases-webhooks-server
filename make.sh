APPNAME=$1
VERSION=$2
DIRNAME=./temp/releases

# Create tar file
tar -czf $DIRNAME/$APPNAME/v$VERSION/$APPNAME.tar.gz -C $DIRNAME/$APPNAME/v$VERSION $APPNAME

# Create signature and save to file
SIGNATURE=$(openssl dgst -sha512 -sign ~/.nextcloud/certificates/$APPNAME.key $DIRNAME/$APPNAME/v$VERSION/$APPNAME.tar.gz | openssl base64)
# 🔏  The signature for submitting the app is now stored."
URL="https://github.com/te-online/nextcloud-app-releases/raw/master/$APPNAME/v$VERSION/$APPNAME.tar.gz"
# 🌍  The release URL for this release is composed."
echo '{"downloadUrl": "'$URL'", "signatureBase64": "'$SIGNATURE'"}' > ./releaseconfig.json
# 🎉  Done. We're no pushing and submitting the release!"

# Commit and push to releases git
cd $DIRNAME
git add .
git commit -m "Add release $VERSION of app $APPNAME."
# git push origin master
echo "Pushed."