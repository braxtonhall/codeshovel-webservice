package com.ubcspl.codeshovel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CodeShovelWebApplication {

    public static void main(String[] args) {
        String port = "";
        String sysPort = System.getenv("PORT");
        if (sysPort != null) {
            port = sysPort;
        }
        System.setProperty("server.port", port);
        SpringApplication.run(CodeShovelWebApplication.class, args);
    }

}
