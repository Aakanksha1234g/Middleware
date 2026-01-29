Commmand to check what is in the access token:

echo "YOUR_ACCESS_TOKEN" | cut -d'.' -f2 | base64 -d | jq .
