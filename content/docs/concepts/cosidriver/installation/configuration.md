---
title: Configuration
linktitle: Configuration
weight: 1
Description: Description of configuration file for ObjectScale
toc_hide: true
---
## Dell COSI Driver Configuration Schema

This configuration file is used to specify the settings for the Dell COSI Driver, which is responsible for managing connections to the Dell ObjectScale platform. The configuration file is written in YAML format and based on the JSON schema and adheres to its specification.

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
    # It can be retrieved from the ObjectScale Portal, under the Manage -> Namespace tab.
    #
    # How to:
    #   1. Login into ObjectScale Portal;
    #   2. Select Manage tab in the panel on the left side of your screen;
    #   3. Select Namespace in the panel on the left side of your screen;
    #   3. You should now see list of namespaces.
    #
    # REQUIRED
    namespace: ns1

    # Endpoint of the ObjectScale Management Gateway service.
    #
    # Valid values:
    #   - https://<IP-ADDRESS>:4443
    #   - https://<EXTERNAL-HOSTNAME>
    #
    # REQUIRED
    mgmt-endpoint: https://gateway.objectscale.test:4443

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
        #
        # The Amazon S3 Object Service is available on HTTP 9020 and HTTPS 9021 ports.
        #
        # REQUIRED
        endpoint: https://objectscale:9021

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
      root-cas: <base-64-encoded-root-cas>
```
