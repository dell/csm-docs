---
title: "Uninstallation"
linkTitle: "Uninstallation"
weight: 2
Description: >
  Uninstallation
---

## Cleanup Kubernetes Worker Hosts

Login to each worker host and perform these steps:

__Remove directory */root/.driver-sec*__

This directory was created when a CSI driver with Encryption first ran on the host.

__Remove entry from */root/.ssh/authorized_keys*__

This is an entry added when a CSI driver with Encryption first ran on the host.
It ends with `driver-sec`, similarly to:

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDGvSWmTL7NORRDPAvtbMbvoHUBLnen9bRtJePbGk1boJ4XK39Qdvo2zFHZ/6t2+dSL7xKo2kcxX3ovj3RyOPuqNCob
5CLYyuIqduooy+eSP8S1i0FbiDHvH/52yHglnGkBb8g8fmoMolYGW7k35mKOEItKlXruP5/hpP0rBDfBfrxe/K4aHicxv6GylP+uTSBjdj7bZrdgRAIlmDyIdvU4oU6L
K9PDW5rufArlrZHaToHXLMbXbqswD08rgFt3tLiXjj2GgvU8ifWYYAeuijMp+hwwE0dYv45EgUNTlXUa7x2STFZrVn8MFkLKjtZ60Qjbb4JoijRpBQ5XEUkW9UoeGbV2
s+lCpZ2bMkmdda/0UC1ckvyrLkD0yQotb8gafizdX+WrQRE+iqUv/NQ2mrSEHtLgvuvgZ3myFU5chRv498YxglYZsAZUdCQI2hQt+7smjYMaM0V200UT741U9lIlYxza
ocI5t+n01dWeVOCSOH/Q3uXxHKnFvWVZh7m6583R9LfdGfwshsnx4CNz22kp69hzwBPxehR+U/VXkDUWnoQgI8NSPc0fFyU58yLHnl91XT9alz8qrkFK7oggKy5RRX7c
VQrpjsCPCu3fpVjvvwfspVOftbn/sNgY1J3lz0pdgvJ3yQs6pa+DODQyin5Rt//19rIGifPxi/Hk/k49Vw== driver-sec
```

It can be removed with `sed -i '/^ssh-rsa .* driver-sec$/d' /root/.ssh/authorized_keys`.

## Remove Kubernetes Resources

Remove [the resources](../deployment#secrets-and-config-maps) created in Kubernetes cluster for Encryption.

## Remove Vault Server Configuration

Remove [the configuration](../vault#minimum-server-configuration) created in the Vault server for Encryption.

## Remove Rekey Controller

Remove [the resources](../rekey#rekey-controller-installation) created during the installation of the Rekey Controller.
