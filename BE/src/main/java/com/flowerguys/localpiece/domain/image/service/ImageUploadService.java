package com.flowerguys.localpiece.domain.image.service;

import com.oracle.bmc.objectstorage.ObjectStorage;
import com.oracle.bmc.objectstorage.requests.PutObjectRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImageUploadService {

    private final ObjectStorage objectStorage;

    @Value("${oci.object-storage.namespace}")
    private String namespace;

    @Value("${oci.object-storage.bucket-name}")
    private String bucketName;

    public String uploadImage(MultipartFile file) throws IOException {
        // 1. 파일 이름이 겹치지 않도록 UUID를 사용하여 고유한 파일 이름 생성
        String originalFileName = file.getOriginalFilename();
        String extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        String uniqueFileName = UUID.randomUUID().toString() + extension;

        // 2. OCI Object Storage에 업로드 요청 생성
        PutObjectRequest request = PutObjectRequest.builder()
                .namespaceName(namespace)
                .bucketName(bucketName)
                .objectName(uniqueFileName)
                .putObjectBody(file.getInputStream())
                .contentType(file.getContentType())
                .build();

        // 3. 파일 업로드 실행
        objectStorage.putObject(request);

        // 4. 업로드된 파일의 공개 URL 생성 및 반환
        // 형식: https://objectstorage.{region}.oraclecloud.com/n/{namespace}/b/{bucketName}/o/{objectName}
        return String.format("https://objectstorage.ap-sydney-1.oraclecloud.com/n/%s/b/%s/o/%s",
                             namespace, bucketName, uniqueFileName);
    }
}