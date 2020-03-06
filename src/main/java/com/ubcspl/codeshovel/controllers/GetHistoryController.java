package com.ubcspl.codeshovel.controllers;

import com.ubcspl.codeshovel.models.CodeShovel;
import org.springframework.web.bind.annotation.*;

@RestController
public class GetHistoryController {

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
        return CodeShovel.getHistory(gitUrl, filePath, methodName, startLine, startCommit, noCache, noClone);
    }
}
