---
title: "Release Notes"
linkTitle: "Release Notes"
weight: 5
Description: >
  Release Notes
---

## Release Notes - CSM Application Mobility v1.0.2

### New Features/Changes

Adds support for object stores using https

### Fixed Issues

- Fixed backup sync issue where it was deleting all the backups, when it sees more than one BSLs
- Fixed the issue in the backup path where podvolumebackup objects were not created for volumes belonging to pods with the same name across namespace.
- Fixed the issue in the restore plugin.


### Known Issues

There are no known issues in this release.
