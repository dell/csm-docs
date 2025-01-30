#!/bin/bash

# Determine the directory of the script
script_dir=$(dirname "$(readlink -f "$0")")
echo "Script directory: $script_dir"

# Define the target directory
target_dir=$(realpath "$script_dir/../../..")
echo "Target directory: $target_dir"

# Run codespell and capture output, targeting the test-csm-docs directory
output=$(find "$target_dir" -type f -name "*.md" -exec codespell \
  --ignore-words="$script_dir/codespell.txt" --builtin clear,rare,informal \
  --write-changes --quiet-level=0 {} +)

# Print each line of the output separately for readability
echo "Codespell Output:"
echo "$output" | while IFS= read -r line; do
  echo "$line"
done

# Process the output and apply the first suggestion
echo "Processing changes..."
echo "$output" | while IFS= read -r line; do
  if [[ $line == *" ==>"* ]]; then
    # Extract file, line number, original word, and suggestion
    file=$(echo "$line" | cut -d':' -f1)
    error_line=$(echo "$line" | cut -d':' -f2)
    original=$(echo "$line" | awk '{print $2}')
    suggestion=$(echo "$line" | awk -F'[ ]+==> ' '{print $2}' | cut -d',' -f1)

    # Ensure the file is inside the test-csm-docs directory
    if [[ $file == $target_dir/* ]]; then
      # Apply the first suggestion
      if [ -n "$suggestion" ] && [ -f "$file" ]; then
        sed -i "${error_line}s/\b$original\b/$suggestion/" "$file"
        echo "Fixed $original to $suggestion in $file on line $error_line"
      fi
    else
      echo "Skipping file not in target directory: $file"
    fi
  fi
done