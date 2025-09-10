package com.flowerguys.localpiece.global.config;

import com.oracle.bmc.ConfigFileReader;
import com.oracle.bmc.auth.AuthenticationDetailsProvider;
import com.oracle.bmc.auth.ConfigFileAuthenticationDetailsProvider;
import com.oracle.bmc.objectstorage.ObjectStorage;
import com.oracle.bmc.objectstorage.ObjectStorageClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class OciConfig {

    @Bean
    public ObjectStorage objectStorage() throws IOException {
        // 서버에서는 ~/.oci/config 경로의 파일을 사용하여 인증
        // 로컬에서는 직접 경로를 지정해야 할 수 있음
        AuthenticationDetailsProvider provider =
                new ConfigFileAuthenticationDetailsProvider("~/.oci/config", "DEFAULT");

        return ObjectStorageClient.builder()
                .build(provider);
    }
}