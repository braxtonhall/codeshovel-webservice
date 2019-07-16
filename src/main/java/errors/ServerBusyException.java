package errors;

public class ServerBusyException extends Error {
    public ServerBusyException(String message) {
        super(message);
    }
}
