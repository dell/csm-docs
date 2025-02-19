---
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

2. **Create role and assign the required permission** 

    ```bash
    isi auth roles create CSMAdminRole --description "Dell CSM Admin Role"  --zone System
    isi auth roles modify CSMAdminRole --zone System --add-priv-read ISI_PRIV_LOGIN_PAPI --add-priv-read ISI_PRIV_IFS_RESTORE --add-priv-read ISI_PRIV_NS_IFS_ACCESS --add-priv-read ISI_PRIV_IFS_BACKUP
    isi auth roles modify CSMAdminRole --zone System --add-priv-write ISI_PRIV_NFS --add-priv-write ISI_PRIV_QUOTA --add-priv-write ISI_PRIV_SNAPSHOT --add-priv-write ISI_PRIV_SYNCIQ
    ```

3. **Create a user and add the role**  

    ```bash
    isi auth user create csmadmin --password "P@ssw0rd123"
    isi auth roles modify CSMAdminRole --add-user csmadmin 
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
      groupnet0.subnet0.ps01-az01-pool0 ps01-az01.vdi.xtremio 10.181.98.225-10.181.98.227 static            
      groupnet0.subnet0.system-pool0    ps01.vdi.xtremio      10.181.98.222-10.181.98.224 static            
      ------------------------------------------------------------------------------------------------------
      Total: 2  
      ```

5. 