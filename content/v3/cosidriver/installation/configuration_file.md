---
title: Configuration File
linktitle: Configuration File
weight: 1
Description: Description of configuration file for ObjectScale
---

> **Notational Conventions**
>
> The keywords "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in [RFC 2119](http://tools.ietf.org/html/rfc2119) (Bradner, S., "Key words for use in RFCs to Indicate Requirement Levels", BCP 14, RFC 2119, March 1997).

## Dell COSI Driver Configuration Schema

This configuration file is used to specify the settings for the Dell COSI Driver, which is responsible for managing connections to the Dell ObjectScale platform. The configuration file is written in YAML format and based on the JSON schema and adheres to its specification.

YAML files can have comments, which are lines in the file that begin with the `#` character. Comments can be used to provide context and explanations for the data in the file, and they are ignored by parsers when reading the YAML data.

## Configuration file example

```yaml
# This is an example of a configuration file. You MUST edit the file before using it in your environment.

# List of connections to object storage platforms that is used for object storage provisioning.
connections:

# Configuration specific to the Dell ObjectScale platform.
- objectscale:

    # Default, unique identifier for the single connection. 
    #
    # It MUST NOT contain any hyphens '-'.
    #
    # REQUIRED
    id: example.id

    # Credentials used for authentication to object storage provider.
    #
    # REQUIRED
    credentials:

      # Username used to login to ObjectScale Management API
      #
      # REQUIRED
      username: testuser

      # Password used to login to ObjectScale Management API
      #
      # REQUIRED
      password: testpassword

    # Namespace associated with the user/tenant that is allowed to access the bucket.
    # It can be retrieved from the ObjectScale Portal, under the Accounts tab.
    #
    # How to:
    #   1. Login into ObjectScale Portal;
    #   2. Select Accounts tab in the panel on the left side of your screen;
    #   3. You should now see list of accounts. Select one of the values from column called 'Account ID'.
    #
    # REQUIRED
    namespace: osaia3382ab190a7a3df

    # The ID of the ObjectScale the driver should communicate with.
    # It can be retrieved from the ObjectScale Portal, under the ObjectScale tab.
    #
    # How to:
    #   1. Login into ObjectScale Portal;
    #   2. From the menu on left side of the screen select 'Administration' tab;
    #   3. Expand the 'Administration tab and select 'ObjectScale';
    #   4. Select 'Federation' tab;
    #   5. In the table you will see value under 'ObjectScale ID' column.
    #
    # REQUIRED
    objectscale-id: osci809ccd51aade874b

    # The ID of the Objectstore under specific ObjectScale, with which the driver should communicate.
    # It can be retrieved from the ObjectScale Portal, under the ObjectScale tab.
    #
    # How to:
    #   1. Login into ObjectScale Portal;
    #   2. From the menu on left side of the screen select 'Administration' tab;
    #   3. Expand the 'Administration tab and select 'ObjectScale';
    #   4. Select one of the object stores visible in the table, and click its name;
    #   5. You should see 'Summary' of that object store.
    #   6. In the 'General' section, you will see value under 'Object store ID' column.
    #
    # REQUIRED
    objectstore-id: ostibd2054393c389b1a

    # Endpoint of the ObjectScale Gateway Internal service.
    # It can be retrieved from the ObjectScale Portal, under the ObjectScale tab.
    #
    # How to:
    #   1. Login into ObjectScale Portal;
    #   2. From the menu on left side of the screen select 'Administration' tab;
    #   3. Expand the 'Administration tab and select 'ObjectScale';
    #   4. Select 'Federation' tab;
    #   5. In the table you will see one or more values, expand the selected value;
    #   6. In the table, you will now see 'External Endpoint' value associated with 'objectscale-gateway-internal'.
    #
    # Valid values:
    #   - https://<IP-ADDRESS>:443
    #   - https://<EXTERNAL-HOSTNAME>
    #
    # REQUIRED
    objectscale-gateway: https://gateway.objectscale.test:443

    # Endpoint of the ObjectScale ObjectStore Management Gateway service.
    # It can be retrieved from the ObjectScale Portal, under the ObjectScale tab.
    #
    # How to:
    #   1. Login into ObjectScale Portal;
    #   2. From the menu on left side of the screen select 'Administration' tab;
    #   3. Expand the 'Administration' tab, and select 'ObjectScale';
    #   4. Select one of the object stores visible in the table, and click its name;
    #   5. You should see 'Summary' of that object store.
    #   6. In the 'Management Service details' section, you will see value under 'IP address' column.
    #
    # Valid values:
    #   - https://<IP-ADDRESS>:4443
    #   - https://<EXTERNAL-HOSTNAME>
    #
    # REQUIRED
    objectstore-gateway: https://gateway.objectstore.test:4443

    # Identity and Access Management (IAM) API specific field.
    # It points to the region in which object storage provider is installed.
    #
    # OPTIONAL
    region: us-east-1

    # Indicates if the contents of the bucket should be emptied as part of the deletion process
    #
    # Possible values:
    # - true            - bucket will be emptied during the deletion.
    # - false - default - deletion of bucket will fail if the bucket is not empty.
    #                     All contents of the bucket must be cleared manually.
    #
    # OPTIONAL
    emptyBucket: false

    # Protocols supported by the connection
    #
    # Valid values:
    #   s3 (property)
    #
    # REQUIRED
    protocols:

      # S3 configuration
      #
      # REQUIRED
      s3:

        # Endpoint of the S3 service.
        # It can be retrieved from the ObjectScale Portal, under the ObjectScale tab.
        #
        # How to:
        #   1. Login into ObjectScale Portal;
        #   2. From the menu on left side of the screen select 'Administration' tab;
        #   3. Expand the 'Administration tab and select 'ObjectScale';
        #   4. Select one of the object stores visible in the table, and click its name;
        #   5. You should see 'Summary' of that object store.
        #   6. In the 'S3 Service details' section, you will see value under 'IP address' column.
        #
        # Valid values:
        #   - https://<IP-ADDRESS>:443
        #   - https://<EXTERNAL-HOSTNAME>
        #   - http://<IP-ADDRESS>:80
        #   - http://<EXTERNAL-HOSTNAME>
        #
        # REQUIRED
        endpoint: https://s3.objectstore.test

    # TLS configuration details
    #
    # REQUIRED
    tls:

      # Controls whether a client verifies the server's certificate chain and host name.
      #
      # Possible values:
      # - true - default
      # - false
      #
      # REQUIRED
      insecure: false

      # Base64 encoded content of the root certificate authority file.
      #
      # How To:
      #   1. Fetch the certificate from the ObjectScale:
      #     $ openssl s_client -showcerts -connect [ObjectScale IP] </dev/null 2>/dev/null | openssl x509 -outform PEM > root.crt
      #   2. Encode the data using the following commands:
      #     $ cat root.crt | base64 > root.crt.b64
      #   3. Open the 'root.crt.b64' file, copy it contents, and paste to the configuration file
      #
      # REQUIRED:
      # + if insecure is set to false
      root-cas: |-
        LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUU1RENDQXN5Z0F3SUJBZ0lCQVRBTkJna3Fo
        a2lHOXcwQkFRc0ZBREFTTVJBd0RnWURWUVFERXdkMFpYTjAKTFdOaE1CNFhEVEl6TURNeE56RXlN
        ek16TTFvWERUSTBNRGt4TnpFeU5ETXpNRm93RWpFUU1BNEdBMVVFQXhNSApkR1Z6ZEMxallUQ0NB
        aUl3RFFZSktvWklodmNOQVFFQkJRQURnZ0lQQURDQ0Fnb0NnZ0lCQU9oUmc1Um95UXdxCmVtQ1VN
        TDU3cXVLSXJjMWZXdGdlSGRpbVRSamFsVERQMStqYUhGeG56d2M1MTRwOWNLNzcxRWZ2bDRjZW9Q
        VWsKWnRhNSsxckRxdlBkd25BMnE2TXI5cFB2aWQyRkRiZVZPdXNIaHNQSG1kMDVxa1pnNGNXUGdp
        eXlSM3BmNTF0bApVYkxyNU1tL0FIK0JvRHVMbFo1UG5SVUw1b0hFd1hQa3BXc0UyMXJDc2xSdmJv
        WWZJYlplUzlsOHhlYURMVmdDCk53UmFHRjgxTFpoZjVrTDA0SXJUV0dETzdlbVF0S2tpN0dSZ1Ex
        bHIxRHR3SXZpa0puakhBeEJiOTJ3WDN1WnoKcGdMQksxU2RsUlY1bjY2VTZtUklzMGo1MkVyTG1h
        TDdUSHJxRVZHRXNvczFIbEZFQ2NJMlNhQjZZdmltaTdZawpmT1lOS2NPaE5BcXlXcWhlUERHQ0dq
        d3l4RHR3OWN2Z2FJSTlTOFFUa2w5Z1JiL056dFlMREptejlEYXZiRWNjCjRDelZBdUVmdUVtWUNi
        aFRrUVUyWitZczlKdXgwdmc4WXFFTExlRzlNZHc1cmZJQkkwNmRMRDVkU0JUVFc1Y08KYjRNN0h1
        ODhrZUdIWnlNZXU2cVMyR2czUUFTVEM3RkpFcWFYTkRDc095aCs2Uk14UnkyZy9idEZMRm5VdmlG
        QQo0NktKZHk0QWVjOEpXVkc1OFlLYkd2QlJrekkzY1BNWE1oWFpDS3pZb0tnUWoxMnFOMWM0SkVp
        TUFPK2F2ZW9RCjB0dnJmd3MxMlF3d3ZIZm40SCtYVnlDZGpMcDE5dlhlY0FSRFJyaGlkRW1CbEFD
        cVJVdTFLSGhzejZ2TmxzUzIKSlZiWU9BYW5ISzYzNzdYT211OUthL2x1TmxSVDdmckxBZ01CQUFH
        alJUQkRNQTRHQTFVZER3RUIvd1FFQXdJQgpCakFTQmdOVkhSTUJBZjhFQ0RBR0FRSC9BZ0VBTUIw
        R0ExVWREZ1FXQkJSbDk4cG1valVUQ3RZb3phTDl6L0hSCmJIUkdkREFOQmdrcWhraUc5dzBCQVFz
        RkFBT0NBZ0VBNUVxL09ocGs0MUxLa3R2ajlmSWNFWXI5Vi9QUit6Z1UKQThRTUtvOVBuZSsrdW1N
        dEZEK1R1M040b1lxV0srTmg0ajdHTm80RFJXejNnbWpZdUlDdklhMGo5emppT1FkWgo1Q2xVQkdk
        YUlScFoyRG5CblBUM2tJbnhSd0hmU0JMVlVTRXRTcXh4YkV2dk5LWkZWY0lsRUV5ODZodnJ5OUZD
        CjhFOWRXWEw5VDhMd29uVXpqSjBxZ242cGRjNHpjdEtUMDFjaDQvWGw2UjBVQkR5Q1NoSGFyU29C
        eTkvSk1NTXIKajBoeEZSN3Izb052a2N3QWl6T1RsQ3BWdTZaNHF2cng3NndCc0hIanV6elNiODJL
        dUxnelJUNElWbjFjbzRrVQpSaTlBRkNaRlh6QklaQlEwTUZ6NU03bzJkN0ovN3ZMOFhYRlhwWlpy
        K3RibWE1L3BCSmZhcXliK3FPRXViWGdUCjFsSDZGeFNVcWt0TktQNlZoeWdQY2ZSMlR4YWtHZ0cw
        Ny9qVWZWRmhpVXM5aFBlejh6Sjg2RWMrd283VEVQbEsKSlRnMHZmMDM4MTROR3ZuWmlpTnBFWVBM
        S0ZhcHlDMWJONVdFTGFTWFVBaVFPZDJjK01xVHAyN21vV1RZa29TOApzRFczRTMraEN6c1djdmFY
        RW1nMjZJTjQybmVUWFBuNS9QajNpcUVoT0pQYkJsY3l6dDBZL1BYeU1jR3JtbUs1CkhxOUMzTndl
        VUV3M09rY09BOXlCdC9kLzZ5S3c3QmovSlFQZGI0aDlWWjNGN09wemFpeXQ5cFhvSXRQMHNUSHUK
        S2ZKbDBCRUFYV29SR2lWM2EyeUlUcGp0a0pkQVBoS0xpSkkrWWowZEVEU05WZnlENFhJTXdQSmpV
        eFpsd2FROQorQUtkVDFBdlplbz0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=

      # Base64 encoded content of the clients's certificate file.
      #
      # How To:
      #   Considering client certificate file is named 'client.crt', you can obtain the data using the following commands:
      #     cat client.crt | base64 > client.crt.b64
      #   You can then open the 'client.crt.b64' file, copy it contents, and paste to the configuration file
      #
      # It is required only if the server requires client authentication.
      # It is mutually required if the field client-key has a value.
      #
      # REQUIRED:
      # + if insecure is set to false
      #   AND
      # + the client-key field is not empty
      client-cert: |-
        LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUVORENDQWh5Z0F3SUJBZ0lSQU9JSlZ2NnB3
        a0lIK0p1NTNKSEFuam93RFFZSktvWklodmNOQVFFTEJRQXcKRWpFUU1BNEdBMVVFQXhNSGRHVnpk
        QzFqWVRBZUZ3MHlNekF6TVRjeE1qTTJNelphRncweU5EQTVNVGN4TWpRegpNamxhTUJFeER6QU5C
        Z05WQkFNVEJtTnNhV1Z1ZERDQ0FTSXdEUVlKS29aSWh2Y05BUUVCQlFBRGdnRVBBRENDCkFRb0Nn
        Z0VCQU5LVFNHeEEyV2RyNmtCR0N3RjY5c1JVZElPV0xqeTUvN3QyRktKWDVVenNyMDlFWW9tS0sr
        bVQKdWF2eWJIMWhsbTYzdG5kb3VFOHFIQnVhYmYvUGIzSlRTQ0twR0NRdHR2NmQzeGc3MHFZVWIx
        cUZKT2o5andlNgpRZW0xb2RIVFpLc0xMc2J1N1Fzei91MGtseUovMHNYcFQ5K2JXK1M0OHMrL3pK
        dHNDR21SdVhlRjE2Y1FqOWErCkFFejNqVzhrdExMYi9nS25GWGRSS2FiY2RWLzNzN2RLNWx0SXpS
        ZlRvUWw0bzBpckpOa3Z4eXIrYUtMMTR4NUQKc3g2Wm9DUHJhRFYrWWlRS0ZSenFjQ1RYcWdRb3BY
        LzFINFRMV3RkeG14M25IdmhZdzB0VlBZSXZsa245NmpJUwpKdVE2K1VMbVAzZDNzNWJadlhQeUZD
        bENKSENxaWZNQ0F3RUFBYU9CaFRDQmdqQU9CZ05WSFE4QkFmOEVCQU1DCkE3Z3dIUVlEVlIwbEJC
        WXdGQVlJS3dZQkJRVUhBd0VHQ0NzR0FRVUZCd01DTUIwR0ExVWREZ1FXQkJTRWVIOTEKVnBhdDlV
        SWlrRUdkc1ljdUI2dWxOakFmQmdOVkhTTUVHREFXZ0JSbDk4cG1valVUQ3RZb3phTDl6L0hSYkhS
        RwpkREFSQmdOVkhSRUVDakFJZ2daamJHbGxiblF3RFFZSktvWklodmNOQVFFTEJRQURnZ0lCQUQv
        TnZVNWRSajlHCmMzYzVVQ3VLcDI4U2lacjAySE40M091WU5QVlk4L1c5QnZUSk5yMXRPRDFscnhE
        eFMzTkpVdzdGaTNidmU5enMKSzA0a09peUxpVjRLd0g2eitpVm8xZU9GUzJLd1BRaGxsaDlobVBB
        dXZ4Zm5Fd2k2ZEdXZm5nNExmQ1FvbXFkTgpmbkFCODJBbTViZTBubGJvaGdLcFJUWnVBZjR4dVY4
        SWxlQ1pjVHdFL1hBbERhNVhHaDNvWlE3REYrQnFLSkNUCk1pYS9MT0JPYXRoRVh5ZGJmbndOUUhy
        UWlQZzk4c2NMc3FTZEFQMFNGYjMrMmdscFJZT1JrQlFvOWRoa1pGZXkKc2tUakVhbk9YaUhqWldq
        aXZRS2Z2WEUvK1l2eGpCcEJqREE2NnYyeUgzSlJqZEM5ZTR2cnE2R0t6VXZML3ltOQpVOGdVWnho
        L2ZmeFp4TVA5UmxXajQ0U1NGUVpZNGxUNFF5U2lteFpGdVBTamwzV29QME12UHVvUzFUUzhQUk5s
        CnVGeXBVell5SEtlbHpLUnRJZmlnWG9XQi9uR2hSV0RMN2FZS0xYZWRIU0ZrdXBmZm9YM1hHQThM
        ZVAwQ01PaEsKUUJaUkxIeXU0VjhvRG1lakFIcFoyVjlpY2E1emtmcnJWVXFvSzF1VjYvdHd3cEZG
        WDErN0w1bk0ybDJDQWxvegpaVHFUZzNCdVdYd2VkYzZQbkpuU2xQSDNadFhqcGFJUWhXdU85TUlG
        WFVtVFBlSkZ2WGxKeWRsdUxtMlQzanVqCldiVENGcEhyMXBrMGk3K1J4ZVRBcFY0RTk2S09DOXEw
        ZGREOG1waTM0cnkyZjFmQ2RZekhQM0s4bW5od3BPWmkKaG1Xd3VWVDV3em5kVWVBRGNWYUY2UlhU
        UENKSElLd24KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=
      
      # Base64 encoded content of the clients's key certificate file.
      #
      # How To:
      #   Considering client certificate file is named 'client.key', you can obtain the data using the following commands:
      #     cat client.key | base64 > client.key.b64
      #   You can then open the 'client.key.b64' file, copy it contents, and paste to the configuration file
      #
      # It is required only if the server requires client authentication.
      # It is mutually required if the field client-cert has a value.
      #
      # REQUIRED:
      # + if insecure is set to false
      #   AND
      # + the client-cert field is not empty
      client-key: |-
        LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFcFFJQkFBS0NBUUVBMHBOSWJFRFpa
        MnZxUUVZTEFYcjJ4RlIwZzVZdVBMbi91M1lVb2xmbFRPeXZUMFJpCmlZb3I2Wk81cS9Kc2ZXR1di
        cmUyZDJpNFR5b2NHNXB0Lzg5dmNsTklJcWtZSkMyMi9wM2ZHRHZTcGhSdldvVWsKNlAyUEI3cEI2
        YldoMGROa3F3c3V4dTd0Q3pQKzdTU1hJbi9TeGVsUDM1dGI1TGp5ejcvTW0yd0lhWkc1ZDRYWApw
        eENQMXI0QVRQZU5ieVMwc3R2K0FxY1ZkMUVwcHR4MVgvZXp0MHJtVzBqTkY5T2hDWGlqU0tzazJT
        L0hLdjVvCm92WGpIa096SHBtZ0krdG9OWDVpSkFvVkhPcHdKTmVxQkNpbGYvVWZoTXRhMTNHYkhl
        Y2UrRmpEUzFVOWdpK1cKU2YzcU1oSW01RHI1UXVZL2QzZXpsdG05Yy9JVUtVSWtjS3FKOHdJREFR
        QUJBb0lCQUJFSVVzSlcySDd5RHFlVwpRc3VpMjVUejA5elU1L2FIZ1BUenp5VjJnSmloU0dqYitq
        QnYyYTl5QUlHMUFTdC9Ha0RvWVR6MVhuc2d4OWMvCnZZZ0VpbG92L0ZTNVlyZUNieHZYUHpWaG1W
        OVBwZFlua04yN3JMY09UTWlQcFlBb1hpc3JvMlA1N1hpTGd5SkIKWkd3bzlLNkhlYXQza0k1R20z
        Vk1hVXRsQ0tVcE84cUwzcEZ4S1AwMVVwbGh6ZjhMbXJpTUJQMDlxdFFJejBydQpiR1l5eUdVdk9a
        a0RKZFJycmlSWGJWK0RNMFlmbVpqU1Q4aEI0UDlsOEhwMEZRNUp2TWVGREpzRFFaZjVBZnJmClFI
        WE55SlFUeTNTeXJ1bGd5N0p4MGY1T2JpVWRMRWViQVRpN3VLR3Y5UEZRRUJmSzdFdE4vZ1ZibGsx
        MzRzNUIKWEhkNXU1a0NnWUVBNDBVMjhONko4QXIwY2puYnNLUUJtOGhURWlJSjk3TEJPOU5kOTlJ
        M1dJYklZVzIzVE5wVwo0M2R4K1JHelA4eVMzYzZhN00wbzR1dUl6TXFDSkV3cVNJUjAvVGZaWWdx
        cGtwcFZPalp2VFdCUDFtSUlKUFpwCll1SFk0UVRJdkdhcVFNNnFWQXA4MW9YdXoxTmNmQWpTLzNJ
        Z1BWdGVZeDNKd0pmNWVqenZQclVDZ1lFQTdUSEwKR3VCTWpqTWVhaWk1ZU1sU1BndkYxMHJISUs0
        RzZCZUJDTFFXU2ViNmNOT2x2a1RaOTNqdlFiWko1L3JBTGNWNgpaTVdqbWY5Tkl0NWdDdyt2K2dM
        Qm9BZXM3WEk2K2Rpdk1DYXE0dUFmWkhJWjBYbXpIOGx1a0o5ZUtyK2NyR2FzClNhWkdKRnlyQTZz
        WGdOc1ZJUm85RkFsR3V1dGZnd2hSUmo1eFp3Y0NnWUVBZ241MWcyeGtDMTVlNlU5clkwdG8KV1Fo
        M0dreE5LTnFNdFVzeUExL0N3NlB3WG5EZTlOUFJYQjV6WkszVEhHamNVMXVUL1MvM3NBUEpzcno4
        YU5jSwoyRVNsMzljM2pHSE82QXlScnpFZVMzRm5waEwzMWpGZVpaYUVMdi9PT3M5QUpxSURqdW5P
        c0dhS3JxU1F6KzlKCko3OWgzNWtjNHhCeGpaSTFmd2lKM3BrQ2dZRUFwUnBOMkExYy9IWlVxMnho
        ZmRRVXJSK2d2TFZPV2s4SWU3RXcKbmhCTW0zQnR6dTlqcFVkanVVQ3l1YmpiUk9CanVQaUdzM0pt
        NktDdTNxQ1BsZU43aUxrMmNlQWwzTG53bDB6ZQoxTk4xaTZxWjcxOEUzYXlxcEd1ZnpJZENFdHVC
        Z1BlTzRVMGQ4ZDJYSkZ5SlphWVoxUXJnalB2UUFmZ29hWnIyCmg4Q2JTeTBDZ1lFQW1VQ3BqR0JW
        MGNpVnlmUXNmOGdsclNOdWx6NzBiaVJWQzVSeno0dVJEMkhsYVM2eC8wc0IKQzltSUhpdWgwR0Zp
        dEVFRlg4TzdlZ1ppNWJKMGFuQWYyakk1R1RnTjJOYzFpVlZnWldxcHh2aXpuckpKcENSYgpaejB0
        M2thTkkyNjg0WTNxS2JxeG8ramRNK05hMG1qd2ErTEFOcEdCUDNwb2c0RHJ4eTNNSFdZPQotLS0t
        LUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQo=
```
