APP="cadeia-produtiva"
echo "Synchronizing database..."
curl https://terrakrya.s3.us-west-002.backblazeb2.com/$APP/dumps/$APP-latest.zip --output $APP-latest.zip
mongorestore --archive=$APP-latest.zip --gzip --db $APP --drop
rm $APP-latest.zip
echo "Sync finished with success \o/"
