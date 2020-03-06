package com.ubcspl.codeshovel.errors;

public class ServerBusyException extends Error {
    public ServerBusyException(String message) {
        super(message);
    }
}
