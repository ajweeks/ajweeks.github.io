
echo Building...
call bundle exec jekyll build

echo Clearing docs/
rmdir docs/

echo Copying to docs/
xcopy /sy _site docs\
