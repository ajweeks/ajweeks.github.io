
echo Building...
call bundle exec jekyll build

echo Clearing ajweeks.github.io...
pushd ../ajweeks.github.io/
git rm --cached -r * -f
popd

echo Copying to ajweeks.github.io...
xcopy /sy _site ..\ajweeks.github.io\
