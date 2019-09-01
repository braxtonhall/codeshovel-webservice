package server;

import errors.NotFoundException;
import errors.ServerBusyException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collection;

@CrossOrigin(origins = "*")
@RestController
public class Server {

    @PostMapping("/clearCache")
    public String clearCache() {
        return Routes.performClear();
    }

    @RequestMapping("/echo")
    public String echo(
            @RequestParam(value="msg", defaultValue="echo") String msg
    ) {
        return msg;
    }

    @RequestMapping("/getHistory")
    public String dig(
            @RequestParam(value="gitUrl") String gitUrl,
            @RequestParam(value="filePath") String filePath,
            @RequestParam(value="methodName") String methodName,
            @RequestParam(value="startLine") String startLine,
            @RequestParam(value="sha", defaultValue="HEAD") String startCommit,
            @RequestParam(value="noCache", defaultValue="false") String noCache,
            @RequestParam(value="noClone", defaultValue="false") String noClone
    ) {
        return Routes.getHistory(gitUrl, filePath, methodName, startLine, startCommit, noCache, noClone);
    }

    @RequestMapping("/listFiles")
    public Collection<String> listFiles(
            @RequestParam(value="gitUrl") String gitUrl,
            @RequestParam(value="sha", defaultValue="HEAD") String sha,
            @RequestParam(value="noCache", defaultValue="false") String noCache,
            @RequestParam(value="noClone", defaultValue="false") String noClone
    ) {
        return Routes.listFiles(gitUrl, sha, noCache, noClone);
    }

    @RequestMapping("/listMethods")
    public Collection<Object> listMethods(
            @RequestParam(value="gitUrl") String gitUrl,
            @RequestParam(value="filePath") String filePath,
            @RequestParam(value="sha", defaultValue="HEAD") String sha,
            @RequestParam(value="noCache", defaultValue="false") String noCache,
            @RequestParam(value="noClone", defaultValue="false") String noClone
    ) {
        return Routes.listMethods(gitUrl, filePath, sha, noCache, noClone);
    }

    @ExceptionHandler({IllegalArgumentException.class})
    public void handleIllegalArguments(HttpServletResponse response) throws IOException {
        response.sendError(HttpStatus.BAD_REQUEST.value());
    }

    @ExceptionHandler({InternalError.class})
    public void handleInternalError(HttpServletResponse response) throws IOException {
        response.sendError(HttpStatus.INTERNAL_SERVER_ERROR.value());
    }

    @ExceptionHandler({ServerBusyException.class})
    public void handleServerBusy(HttpServletResponse response) throws IOException {
        response.sendError(HttpStatus.SERVICE_UNAVAILABLE.value());
    }

    @ExceptionHandler({OutOfMemoryError.class})
    public void handleOutOfMemory(HttpServletResponse response) throws IOException {
        response.sendError(HttpStatus.SERVICE_UNAVAILABLE.value());
        System.exit(0);
    }

    @ExceptionHandler({NotFoundException.class})
    public void handleNotFound(HttpServletResponse response) throws IOException {
        response.sendError(HttpStatus.NOT_FOUND.value());
        System.exit(0);
    }

}
