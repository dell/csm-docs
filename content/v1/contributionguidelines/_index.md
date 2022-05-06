---
title: "Contribution Guidelines"
linkTitle: "Contribution Guidelines"
weight: 12
Description: >
  Dell Technologies (Dell) Container Storage Modules (CSM) docs Contribution Guidelines
---


CSM Docs is an open-source project and we thrive to build a welcoming and open community for anyone who wants to use the project or contribute to it.

### Contributing to CSM Docs

Become one of the contributors to this project! 

You can contribute to this project in several ways. Here are some examples:

* Contribute to the CSM documentation.
* Report an issue.
* Feature requests.

CSM docs reside in <https://github.com/dell/csm-docs>. 

CSM project resides in <https://github.com/dell/csm>.

#### Don't

* Break the website view.
* Commit directly.
* Compromise backward compatibility.
* Disrespect your Community Team members. 
* Forget to keep things simple.

#### Do

* Keep it simple.
* Good work, your best every time.
* Squash your commits, avoid merges.
* Keep open communication with other Committers.
* Ask questions.
* Test your changes locally and make sure it is not breaking anything.

### Code reviews

All submissions, including submissions by project members, require review. 
We use GitHub pull requests for this purpose. 

### Branching strategy

The CSM documentation portal follows a release branch strategy where a branch is created for each release and all documentation changes made for a release are done on that branch. The release branch is then merged into the main branch at the time of the release. In some situations it may be sufficient to merge a non-release branch to main if it fixes some issue in the documentation for the current released version.

#### Branch Naming Convention

|  Branch Type |  Example                          |  Comment                                  |
|--------------|-----------------------------------|-------------------------------------------|
|  main        |  main                             |                                           |
|  Release     |  release-1.0                      |  hotfix: release-1.1 patch: release-1.0.1 |
|  Feature     |  feature-9-olp-support            |  "9" referring to GitHub issue ID         |
|  Bug Fix     |  bugfix-110-remove-docker-compose |  "110" referring to GitHub issue ID       |

#### Steps for working on the main branch

1. Fork the repository.
2. Create a branch off of the main branch. The branch name should follow [branch naming convention](#branch-naming-convention).
3. Make your changes and commit them to your branch.
4. If other code changes have merged into the upstream main branch, perform a rebase of those changes into your branch.
5. Test your changes [locally](#previewing-your-changes)
6. Open a [pull request](https://github.com/dell/csm-docs/pulls) between your branch and the upstream main branch.
7. Once your pull request has merged with the required approvals, your branch can be deleted.

#### Steps for working on a release branch

1. Fork the repository.
2. Create a branch off of the release branch. The branch name should follow [branch naming convention](#branch-naming-convention).
3. Make your changes and commit them to your branch.
4. If other code changes have merged into the upstream release branch, perform a rebase of those changes into your branch.
5. Test your changes [locally](#previewing-your-changes)
6. Open a [pull request](https://github.com/dell/csm-docs/pulls) between your branch and the upstream release branch.
7. Once your pull request has merged with the required approvals, your branch can be deleted.

### Previewing your changes
- Install [latest Hugo version extended version](https://github.com/gohugoio/hugo/releases). 
    > Note: Please note we have to install an extended version.
- Create a local copy of the csm-docs repository using `git clone`. 
- Update docsy submodules inside themes folder using `git submodule update --recursive --init`
- Change to the csm-docs folder and run 
    ```
    hugo server 
    ```    
    By default, local changes will be reflected at http://localhost:1313/. Hugo will watch for changes to the content and automatically refreshes the site.
  > Note: To bind it to different server address use `hugo server --bind 0.0.0.0`, default is 127.0.0.1
- After testing the changes locally, raise a pull request after editing the pages and pushing it to GitHub. 

### Community guidelines

This project follows https://github.com/dell/csm/blob/main/docs/CODE_OF_CONDUCT.md.

### Best Practices

#### Linking the URLs

Hardcoded relative links like `[troubleshooting observability](../../observability/troubleshooting.md)` will behave unexpectedly compared to how they would work on our local file system. 
To avoid broken links in the portal, use regular relative URLs in links that will be left unchanged by Hugo.

#### Style guide

- Use sentence case wherever applicable.
- Use the numbered lists for items in sequential order and bulletins for the other lists.
- Check for grammar and spelling.
- Embed the code within backticks. 
- Use only high-resolution images.

