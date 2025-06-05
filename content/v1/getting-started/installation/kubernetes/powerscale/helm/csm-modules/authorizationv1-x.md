---
title: Authorization v1.x
linktitle: "Authorization v1.x"
weight: 1
description: >
  DContainer Storage Modules (CSM) for Authorization Operator deployment
---  


{{<include file="content/v1/getting-started/installation/helm/modules/authorizationv1-x.md">}}


<script> 
document.addEventListener("DOMContentLoaded", function() {
  const content = document.querySelector(".td-content"); // Adjust the selector based on your theme
  const tocContainer = document.getElementById("TableOfContent");
  if (!content || !tocContainer) return;

  const headings = content.querySelectorAll("h2, h3, h4, h5, h6");
  if (headings.length === 0) return;

  const tocList = document.createElement("ul");

  headings.forEach(heading => {
    const id = heading.id || heading.textContent.trim().toLowerCase().replace(/\s+/g, "-");
    heading.id = id;

    const tocItem = document.createElement("li");
    const tocLink = document.createElement("a");
    tocLink.href = `#${id}`;
    tocLink.textContent = heading.textContent;

    tocItem.appendChild(tocLink);
    tocList.appendChild(tocItem);
  });

  tocContainer.appendChild(tocList);
});

</script> 
