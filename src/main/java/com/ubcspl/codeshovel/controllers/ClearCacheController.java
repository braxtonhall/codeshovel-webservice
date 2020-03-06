package com.ubcspl.codeshovel.controllers;

import com.ubcspl.codeshovel.models.CodeShovel;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ClearCacheController {

    @PostMapping("/clearCache")
    public String clearCache() {
        return CodeShovel.performClear();
    }
}
