package com.ubcspl.codeshovel.controllers;

import com.ubcspl.codeshovel.models.CodeShovel;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;

@RestController
public class ListMethodsController {

    @RequestMapping("/listMethods")
    public Collection<Object> listMethods(
            @RequestParam(value="gitUrl") String gitUrl,
            @RequestParam(value="filePath") String filePath,
            @RequestParam(value="sha", defaultValue="HEAD") String sha,
            @RequestParam(value="noCache", defaultValue="false") String noCache,
            @RequestParam(value="noClone", defaultValue="false") String noClone
    ) {
        return CodeShovel.listMethods(gitUrl, filePath, sha, noCache, noClone);
    }
}
