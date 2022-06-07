package com.ubcspl.codeshovel.wrappers;

import com.felixgrund.codeshovel.wrappers.GlobalEnv;

public class WebServiceEnv extends GlobalEnv {
    public static final String GITHUB_TOKEN = System.getenv("GITHUB_TOKEN");
    public static final String LEGAL_EXTENSIONS = "py,java,ts,js";
}
