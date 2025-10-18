#!/bin/bash

# Sync playbooks from wishlist-playbooks repo to src/content/playbooks
# This script copies playbook.md files and adds appropriate frontmatter

PLAYBOOKS_REPO="src/content/playbooks-external"
PLAYBOOKS_DEST="src/content/playbooks"

echo "🔄 Syncing playbooks from ${PLAYBOOKS_REPO}..."

# Update the submodule first
git submodule update --remote --merge

# Find all playbook.md files in the external repo
find "$PLAYBOOKS_REPO" -name "playbook.md" -type f | while read -r playbook_file; do
    # Get the directory name (e.g., "project-and-community-governance")
    folder_name=$(basename "$(dirname "$playbook_file")")
    
    # Convert folder name to slug (e.g., "project-and-community-governance")
    slug="$folder_name"
    
    # Create a friendly title (e.g., "Project And Community Governance")
    title=$(echo "$folder_name" | tr '-' ' ' | sed 's/\b\(.\)/\u\1/g')
    
    # Read the content
    content=$(cat "$playbook_file")
    
    # Create the destination file with frontmatter
    dest_file="$PLAYBOOKS_DEST/${slug}.md"
    
    echo "  📝 Syncing: $title"
    
    # Write frontmatter + content
    cat > "$dest_file" << EOF
---
title: "$title"
description: "Practitioner playbook for $title"
service: "$(echo "$folder_name" | sed 's/project-and-community-//')"
github_folder: "$folder_name"
---

$content
EOF
done

echo "✅ Playbooks synced successfully!"
echo ""
echo "📌 Next steps:"
echo "   1. Review the synced playbooks in $PLAYBOOKS_DEST"
echo "   2. Update descriptions in frontmatter if needed"
echo "   3. Commit the changes"
