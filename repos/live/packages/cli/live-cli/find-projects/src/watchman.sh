watchman -j json5 <<-EOT
[
  "query",
  ".",
  {
    "since": 0,
    "expression": [
     "allof",
     ["match", "**/package.json", "wholename"],
     ["not", ["match", "**/node_modules/**", "wholename"]]
   ],
    "fields": [
      "name",
      "exists",
      "mtime_ms",
      "size",
      "content.sha1hex"
    ]
  }
]
EOT
