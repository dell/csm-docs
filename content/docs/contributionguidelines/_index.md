---
title: "Contribution Guidelines"
linkTitle: "Contribution Guidelines"
weight: 12
Description: >
  Dell EMC Container Storage Modules (CSM) docs Contribution Guidelines
---


CSM Docs is an open source project and  we thrive to build a welcoming and open community for anyone who wants to use the project or contribute to it.

### Contributing to CSM Docs

Become one of the contributors to this project! 

You can contribute to this project in several ways. Here are some examples:

* Contribute to the CSM documentation.
* Report an issue.
* Feature requests.

CSM docs resides in <https://github.com/dell/csm-docs>. 

CSM project resides in <https://github.com/dell/csm>.

#### Don't

* Break the website view.
* Commit directly.
* Compromise backward compatibility.
* Disrespect your Community Team members. 
* Forget to keep thing simple.

#### Do

* Keep it simple.
* Good work, your best every time.
* Squash your commits, avoid merges.
* Keep an open communication with other Committers.
* Ask questions.
* Test your changes locally and make sure it is not breaking anything.

### Code reviews

All submissions, including submissions by project members, require review. 
We use GitHub pull requests for this purpose. 

### Branching strategy

CSM documentation portal follows a scaled trunk branching strategy where short-lived branches are created off of the main branch. When coding is complete, the branch is merged back into main after being approved in a pull request code review.

#### Branch Naming Convention

|  Branch Type |  Example                          |  Comment                                  |
|--------------|-----------------------------------|-------------------------------------------|
|  main        |  main                             |                                           |
|  Release     |  release-1.0                      |  hotfix: release-1.1 patch: release-1.0.1 |
|  Feature     |  feature-9-olp-support            |  "9" referring to GitHub issue ID         |
|  Bug Fix     |  bugfix-110-remove-docker-compose |  "110" referring to GitHub issue ID       |

> Feature branch will always be merged to the release branch . Bug Fix can be merged to either main or release branch.

#### Steps for working on a main branch

1. Fork the repository.
2. Create a branch off of the main branch. The branch name should follow [branch naming convention](#branch-naming-convention).
3. Make your changes and commit them to your branch.
4. If other code changes have merged into the upstream main branch, perform a rebase of those changes into your branch.
5. Test your changes [locally](#previewing-your-changes)
6. Open a [pull request](https://github.com/dell/csm/pulls) between your branch and the upstream main branch.
7. Once your pull request has merged with the required approvals, your branch can be deleted.

#### Steps for working on a release branch

1. Fork the repository.
2. Create a branch off of the release branch. The branch name should follow [branch naming convention](#branch-naming-convention).
3. Make your changes and commit them to your branch.
4. If other code changes have merged into the upstream release branch, perform a rebase of those changes into your branch.
5. Test your changes [locally](#previewing-your-changes)
6. Open a [pull request](https://github.com/dell/csm/pulls) between your branch and the upstream release branch.
7. Once your pull request has merged with the required approvals, your branch can be deleted.

### Previewing your changes
- Install [latest Hugo version extended version](https://github.com/gohugoio/hugo/releases). 
    > Note: Please note we have to  install extended version.
- Create a local copy of csm-docs repository using `git clone`. 
- Update docsy submodules inside themes folder using `git submodule update --recursive --init`
- Change to csm-docs folder and run 
    ```
    hugo server 
    ```    
    By default local changes will be reflected at http://localhost:1313/. Hugo will watch for changes to the content and automatically refreshes the site.
  > Note: To bind it to different server address use `hugo server --bind 0.0.0.0`, default is 127.0.0.1
- After testing the changes locally, raise a pull request after editing the pages and pushing it to github. 

### Community guidelines

This project follows https://github.com/dell/csm/blob/main/docs/CODE_OF_CONDUCT.md.
