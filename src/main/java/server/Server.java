package server;

import org.springframework.web.bind.annotation.*;

import java.util.Collection;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class Server {

    @PostMapping("/clearCache")
    public String clearCache() {
        return Routes.performClear();
    }

    @RequestMapping("/getHistory")
    public String dig(
            @RequestParam(value="gitUrl") String gitUrl,
            @RequestParam(value="filePath") String filePath,
            @RequestParam(value="methodName") String methodName,
            @RequestParam(value="startLine") String startLine,
            @RequestParam(value="sha", defaultValue="HEAD") String startCommit,
            @RequestParam(value="noCache", defaultValue="false") String noCache
    ) {
        return Routes.getHistory(gitUrl, filePath, methodName, startLine, startCommit, noCache);
    }

    @RequestMapping("/listFiles")
    public Collection<String> listFiles(
            @RequestParam(value="gitUrl") String gitUrl,
            @RequestParam(value="sha", defaultValue="HEAD") String sha,
            @RequestParam(value="noCache", defaultValue="false") String noCache
    ) {
        return Routes.listFiles(gitUrl, sha, noCache);
    }

    @RequestMapping("/listMethods")
    public Collection<Object> listMethods(
            @RequestParam(value="gitUrl") String gitUrl,
            @RequestParam(value="filePath") String filePath,
            @RequestParam(value="sha", defaultValue="HEAD") String sha,
            @RequestParam(value="noCache", defaultValue="false") String noCache
    ) {
        return Routes.listMethods(gitUrl, filePath, sha, noCache);
    }

    @ExceptionHandler({InternalError.class, IllegalArgumentException.class})
    public String handleInternalError(Exception e) {
        return "ERROR: " + e.toString();
    }

}
