package com.ubcspl.codeshovel.models;

import com.felixgrund.codeshovel.execution.ShovelExecution;
import com.felixgrund.codeshovel.services.RepositoryService;
import com.felixgrund.codeshovel.services.impl.CachingRepositoryService;
import com.felixgrund.codeshovel.util.Utl;
import com.felixgrund.codeshovel.wrappers.Commit;
import com.felixgrund.codeshovel.wrappers.StartEnvironment;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.lib.Repository;

import java.util.Collection;

public class CodeShovel {
    public static String getHistory(String cloneUrl,
                             String filepath,
                             String methodName,
                             String startLine,
                             String startCommitName,
                             String noCache,
                             String noClone) {

        int intStartLine = Integer.parseInt(startLine);
        boolean boolNoCache = Boolean.parseBoolean(noCache);
        boolean boolNoClone = Boolean.parseBoolean(noClone);
        nand(boolNoCache, boolNoClone);

        String cacheRepositoryPath = Repo.cloneRepository(cloneUrl, boolNoCache, boolNoClone);

        String pathToGitFolder = cacheRepositoryPath + "/.git";
        String outFilePath = cacheRepositoryPath + "/cdshvl/fake.json";
        String repositoryName = cacheRepositoryPath.substring(cacheRepositoryPath.lastIndexOf("/") + 1);

        if (filepath.startsWith("/")) {
            filepath = filepath.substring(1);
        }
        if (filepath.startsWith("./")) {
            filepath = filepath.substring(2);
        }

        try {
            return runShovelExecution(pathToGitFolder, repositoryName,
                    startCommitName, filepath, methodName, outFilePath, intStartLine);
        } catch (Exception e) {
            System.out.println(e.toString());
            throw new InternalError("Was not able to perform the dig!");
        }
    }

    public static String performClear() {
        return Repo.performClear();
    }

    private static String runShovelExecution(
            String repositoryPathGit,
            String repositoryName,
            String startCommitName,
            String filepath,
            String methodname,
            String outFilePath,
            int startLine
    ) throws Exception {
        Repository repository = Utl.createRepository(repositoryPathGit);
        Git git = new Git(repository);
        RepositoryService repositoryService = new CachingRepositoryService(git, repository, repositoryName, repositoryPathGit);
        Commit startCommit = repositoryService.findCommitByName(startCommitName);

        StartEnvironment startEnv = new StartEnvironment(repositoryService);
        startEnv.setRepositoryPath(repositoryPathGit);
        startEnv.setFilePath(filepath);
        startEnv.setFunctionName(methodname);
        startEnv.setFunctionStartLine(startLine);
        startEnv.setStartCommitName(startCommitName);
        startEnv.setStartCommit(startCommit);
        startEnv.setFileName(Utl.getFileName(startEnv.getFilePath()));
        startEnv.setOutputFilePath(outFilePath);

        return ShovelExecution.runSingle(startEnv, startEnv.getFilePath(), true).toJson();
    }

    public static Collection<String> listFiles(String url, String sha, String noCache, String noClone) {
        boolean boolNoCache = Boolean.parseBoolean(noCache);
        boolean boolNoClone = Boolean.parseBoolean(noClone);
        nand(boolNoCache, boolNoClone);
        String cacheRepositoryPath = Repo.cloneRepository(url, boolNoCache, boolNoClone);
        String pathToGitFolder = cacheRepositoryPath + "/.git";
        String repositoryName = cacheRepositoryPath.substring(cacheRepositoryPath.lastIndexOf("/") + 1);
        return Repo.getFiles(pathToGitFolder, repositoryName, sha);
    }

    public static Collection<Object> listMethods(String url, String path, String sha, String noCache, String noClone) {
        boolean boolNoCache = Boolean.parseBoolean(noCache);
        boolean boolNoClone = Boolean.parseBoolean(noClone);
        nand(boolNoCache, boolNoClone);
        String cacheRepositoryPath = Repo.cloneRepository(url, boolNoCache, boolNoClone);
        path = path.startsWith("/") ? path.substring(1) : path;
        String pathToGitFolder = cacheRepositoryPath + "/.git";
        String repositoryName = cacheRepositoryPath.substring(cacheRepositoryPath.lastIndexOf("/") + 1);
        return Parse.getMethods(pathToGitFolder, repositoryName, sha, path);
    }

    private static void nand(boolean a, boolean b) {
        if (a && b) {
            throw new IllegalArgumentException("Not possible to not clone and not use cache");
        }
    }
}
