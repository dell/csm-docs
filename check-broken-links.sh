#!/bin/bash

echo "🔍 Running wget spider on your Hugo site..."

# Spider mode with referrer info
wget --spider --verbose -o spider.log -e robots=off -rp --debug http://127.0.0.1:1313/csm-docs/

echo "🧹 Cleaning known false positives..."
sed -i '/http:\/\/127.0.0.1:1313\/favicons\/favicon.ico/d' spider.log
sed -i '/http:\/\/127.0.0.1:1313\/css\/prism.css/d' spider.log

echo "📄 Extracting broken links with source pages..."

awk '
# Lines like: --2025-04-15 10:01:23--  http://127.0.0.1:1313/foo/
$1 ~ /^--[0-9]{4}-[0-9]{2}-[0-9]{2}/ && $3 ~ /^http/ { current_url=$3 }

/^Referer:/ { referrer=$2 }

/broken link/ {
    print "❌ Broken: " current_url
    if (referrer) {
        print "🔗 Source: " referrer
    } else {
        print "🔗 Source: (none)"
    }
    print ""
}' spider.log > broken_links

echo "📊 Results:"
cat broken_links

count=$(grep -c '❌ Broken' broken_links)
echo "Total broken links: $count"

if [ "$count" -ne 0 ]; then
  echo "❌ Broken links found!"
  exit 1
else
  echo "✅ No broken links!"
  exit 0
fi
