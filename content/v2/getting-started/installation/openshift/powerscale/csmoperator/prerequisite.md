---
title: "Prerequisite"
linkTitle: "Prerequisite"
weight: 1
Description: >
toc_hide: true
--- 


1. **Make sure the nfs is enabled in the powerscale**

    ```terminal
    ps01-1# isi nfs settings global view
    NFS Service Enabled: Yes
        NFSv3 Enabled: Yes
        NFSv4 Enabled: Yes
                v4.0 Enabled: Yes
                v4.1 Enabled: Yes
                v4.2 Enabled: Yes
    NFS RDMA Enabled: No
        Rquota Enabled: No   

    ``` 
    <br>

2. **Create Group and User for CSM**  

    ```bash
    isi auth group create csmadmins --zone system
    isi auth user create csmadmin --password "P@ssw0rd123" --password-expires false --primary-group csmadmins --zone system
    ``` 

3. **Create role and assign the required permission** 

    ```bash
    isi auth roles create CSMAdminRole --description "Dell CSM Admin Role"  --zone System
    isi auth roles modify CSMAdminRole --zone System --add-priv-read ISI_PRIV_LOGIN_PAPI --add-priv-read ISI_PRIV_IFS_RESTORE --add-priv-read ISI_PRIV_NS_IFS_ACCESS  --add-priv-read ISI_PRIV_IFS_BACKUP --add-priv-read ISI_PRIV_AUTH --add-priv-read ISI_PRIV_AUTH_ZONES --add-priv-read  ISI_PRIV_STATISTICS
    isi auth roles modify CSMAdminRole --zone System --add-priv-write ISI_PRIV_NFS --add-priv-write ISI_PRIV_QUOTA --add-priv-write ISI_PRIV_SNAPSHOT --add-priv-write ISI_PRIV_SYNCIQ
    isi auth roles modify CSMAdminRole --add-group csmadmins

    ```

4. **Get PowerScale Array Details** 

   a. Cluster Name: 
   
      ``` 
      ps01-1# isi cluster identity view
      Description: 
          MOTD: 
      MOTD Header: 
          Name: ps01 
      ``` 

   b. Access Zone Name:

      ```
      ps01-1# isi zone zones list
      Name      Path               
      -----------------------------
      System    /ifs               
      ps01-az01 /ifs/data/ps01/az01
      -----------------------------
      Total: 2 
      ```

   c. Smart Connect Zone name  

      ```
      ps01-1# isi network pools list
      ID                                SC Zone               IP Ranges                   Allocation Method 
      ------------------------------------------------------------------------------------------------------
      groupnet0.subnet0.ps01-az01-pool0 ps01-az01.example.com 10.181.98.225-10.181.98.227 static            
      groupnet0.subnet0.system-pool0    ps01.example.com      10.181.98.222-10.181.98.224 static            
      ------------------------------------------------------------------------------------------------------
      Total: 2  
      ```

<br> 

5. **Create the base directory for the storage class** 
    
   ```bash 
   mkdir /ifs/data/ps01/az01/csi
   chown csmadmin:csmadmins /ifs/data/ps01/az01/csi
   chmod 755 /ifs/data/ps01/az01/csi

   ```
<br> 

6. Make sure all the parent directory of the base path has permission 755 

<br>

7. **(optional) Create quota on the base directory** 

   ```bash 
   isi quota quotas create /ifs/data/ps01/az01/csi directory --percent-advisory-threshold 80 --percent-soft-threshold 90 --soft-grace 1D --hard-threshold 100G --include-snapshots true
   ``` 
