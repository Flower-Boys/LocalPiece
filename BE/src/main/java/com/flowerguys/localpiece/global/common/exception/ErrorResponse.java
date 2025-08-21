package com.flowerguys.localpiece.global.common.exception;

import com.flowerguys.localpiece.global.common.ErrorCode;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
public class ErrorResponse {
    private final LocalDateTime timestamp = LocalDateTime.now();
    private final int status;
    private final String error;
    private String message;

    public ErrorResponse(ErrorCode errorCode) {
        this.status = errorCode.getStatus().value();
        this.error = errorCode.getStatus().name();
        this.message = errorCode.getMessage();
    }

    // ⬇️ 상세 메시지를 직접 설정할 수 있는 생성자를 추가합니다.
    public ErrorResponse(ErrorCode errorCode, String message) {
        this.status = errorCode.getStatus().value();
        this.error = errorCode.getStatus().name();
        this.message = message;
    }
}