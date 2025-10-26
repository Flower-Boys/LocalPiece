package com.flowerguys.localpiece.global.config;

import com.oracle.bmc.auth.AuthenticationDetailsProvider;
import com.oracle.bmc.auth.ConfigFileAuthenticationDetailsProvider;
import com.oracle.bmc.objectstorage.ObjectStorage;
import com.oracle.bmc.objectstorage.ObjectStorageClient;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class OciConfig {
    
    @Value("${oci.object-storage.config-path}")
    private String ociConfigPath;

    @Bean
    public ObjectStorage objectStorage() throws IOException {
        AuthenticationDetailsProvider provider =
        new ConfigFileAuthenticationDetailsProvider(ociConfigPath, "DEFAULT");

        return ObjectStorageClient.builder()
                .build(provider);
    }
}