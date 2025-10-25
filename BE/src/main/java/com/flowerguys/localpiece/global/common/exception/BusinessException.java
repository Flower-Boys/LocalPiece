package com.flowerguys.localpiece.global.common.exception;

import com.flowerguys.localpiece.global.common.ErrorCode;
import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {
    private final ErrorCode errorCode;
    private final String serviceMessage;

    public BusinessException(ErrorCode errorCode) {
        this(errorCode, null); 
    }
    
    public BusinessException(ErrorCode errorCode, String serviceMessage) {
        super(errorCode.getMessage() + (serviceMessage != null ? " - " + serviceMessage : ""));
        this.errorCode = errorCode;
        this.serviceMessage = serviceMessage;
    }
}