package com.flowerguys.localpiece.domain.image.service;

import com.oracle.bmc.objectstorage.ObjectStorage;
import com.oracle.bmc.objectstorage.requests.PutObjectRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import com.flowerguys.localpiece.global.common.ErrorCode;
import com.flowerguys.localpiece.global.common.exception.BusinessException;
import java.util.UUID;

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
}