SOURCE_REPOSITORY_URL=$1
APPNAME=$2
VERSION=$3
GITHUB_USERNAME=$4
GITHUB_TOKEN=$5
RELEASES_DIR=./temp/releases
SOURCE_DIR=./temp/source

# Create temp folder
mkdir -p ./temp
# Git clone the repository at the release position to temp location
git clone $SOURCE_REPOSITORY_URL $SOURCE_DIR
# Check out specific version
git checkout tags/v$VERSION
# Git clone the app-releases-repository to different location
git clone https://$GITHUB_USERNAME:$GITHUB_TOKEN@github.com/te-online/nextcloud-app-releases.git $RELEASES_DIR
# Rsync from temp location to releases repository, while using app_name and release_name
# and considering .deployignore file.
rsync -avrP --filter=":- $SOURCE_DIR/.deployignore" $SOURCE_DIR/ $RELEASES_DIR/$APPNAME/v$VERSION/$APPNAME/