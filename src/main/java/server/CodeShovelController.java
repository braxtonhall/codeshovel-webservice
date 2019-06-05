package server;

import org.springframework.web.bind.annotation.*;

@RestController
public class CodeShovelController {

    @PostMapping("/clearcache")
    public String clearCache() {
        return Routes.performClear();
    }

    @RequestMapping("/dig")
    public String dig(
            @RequestParam(value="cloneurl") String cloneurl,
            @RequestParam(value="filepath") String filepath,
            @RequestParam(value="methodname") String methodname,
            @RequestParam(value="startline") String startline,
            @RequestParam(value="startcommit", defaultValue="HEAD") String startcommit
    ) {
        return Routes.performDig(cloneurl, filepath, methodname, startline, startcommit);
    }

    @ExceptionHandler({InternalError.class, IllegalArgumentException.class})
    public String handleInternalError(Exception e) {
        return "ERROR: " + e.toString();
    }

}
