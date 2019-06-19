package server;

import org.springframework.web.bind.annotation.*;

import java.util.Collection;

@RestController
public class CodeShovelController {

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
            @RequestParam(value="sha", defaultValue="HEAD") String startcommit,
            @RequestParam(value="noCache", defaultValue="false") String noCache
    ) {
        return Routes.getHistory(gitUrl, filePath, methodName, startLine, startcommit, noCache);
    }
    // http://localhost:8080/getHistory?gitUrl=https://github.com/checkstyle/checkstyle.git&filePath=src/main/java/com/puppycrawl/tools/checkstyle/Checker.java&methodName=fireErrors&startLine=384&sha=119fd4fb33bef9f5c66fc950396669af842c21a3

    @RequestMapping("/listFiles")
    public Collection<String> listFiles(
            @RequestParam(value="gitUrl") String gitUrl,
            @RequestParam(value="sha", defaultValue="HEAD") String sha,
            @RequestParam(value="noCache", defaultValue="false") String noCache
    ) {
        return Routes.listFiles(gitUrl, sha, noCache);
    }

    @RequestMapping("listMethods")
    public Collection<Object> listMethods(
            @RequestParam(value="gitUrl") String gitUrl,
            @RequestParam(value="filePath") String filePath,
            @RequestParam(value="sha", defaultValue="HEAD") String sha,
            @RequestParam(value="noCache", defaultValue="false") String noCache
    ) {
        return Routes.listMethods(gitUrl, filePath, sha, noCache);
    }

    // http://localhost:8080/listMethods?gitUrl=https://github.com/checkstyle/checkstyle.git&filePath=src/main/java/com/puppycrawl/tools/checkstyle/Checker.java&sha=119fd4fb33bef9f5c66fc950396669af842c21a3


    @ExceptionHandler({InternalError.class, IllegalArgumentException.class})
    public String handleInternalError(Exception e) {
        return "ERROR: " + e.toString();
    }

}
