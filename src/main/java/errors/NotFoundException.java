package errors;

public class NotFoundException extends Error {
    public NotFoundException(String message) {
        super(message);
    }
}
