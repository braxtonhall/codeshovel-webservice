package com.ubcspl.codeshovel.controllers;

import com.ubcspl.codeshovel.models.CodeShovel;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;

@RestController
public class ListFilesController {

    @RequestMapping("/listFiles")
    public Collection<String> listFiles(
            @RequestParam(value="gitUrl") String gitUrl,
            @RequestParam(value="sha", defaultValue="HEAD") String sha,
            @RequestParam(value="noCache", defaultValue="false") String noCache,
            @RequestParam(value="noClone", defaultValue="false") String noClone
    ) {
        return CodeShovel.listFiles(gitUrl, sha, noCache, noClone);
    }
}
