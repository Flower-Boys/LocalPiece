package com.flowerguys.localpiece.domain.image.service;

import com.oracle.bmc.model.BmcException; // ✨ 1. BmcException import
import com.oracle.bmc.objectstorage.ObjectStorage;
import com.oracle.bmc.objectstorage.requests.DeleteObjectRequest;
import com.oracle.bmc.objectstorage.requests.PutObjectRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

import com.flowerguys.localpiece.global.common.ErrorCode;
import com.flowerguys.localpiece.global.common.exception.BusinessException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageUploadService {

    private final ObjectStorage objectStorage; // OciConfig에서 Bean으로 주입받음

    @Value("${oci.object-storage.namespace}")
    private String namespace;

    @Value("${oci.object-storage.bucket-name}")
    private String bucketName;

    public String uploadImage(MultipartFile file) {
        String uniqueFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .namespaceName(namespace)
                    .bucketName(bucketName)
                    .objectName(uniqueFileName)
                    .putObjectBody(file.getInputStream()) // ⬅️ 이 부분이 IOException을 발생시킬 수 있음
                    .contentType(file.getContentType())
                    .build();

            objectStorage.putObject(request);

            return String.format("https://objectstorage.ap-sydney-1.oraclecloud.com/n/%s/b/%s/o/%s",
                                 namespace, bucketName, uniqueFileName);
        } catch (IOException e) {
            // ⬇️ IOException 발생 시, BusinessException으로 변환하여 던짐
            throw new BusinessException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    public String uploadImage(byte[] imageBytes, String originalFilename, String contentType) {
        String uniqueFileName = UUID.randomUUID() + "_" + originalFilename;

        try (InputStream inputStream = new ByteArrayInputStream(imageBytes)) {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucketName(bucketName)
                    .namespaceName(namespace)
                    .objectName(uniqueFileName)
                    .contentType(contentType)
                    .contentLength((long) imageBytes.length)
                    .putObjectBody(inputStream)
                    .build();

            objectStorage.putObject(request);

            return "https://objectstorage.ap-chuncheon-1.oraclecloud.com/n/" + namespace + "/b/" + bucketName + "/o/" + uniqueFileName;
        } catch (IOException e) {
            // BusinessException 등 적절한 예외 처리
            throw new RuntimeException("파일 업로드에 실패했습니다.", e);
        }
    }

    public void deleteImage(String imageUrl) {
        // URL에서 객체 이름(파일 이름)을 추출
        String objectName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);

        DeleteObjectRequest request = DeleteObjectRequest.builder()
                .namespaceName(namespace)
                .bucketName(bucketName)
                .objectName(objectName)
                .build();

        try {
            objectStorage.deleteObject(request);
            log.info("Object Storage에서 이미지를 성공적으로 삭제했습니다: {}", objectName);
        } catch (BmcException e) {
            // HTTP 404 Not Found 오류는 이미지가 존재하지 않는다는 의미이므로,
            // 비즈니스 로직상 오류로 간주하지 않고 경고 로그만 남기고 넘어갑니다.
            if (e.getStatusCode() == 404) {
                log.warn("삭제하려던 이미지가 Object Storage에 존재하지 않습니다. URL: {}", imageUrl);
            } else {
                // 404가 아닌 다른 모든 오류는 심각한 문제일 수 있으므로 다시 예외를 던집니다.
                log.error("Object Storage 이미지 삭제 중 예상치 못한 오류가 발생했습니다.", e);
                throw e; 
            }
        }
    }
}